import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}


