import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { GeoService } from './geo.service';
import { LoggerService } from '../../common/logger/logger.service';
import { commands } from '../../common/constants/commands';
import { ErrorMessages, SuccessMessages } from '../../common/constants';
import { UpdateLocationDto, FindNearbyDto } from './dto';

@Controller()
export class GeoController {
  constructor(
    private readonly logger: LoggerService,
    private readonly geoService: GeoService,
  ) {}

  @MessagePattern({ cmd: commands.UPDATE_DRIVER_LOCATION })
  async handleUpdateDriverLocation(@Payload() data: UpdateLocationDto) {
    try {

      this.logger.log(
        `Received request to update driver location: ${JSON.stringify({ driverId: data.driverId, latitude: data.latitude, longitude: data.longitude })}`,
        'Geo Service - handleUpdateDriverLocation',
      );

      const result = await this.geoService.updateDriverLocation(data);

      this.logger.log(
        `Driver location updated successfully: ${data.driverId}`,
        'Geo Service - handleUpdateDriverLocation',
      );

      return {
        data: result,
        message: SuccessMessages.DRIVER_LOCATION_UPDATED,
      };
    } catch (error) {

      this.logger.error(
        `Error in updating driver location: ${JSON.stringify(error)}`,
        error.stack,
        'Geo Service - handleUpdateDriverLocation',
      );

      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || ErrorMessages.INTERNAL_LOCATION_UPDATE,
      });
    }
  }

  @MessagePattern({ cmd: commands.FIND_NEARBY_DRIVERS })
  async handleFindNearbyDrivers(@Payload() data: any) {
    try {

      this.logger.log(
        `Received request to find nearby drivers: ${JSON.stringify(data)}`,
        'Geo Service - handleFindNearbyDrivers',
      );

      // Validate data exists
      if (!data) {
        throw new Error('No data received in request');
      }

      // Manually validate required fields
      if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number' || typeof data.radiusInMeters !== 'number') {
        throw new Error('Invalid data format. Required: latitude, longitude, radiusInMeters');
      }

      const result = await this.geoService.findNearbyDrivers(data as FindNearbyDto);

      this.logger.log(
        `Found ${result.length} nearby drivers`,
        'Geo Service - handleFindNearbyDrivers',
      );

      return {
        data: result,
        message: SuccessMessages.NEARBY_DRIVERS_FOUND,
      };
    } catch (error) {

      this.logger.error(
        `Error in finding nearby drivers: ${error.message || JSON.stringify(error)}`,
        error.stack,
        'Geo Service - handleFindNearbyDrivers',
      );

      throw new RpcException({
        statusCode: error.status || error.statusCode || 500,
        message: error.message || ErrorMessages.INTERNAL_NEARBY_SEARCH,
      });
    }
  }
}


