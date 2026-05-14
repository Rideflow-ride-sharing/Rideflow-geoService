# Rideflow-geoService

Stores and queries driver locations using MongoDB 2dsphere geospatial indexing. Listens to driver.went_online/offline events to maintain an accurate pool of available drivers. Answers FIND_NEARBY_DRIVERS queries from the Matching Service with drivers sorted by proximity.
