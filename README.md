# Geo Service

## Overview

The Geo Service handles all location-based operations in the Uber-like ride-sharing platform. It manages driver locations, finds nearby drivers, and provides geospatial queries essential for matching riders with drivers.

## Role in the System

The Geo Service is the **location intelligence** layer, providing:
- Real-time driver location tracking
- Nearby driver discovery based on geographic proximity
- Geospatial queries for finding drivers within a radius
- Location-based services for the entire platform

## Key Responsibilities

### Driver Location Management
- **Location Updates**: Receives and stores driver location updates
- **Location Queries**: Provides fast queries for driver locations
- **Geospatial Indexing**: Uses MongoDB geospatial indexes for efficient location queries

### Nearby Driver Discovery
- **Radius Search**: Finds all drivers within a specified radius of a location
- **Distance Calculation**: Calculates distances between locations
- **Location Filtering**: Filters drivers based on geographic criteria

### Event Listening
The service listens to driver events to maintain accurate availability:
- **Driver Goes Online**: Adds driver to available pool
- **Driver Goes Offline**: Removes driver from available pool
- **Trip Assigned**: Updates driver status (no longer available)
- **Trip Released**: Updates driver status (becomes available)

## Service Interactions

- **Receives Commands From**: API Gateway, Matching Service
- **Listens To Events From**: Driver Service (via RabbitMQ events)
- **Provides**: Driver location updates, nearby driver searches
- **Communicates With**: Matching Service (for driver discovery)

## Use Cases

1. **Driver Location Update**: Driver's app sends location updates
2. **Find Nearby Drivers**: Rider needs a ride, service finds drivers nearby
3. **Driver Availability**: Tracks which drivers are available in which areas
4. **Geographic Queries**: Various location-based queries for analytics

## Data Stored

- Driver ID
- Current location (latitude, longitude)
- Last updated timestamp
- Availability status

## Geospatial Features

- Uses MongoDB 2dsphere indexes for efficient geospatial queries
- Supports radius-based searches
- Calculates distances between points
- Handles location updates in real-time

## Health Check

- `GET /health` - Basic health status
- `GET /health/ready` - Readiness check (database connection)
- `GET /health/live` - Liveness check

## Environment Variables

- `HTTP_PORT`: HTTP server port for health checks (default: 3004)
- `RABBITMQ_URL`: RabbitMQ connection URL
- `MONGODB_URI`: MongoDB connection string


