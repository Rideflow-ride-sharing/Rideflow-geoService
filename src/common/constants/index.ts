// Common constants for the Geo Service microservice

export const EnvConstants = {
  appName: process.env.APP_NAME,
  environment: process.env.NODE_ENV,
  rabbitMQUrl: process.env.RABBITMQ_URL,
};

export const Service = {
  status: {
    up: 'up',
    down: 'down',
  },
  GEO_SERVICE: 'GEO_SERVICE',
};

export const Queue = {
  GEO_SERVICE: 'geo_service_queue',
};

export const ErrorMessages = {
  // Geo location related errors
  DRIVER_LOCATION_NOT_FOUND: 'Driver location not found',
  INVALID_LOCATION_DATA: 'Invalid location data',
  INVALID_COORDINATES: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude must be between -180 and 180',
  INVALID_RADIUS: 'Invalid search radius. Radius must be greater than 0',
  INTERNAL_LOCATION_UPDATE: 'Internal server error occurred while updating driver location',
  INTERNAL_NEARBY_SEARCH: 'Internal server error occurred while searching for nearby drivers',
};

export const SuccessMessages = {
  DRIVER_LOCATION_UPDATED: 'Driver location updated successfully',
  NEARBY_DRIVERS_FOUND: 'Nearby drivers found successfully',
};

// Constants for ETA calculation (average speed in km/h)
export const AVERAGE_SPEED_KMH = 30; // Average city driving speed






