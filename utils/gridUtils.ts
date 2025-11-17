/**
 * Grid Utilities for Realm Walker
 * 
 * Converts GPS coordinates to grid cell IDs and vice versa.
 * Grid size: 20m x 20m cells
 * Cell ID format: "lat_lon" with 4 decimal places
 * 
 * Note: 4 decimal places ≈ 11.1m precision at equator
 * This provides adequate resolution for 20m x 20m grid cells
 */

// Earth constants
const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters
const METERS_PER_DEGREE_LAT = 111320; // Constant at all latitudes
const GRID_SIZE_METERS = 20; // 20m x 20m grid cells
const DECIMAL_PRECISION = 4; // Rounds to ~11m at equator

/**
 * Convert GPS coordinates to grid cell ID
 * 
 * @param latitude - Latitude in decimal degrees (-90 to 90)
 * @param longitude - Longitude in decimal degrees (-180 to 180)
 * @returns Cell ID in format "lat_lon" (e.g., "40.7128_-74.0060")
 * 
 * @example
 * ```ts
 * latLonToGridCell(40.7128, -74.0060)  // Returns: "40.7128_-74.0060"
 * latLonToGridCell(40.71278, -74.00604) // Returns: "40.7128_-74.0060" (rounded)
 * latLonToGridCell(-33.8688, 151.2093) // Returns: "-33.8688_151.2093" (Sydney)
 * ```
 */
export function latLonToGridCell(latitude: number, longitude: number): string {
  // Validate inputs
  if (latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
  }

  // Calculate meters per degree at this latitude
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);

  // Calculate how many degrees correspond to GRID_SIZE_METERS
  const latDegreesPerGrid = GRID_SIZE_METERS / METERS_PER_DEGREE_LAT;
  const lonDegreesPerGrid = GRID_SIZE_METERS / metersPerDegreeLon;

  // Snap to grid by rounding to nearest grid cell center
  const gridLat = Math.floor(latitude / latDegreesPerGrid) * latDegreesPerGrid + latDegreesPerGrid / 2;
  const gridLon = Math.floor(longitude / lonDegreesPerGrid) * lonDegreesPerGrid + lonDegreesPerGrid / 2;

  // Round to 4 decimal places for cell ID
  const latRounded = parseFloat(gridLat.toFixed(DECIMAL_PRECISION));
  const lonRounded = parseFloat(gridLon.toFixed(DECIMAL_PRECISION));

  return `${latRounded}_${lonRounded}`;
}

/**
 * Simple version: Just round coordinates to 4 decimal places
 * Use this if you want exact coordinate rounding without grid snapping
 * 
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 * @returns Cell ID with rounded coordinates
 */
export function latLonToGridCellSimple(latitude: number, longitude: number): string {
  const latRounded = parseFloat(latitude.toFixed(DECIMAL_PRECISION));
  const lonRounded = parseFloat(longitude.toFixed(DECIMAL_PRECISION));
  return `${latRounded}_${lonRounded}`;
}

/**
 * Parse cell ID back to lat/lon coordinates
 * 
 * @param cellId - Cell ID in format "lat_lon"
 * @returns Object with latitude and longitude
 * 
 * @example
 * ```ts
 * parseCellId("40.7128_-74.0060") // Returns: { latitude: 40.7128, longitude: -74.0060 }
 * ```
 */
export function parseCellId(cellId: string): { latitude: number; longitude: number } {
  const parts = cellId.split('_');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid cell ID format: ${cellId}. Expected format: "lat_lon"`);
  }

  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error(`Invalid cell ID coordinates: ${cellId}`);
  }

  return { latitude, longitude };
}

/**
 * Get bounding box (bounds) for a grid cell
 * Returns the corner coordinates of the 20m x 20m cell
 * 
 * @param cellId - Cell ID in format "lat_lon"
 * @returns Bounding box with north, south, east, west coordinates
 * 
 * @example
 * ```ts
 * gridCellToBounds("40.7128_-74.0060")
 * // Returns: {
 * //   north: 40.7129,
 * //   south: 40.7127,
 * //   east: -74.0059,
 * //   west: -74.0061,
 * //   center: { latitude: 40.7128, longitude: -74.0060 }
 * // }
 * ```
 */
export function gridCellToBounds(cellId: string): {
  north: number;
  south: number;
  east: number;
  west: number;
  center: { latitude: number; longitude: number };
} {
  const { latitude, longitude } = parseCellId(cellId);

  // Calculate degrees for half of grid size (10m)
  const halfGridMeters = GRID_SIZE_METERS / 2;
  const latDegreesHalf = halfGridMeters / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
  const lonDegreesHalf = halfGridMeters / metersPerDegreeLon;

  return {
    north: latitude + latDegreesHalf,
    south: latitude - latDegreesHalf,
    east: longitude + lonDegreesHalf,
    west: longitude - lonDegreesHalf,
    center: { latitude, longitude },
  };
}

/**
 * Get all neighboring cell IDs (8 cells surrounding the center cell)
 * 
 * @param cellId - Cell ID in format "lat_lon"
 * @returns Array of 8 neighboring cell IDs
 * 
 * @example
 * ```ts
 * getNeighboringCells("40.7128_-74.0060")
 * // Returns array of 8 cell IDs around the center cell
 * ```
 */
export function getNeighboringCells(cellId: string): string[] {
  const { latitude, longitude } = parseCellId(cellId);
  
  // Calculate offset for one grid cell
  const latOffset = GRID_SIZE_METERS / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
  const lonOffset = GRID_SIZE_METERS / metersPerDegreeLon;

  const neighbors: string[] = [];

  // 8 directions: N, NE, E, SE, S, SW, W, NW
  const offsets = [
    [latOffset, 0],          // N
    [latOffset, lonOffset],  // NE
    [0, lonOffset],          // E
    [-latOffset, lonOffset], // SE
    [-latOffset, 0],         // S
    [-latOffset, -lonOffset],// SW
    [0, -lonOffset],         // W
    [latOffset, -lonOffset], // NW
  ];

  for (const [latDelta, lonDelta] of offsets) {
    const newLat = latitude + latDelta;
    const newLon = longitude + lonDelta;
    
    // Handle longitude wrapping at international date line
    let normalizedLon = newLon;
    if (normalizedLon > 180) normalizedLon -= 360;
    if (normalizedLon < -180) normalizedLon += 360;
    
    // Skip if latitude goes out of bounds
    if (newLat < -90 || newLat > 90) continue;
    
    neighbors.push(latLonToGridCellSimple(newLat, normalizedLon));
  }

  return neighbors;
}

/**
 * Get all cells within a radius (in meters) of a center point
 * 
 * @param latitude - Center latitude
 * @param longitude - Center longitude
 * @param radiusMeters - Radius in meters
 * @returns Array of cell IDs within radius
 * 
 * @example
 * ```ts
 * getCellsInRadius(40.7128, -74.0060, 100) // Returns cells within 100m
 * ```
 */
export function getCellsInRadius(
  latitude: number,
  longitude: number,
  radiusMeters: number
): string[] {
  const cells: string[] = [];
  const centerCell = latLonToGridCell(latitude, longitude);
  cells.push(centerCell);

  // Calculate how many grid cells to check in each direction
  const gridRadius = Math.ceil(radiusMeters / GRID_SIZE_METERS);

  const latDegreesPerGrid = GRID_SIZE_METERS / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
  const lonDegreesPerGrid = GRID_SIZE_METERS / metersPerDegreeLon;

  // Check all cells in a square around the center
  for (let latStep = -gridRadius; latStep <= gridRadius; latStep++) {
    for (let lonStep = -gridRadius; lonStep <= gridRadius; lonStep++) {
      // Skip center cell (already added)
      if (latStep === 0 && lonStep === 0) continue;

      const newLat = latitude + latStep * latDegreesPerGrid;
      const newLon = longitude + lonStep * lonDegreesPerGrid;

      // Check if within valid bounds
      if (newLat < -90 || newLat > 90) continue;

      // Handle longitude wrapping
      let normalizedLon = newLon;
      if (normalizedLon > 180) normalizedLon -= 360;
      if (normalizedLon < -180) normalizedLon += 360;

      // Calculate actual distance to see if within radius
      const distance = calculateDistance(latitude, longitude, newLat, normalizedLon);
      
      if (distance <= radiusMeters) {
        const cellId = latLonToGridCell(newLat, normalizedLon);
        if (!cells.includes(cellId)) {
          cells.push(cellId);
        }
      }
    }
  }

  return cells;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a point is within the bounds of a grid cell
 * 
 * @param latitude - Point latitude
 * @param longitude - Point longitude
 * @param cellId - Cell ID to check
 * @returns True if point is within cell bounds
 */
export function isPointInCell(latitude: number, longitude: number, cellId: string): boolean {
  const bounds = gridCellToBounds(cellId);
  
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

/**
 * Normalize longitude to -180 to 180 range
 * Handles international date line wrapping
 * 
 * @param longitude - Longitude to normalize
 * @returns Normalized longitude between -180 and 180
 */
export function normalizeLongitude(longitude: number): number {
  let normalized = longitude;
  
  while (normalized > 180) {
    normalized -= 360;
  }
  
  while (normalized < -180) {
    normalized += 360;
  }
  
  return normalized;
}

/**
 * Get precision information for a given latitude
 * Shows how many meters correspond to decimal degree precision
 * 
 * @param latitude - Latitude to calculate precision for
 * @returns Object with precision info
 */
export function getPrecisionInfo(latitude: number): {
  oneDegreeLatMeters: number;
  oneDegreeLonMeters: number;
  oneDecimalDegreeLatMeters: number;
  oneDecimalDegreeLonMeters: number;
  fourDecimalLatMeters: number;
  fourDecimalLonMeters: number;
} {
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
  
  return {
    oneDegreeLatMeters: METERS_PER_DEGREE_LAT,
    oneDegreeLonMeters: metersPerDegreeLon,
    oneDecimalDegreeLatMeters: METERS_PER_DEGREE_LAT / 10,
    oneDecimalDegreeLonMeters: metersPerDegreeLon / 10,
    fourDecimalLatMeters: METERS_PER_DEGREE_LAT / 10000, // ~11.1m
    fourDecimalLonMeters: metersPerDegreeLon / 10000,    // ~11.1m at equator
  };
}

// Export constants for external use
export const CONSTANTS = {
  EARTH_RADIUS_METERS,
  METERS_PER_DEGREE_LAT,
  GRID_SIZE_METERS,
  DECIMAL_PRECISION,
};
