import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '../../../common/logger/logger.service';
import { Events } from '../../../common/constants/events';
import { GeoService } from '../geo.service';

/**
 * Syncs driver online/offline with geo availability so findNearby matches driver-service state.
 */
@Controller()
export class DriverEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly geoService: GeoService,
  ) {}

  @EventPattern(Events.DRIVER_WENT_ONLINE)
  async handleDriverWentOnline(@Payload() event: { driverId: string; vehicleType: string; timestamp: Date }) {
    this.logger.log(
      `Driver ${event.driverId} went online. Re-enabling in geo pool if location exists.`,
      'Geo Service - DriverEventsListener',
    );
    await this.geoService.markDriverAvailableForMatching(event.driverId);
  }

  @EventPattern(Events.DRIVER_WENT_OFFLINE)
  async handleDriverWentOffline(@Payload() event: { driverId: string; timestamp: Date }) {
    this.logger.log(
      `Driver ${event.driverId} went offline. Excluding from nearby search.`,
      'Geo Service - DriverEventsListener',
    );
    await this.geoService.markDriverUnavailableForMatching(event.driverId);
  }
}


