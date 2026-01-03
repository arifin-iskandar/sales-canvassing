import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  isWithinGeofence,
  formatCoordinates,
  parseCoordinates,
} from '../geo'

describe('calculateDistance', () => {
  it('should return 0 for same location', () => {
    const location = { latitude: -6.2088, longitude: 106.8456 }
    const distance = calculateDistance(location, location)
    expect(distance).toBe(0)
  })

  it('should calculate distance between two points correctly', () => {
    // Jakarta to Bandung (approximately 120-140 km)
    const jakarta = { latitude: -6.2088, longitude: 106.8456 }
    const bandung = { latitude: -6.9175, longitude: 107.6191 }
    const distance = calculateDistance(jakarta, bandung)

    // Should be approximately 120-140 km
    expect(distance).toBeGreaterThan(100000) // > 100 km
    expect(distance).toBeLessThan(150000) // < 150 km
  })

  it('should calculate short distance accurately', () => {
    // Two points approximately 100 meters apart
    const point1 = { latitude: -6.2088, longitude: 106.8456 }
    const point2 = { latitude: -6.2089, longitude: 106.8457 } // ~15m difference
    const distance = calculateDistance(point1, point2)

    expect(distance).toBeGreaterThan(10)
    expect(distance).toBeLessThan(50)
  })

  it('should handle negative coordinates', () => {
    const point1 = { latitude: -6.2088, longitude: 106.8456 }
    const point2 = { latitude: -6.2100, longitude: 106.8470 }
    const distance = calculateDistance(point1, point2)

    expect(distance).toBeGreaterThan(0)
    expect(typeof distance).toBe('number')
    expect(Number.isFinite(distance)).toBe(true)
  })

  it('should be symmetric', () => {
    const point1 = { latitude: -6.2088, longitude: 106.8456 }
    const point2 = { latitude: -6.3000, longitude: 106.9000 }

    const distance1 = calculateDistance(point1, point2)
    const distance2 = calculateDistance(point2, point1)

    expect(distance1).toBeCloseTo(distance2, 5)
  })
})

describe('isWithinGeofence', () => {
  it('should return true when within geofence', () => {
    const userLocation = { latitude: -6.2088, longitude: 106.8456 }
    const target = {
      latitude: -6.2089,
      longitude: 106.8457,
      geofenceMeters: 100,
    }

    const result = isWithinGeofence(userLocation, target)

    expect(result.isWithinGeofence).toBe(true)
    expect(result.distanceMeters).toBeLessThan(100)
  })

  it('should return false when outside geofence', () => {
    const userLocation = { latitude: -6.2088, longitude: 106.8456 }
    const target = {
      latitude: -6.3000, // ~10km away
      longitude: 106.9000,
      geofenceMeters: 50,
    }

    const result = isWithinGeofence(userLocation, target)

    expect(result.isWithinGeofence).toBe(false)
    expect(result.distanceMeters).toBeGreaterThan(50)
  })

  it('should return true when exactly at customer location', () => {
    const location = { latitude: -6.2088, longitude: 106.8456 }
    const target = {
      ...location,
      geofenceMeters: 50,
    }

    const result = isWithinGeofence(location, target)

    expect(result.isWithinGeofence).toBe(true)
    expect(result.distanceMeters).toBe(0)
  })

  it('should handle edge case at boundary', () => {
    // Create a point exactly at the geofence boundary (50m)
    const userLocation = { latitude: -6.2088, longitude: 106.8456 }
    const target = {
      latitude: -6.20835, // approximately 50m north
      longitude: 106.8456,
      geofenceMeters: 50,
    }

    const result = isWithinGeofence(userLocation, target)

    // At boundary, should be within
    expect(result.distanceMeters).toBeLessThanOrEqual(60)
  })

  it('should return distance with 2 decimal precision', () => {
    const userLocation = { latitude: -6.2088, longitude: 106.8456 }
    const target = {
      latitude: -6.2090,
      longitude: 106.8458,
      geofenceMeters: 100,
    }

    const result = isWithinGeofence(userLocation, target)

    // Check that distance is rounded to 2 decimal places
    const decimalPlaces = (result.distanceMeters.toString().split('.')[1] || '').length
    expect(decimalPlaces).toBeLessThanOrEqual(2)
  })
})

describe('formatCoordinates', () => {
  it('should format coordinates with 6 decimal places', () => {
    const coords = { latitude: -6.2088123456, longitude: 106.8456789012 }
    const formatted = formatCoordinates(coords)

    expect(formatted).toBe('-6.208812, 106.845679')
  })

  it('should handle positive coordinates', () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 }
    const formatted = formatCoordinates(coords)

    expect(formatted).toBe('37.774900, -122.419400')
  })

  it('should handle zero coordinates', () => {
    const coords = { latitude: 0, longitude: 0 }
    const formatted = formatCoordinates(coords)

    expect(formatted).toBe('0.000000, 0.000000')
  })
})

describe('parseCoordinates', () => {
  it('should parse formatted coordinates', () => {
    const result = parseCoordinates('-6.208812, 106.845679')

    expect(result).not.toBeNull()
    expect(result!.latitude).toBeCloseTo(-6.208812, 5)
    expect(result!.longitude).toBeCloseTo(106.845679, 5)
  })

  it('should parse coordinates without space', () => {
    const result = parseCoordinates('-6.208812,106.845679')

    expect(result).not.toBeNull()
    expect(result!.latitude).toBeCloseTo(-6.208812, 5)
    expect(result!.longitude).toBeCloseTo(106.845679, 5)
  })

  it('should handle positive coordinates', () => {
    const result = parseCoordinates('37.7749, -122.4194')

    expect(result).not.toBeNull()
    expect(result!.latitude).toBeCloseTo(37.7749, 4)
    expect(result!.longitude).toBeCloseTo(-122.4194, 4)
  })

  it('should return null for invalid input', () => {
    expect(parseCoordinates('invalid')).toBeNull()
    expect(parseCoordinates('')).toBeNull()
    expect(parseCoordinates('abc, def')).toBeNull()
  })

  it('should handle integer coordinates', () => {
    const result = parseCoordinates('0, 0')

    expect(result).not.toBeNull()
    expect(result!.latitude).toBe(0)
    expect(result!.longitude).toBe(0)
  })
})

describe('real-world scenarios', () => {
  describe('Indonesian locations', () => {
    const locations = {
      // Jakarta landmarks
      monasJakarta: { latitude: -6.1754, longitude: 106.8272 },
      kotaTuaJakarta: { latitude: -6.1352, longitude: 106.8133 },
      // Surabaya
      tunjunganPlaza: { latitude: -7.2621, longitude: 112.7382 },
      // Customer locations (simulated)
      customer1: { latitude: -6.2088, longitude: 106.8456, geofenceMeters: 50 },
      customer2: { latitude: -6.2100, longitude: 106.8470, geofenceMeters: 100 },
    }

    it('should calculate distance between Jakarta landmarks', () => {
      const distance = calculateDistance(
        locations.monasJakarta,
        locations.kotaTuaJakarta
      )

      // Monas to Kota Tua is approximately 5 km
      expect(distance).toBeGreaterThan(4000)
      expect(distance).toBeLessThan(6000)
    })

    it('should detect salesperson at customer location', () => {
      const salesLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
      }

      const result = isWithinGeofence(salesLocation, locations.customer1)

      expect(result.isWithinGeofence).toBe(true)
      expect(result.distanceMeters).toBe(0)
    })

    it('should detect salesperson near customer (within 50m)', () => {
      const salesLocation = {
        latitude: -6.2089, // slightly different
        longitude: 106.8457,
      }

      const result = isWithinGeofence(salesLocation, locations.customer1)

      expect(result.isWithinGeofence).toBe(true)
      expect(result.distanceMeters).toBeLessThan(50)
    })

    it('should reject salesperson far from customer', () => {
      const salesLocation = {
        latitude: -6.2200, // about 1.2km away
        longitude: 106.8600,
      }

      const result = isWithinGeofence(salesLocation, locations.customer1)

      expect(result.isWithinGeofence).toBe(false)
      expect(result.distanceMeters).toBeGreaterThan(1000)
    })
  })

  describe('anti-fraud detection', () => {
    it('should flag check-in that is too far from customer', () => {
      const customerLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        geofenceMeters: 50,
      }

      // Salesperson claims to be at customer but GPS shows different location
      const actualLocation = {
        latitude: -6.2150, // ~700m away
        longitude: 106.8500,
      }

      const result = isWithinGeofence(actualLocation, customerLocation)

      // This should be flagged as suspicious
      expect(result.isWithinGeofence).toBe(false)
      expect(result.distanceMeters).toBeGreaterThan(500)
    })

    it('should validate legitimate check-in', () => {
      const customerLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        geofenceMeters: 50,
      }

      // GPS shows salesperson is at the customer location
      const actualLocation = {
        latitude: -6.20883,
        longitude: 106.84562,
      }

      const result = isWithinGeofence(actualLocation, customerLocation)

      expect(result.isWithinGeofence).toBe(true)
      expect(result.distanceMeters).toBeLessThan(10)
    })
  })
})
