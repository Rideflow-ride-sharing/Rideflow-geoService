import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { LoggerService } from '../../common/logger/logger.service';
import { DriverEventsListener } from './listeners/driver-events.listener';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DriverLocation, DriverLocationSchema } from './schemas';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: DriverLocation.name, schema: DriverLocationSchema },
    ]),
  ],
  controllers: [GeoController, DriverEventsListener],
  providers: [GeoService, LoggerService, RedisService],
  exports: [GeoService],
})
export class GeoModule {}





