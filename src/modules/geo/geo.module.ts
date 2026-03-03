import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { LoggerService } from '../../common/logger/logger.service';
import { DriverEventsListener } from './listeners/driver-events.listener';
import { DriverLocation, DriverLocationSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DriverLocation.name, schema: DriverLocationSchema },
    ]),
  ],
  controllers: [GeoController, DriverEventsListener],
  providers: [GeoService, LoggerService],
  exports: [GeoService],
})
export class GeoModule {}





