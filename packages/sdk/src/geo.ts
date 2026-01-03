/**
 * Geolocation utilities for distance calculation and geofence validation
 */

export type Coordinates = {
  latitude: number
  longitude: number
}

export type GeofenceResult = {
  isWithinGeofence: boolean
  distanceMeters: number
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates,
): number {
  const R = 6371000 // Earth's radius in meters

  const lat1Rad = toRadians(from.latitude)
  const lat2Rad = toRadians(to.latitude)
  const deltaLat = toRadians(to.latitude - from.latitude)
  const deltaLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if a location is within the geofence of a target
 */
export function isWithinGeofence(
  userLocation: Coordinates,
  target: Coordinates & { geofenceMeters: number },
): GeofenceResult {
  const distanceMeters = calculateDistance(userLocation, target)
  return {
    isWithinGeofence: distanceMeters <= target.geofenceMeters,
    distanceMeters: Math.round(distanceMeters * 100) / 100,
  }
}

/**
 * Format coordinates as a string (for display)
 */
export function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
}

/**
 * Parse coordinate string back to Coordinates object
 */
export function parseCoordinates(str: string): Coordinates | null {
  const match = str.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
  if (!match) return null
  return {
    latitude: parseFloat(match[1]),
    longitude: parseFloat(match[2]),
  }
}
