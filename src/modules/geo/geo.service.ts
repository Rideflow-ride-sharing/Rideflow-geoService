import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggerService } from '../../common/logger/logger.service';
import { ErrorMessages, SuccessMessages, AVERAGE_SPEED_KMH } from '../../common/constants';
import { DriverLocation, DriverLocationDocument } from './schemas';
import { UpdateLocationDto, FindNearbyDto } from './dto';

@Injectable()
export class GeoService {
  constructor(
    @InjectModel(DriverLocation.name)
    private driverLocationModel: Model<DriverLocationDocument>,
    private readonly logger: LoggerService,
  ) {}

  async updateDriverLocation(data: UpdateLocationDto) {

    this.logger.log(
      `Updating driver location: ${data.driverId} at [${data.latitude}, ${data.longitude}]`,
      'Geo Service - updateDriverLocation',
    );

    // Validate coordinates
    if (
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new BadRequestException(ErrorMessages.INVALID_COORDINATES);
    }

    // Update or create driver location
    const location = await this.driverLocationModel.findOneAndUpdate(
      { driverId: data.driverId },
      {
        driverId: data.driverId,
        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude], // GeoJSON format: [longitude, latitude]
        },
        updatedAt: new Date(),
        availableForMatching: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    return {
      driverId: location.driverId,
      latitude: location.location.coordinates[1],
      longitude: location.location.coordinates[0],
      updatedAt: location.updatedAt,
    };
  }

  async findNearbyDrivers(data: FindNearbyDto) {

    this.logger.log(
      `Finding nearby drivers at [${data.latitude}, ${data.longitude}] within ${data.radiusInMeters}m`,
      'Geo Service - findNearbyDrivers',
    );

    // Validate coordinates
    if (
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new BadRequestException(ErrorMessages.INVALID_COORDINATES);
    }

    // Validate radius
    if (data.radiusInMeters <= 0) {
      throw new BadRequestException(ErrorMessages.INVALID_RADIUS);
    }

    const limit = data.limit || 10;

    // Convert radius from meters to radians (Earth's radius in meters: 6371000)
    const radiusInRadians = data.radiusInMeters / 6371000;

    // Find nearby drivers using geospatial query
    const nearbyDrivers = await this.driverLocationModel
      .find({
        availableForMatching: { $ne: false },
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
            $maxDistance: data.radiusInMeters,
          },
        },
      })
      .limit(limit)
      .lean();

    // Calculate distance and ETA for each driver
    const results = nearbyDrivers.map((driver) => {
      const distanceInMeters = this.calculateDistance(
        data.latitude,
        data.longitude,
        driver.location.coordinates[1],
        driver.location.coordinates[0],
      );

      const etaInMinutes = this.calculateETA(distanceInMeters);

      return {
        driverId: driver.driverId,
        distanceInMeters: Math.round(distanceInMeters),
        etaInMinutes: Math.round(etaInMinutes * 10) / 10, // Round to 1 decimal place
      };
    });

    // Sort by distance (already sorted by MongoDB, but ensure it)
    results.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

    return results;
  }

  /**
   * Count drivers available for matching near a point (same rules as findNearby, no limit cap).
   */
  async countAvailableDrivers(data: FindNearbyDto): Promise<{ count: number }> {
    if (
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      throw new BadRequestException(ErrorMessages.INVALID_COORDINATES);
    }
    if (data.radiusInMeters <= 0) {
      throw new BadRequestException(ErrorMessages.INVALID_RADIUS);
    }

    const count = await this.driverLocationModel.countDocuments({
      availableForMatching: { $ne: false },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [data.longitude, data.latitude],
          },
          $maxDistance: data.radiusInMeters,
        },
      },
    });

    this.logger.log(
      `Counted ${count} available drivers near [${data.latitude}, ${data.longitude}] (${data.radiusInMeters}m)`,
      'Geo Service - countAvailableDrivers',
    );

    return { count };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate Estimated Time of Arrival (ETA) in minutes
   * Based on average speed
   */
  private calculateETA(distanceInMeters: number): number {
    const distanceInKm = distanceInMeters / 1000;
    const timeInHours = distanceInKm / AVERAGE_SPEED_KMH;
    const timeInMinutes = timeInHours * 60;
    return timeInMinutes;
  }

  /**
   * Driver went online: include existing location in matching again (no GPS in event).
   * New drivers still need at least one update-location to create a geo document.
   */
  async markDriverAvailableForMatching(driverId: string): Promise<void> {
    const result = await this.driverLocationModel.updateOne(
      { driverId },
      { $set: { availableForMatching: true, updatedAt: new Date() } },
    );
    if (result.matchedCount === 0) {
      this.logger.log(
        `Driver ${driverId} online: no geo document yet (waiting for update-location).`,
        'Geo Service - markDriverAvailableForMatching',
      );
    }
  }

  /**
   * Driver went offline: hide from nearby search but keep last coordinates for when they return.
   */
  async markDriverUnavailableForMatching(driverId: string): Promise<void> {
    await this.driverLocationModel.updateOne(
      { driverId },
      { $set: { availableForMatching: false, updatedAt: new Date() } },
    );
  }
}






