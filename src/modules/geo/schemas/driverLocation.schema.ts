import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverLocationDocument = DriverLocation & Document;

@Schema({ timestamps: true })
export class DriverLocation {
  @Prop({ required: true, unique: true, index: true })
  driverId: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DriverLocationSchema = SchemaFactory.createForClass(DriverLocation);

// Create 2dsphere index for geospatial queries
DriverLocationSchema.index({ location: '2dsphere' });

