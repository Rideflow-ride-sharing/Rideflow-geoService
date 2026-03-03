import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '../../../common/logger/logger.service';
import { Events } from '../../../common/constants/events';

/**
 * Event Listener for Driver Events
 * Listens to driver.online/offline events to update driver availability
 */
@Controller()
export class DriverEventsListener {
  constructor(private readonly logger: LoggerService) {}

  @EventPattern(Events.DRIVER_WENT_ONLINE)
  async handleDriverWentOnline(@Payload() event: { driverId: string; vehicleType: string; timestamp: Date }) {
    this.logger.log(
      `Driver ${event.driverId} went online. Updating geo service availability.`,
      'Geo Service - DriverEventsListener',
    );

    // Here you would update the driver's location/availability in the geo service
    // This is async and doesn't block the driver service
    // Example: Mark driver as available for matching
  }

  @EventPattern(Events.DRIVER_WENT_OFFLINE)
  async handleDriverWentOffline(@Payload() event: { driverId: string; timestamp: Date }) {
    this.logger.log(
      `Driver ${event.driverId} went offline. Removing from available drivers.`,
      'Geo Service - DriverEventsListener',
    );

    // Here you would remove the driver from available drivers list
    // Example: Remove driver from matching pool
  }
}


