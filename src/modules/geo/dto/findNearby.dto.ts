import { IsNumber, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';

export class FindNearbyDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(0.001)
  @IsNotEmpty()
  radiusInMeters: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}


