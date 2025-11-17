/**
 * Grid Utils Test Examples
 * Demonstrates grid cell conversion for major cities worldwide
 */

import {
    calculateDistance,
    CONSTANTS,
    getCellsInRadius,
    getNeighboringCells,
    getPrecisionInfo,
    gridCellToBounds,
    isPointInCell,
    latLonToGridCell,
    latLonToGridCellSimple,
    normalizeLongitude,
    parseCellId,
} from './gridUtils';

console.log('='.repeat(60));
console.log('REALM WALKER - GRID UTILITIES TEST');
console.log('='.repeat(60));

// ============================================
// 1. NEW YORK CITY (Times Square)
// ============================================
console.log('\n📍 NEW YORK CITY (Times Square)');
console.log('-'.repeat(60));

const nycLat = 40.758896;
const nycLon = -73.985130;

const nycCell = latLonToGridCell(nycLat, nycLon);
console.log(`Original coordinates: ${nycLat}, ${nycLon}`);
console.log(`Grid Cell ID: ${nycCell}`);

const nycBounds = gridCellToBounds(nycCell);
console.log('\nCell Bounds (20m x 20m):');
console.log(`  North: ${nycBounds.north.toFixed(6)}`);
console.log(`  South: ${nycBounds.south.toFixed(6)}`);
console.log(`  East:  ${nycBounds.east.toFixed(6)}`);
console.log(`  West:  ${nycBounds.west.toFixed(6)}`);
console.log(`  Center: ${nycBounds.center.latitude}, ${nycBounds.center.longitude}`);

const nycPrecision = getPrecisionInfo(nycLat);
console.log('\nPrecision at this latitude:');
console.log(`  4 decimal places = ~${nycPrecision.fourDecimalLatMeters.toFixed(2)}m (latitude)`);
console.log(`  4 decimal places = ~${nycPrecision.fourDecimalLonMeters.toFixed(2)}m (longitude)`);

// ============================================
// 2. TOKYO (Shibuya Crossing)
// ============================================
console.log('\n\n📍 TOKYO (Shibuya Crossing)');
console.log('-'.repeat(60));

const tokyoLat = 35.659503;
const tokyoLon = 139.700455;

const tokyoCell = latLonToGridCell(tokyoLat, tokyoLon);
console.log(`Original coordinates: ${tokyoLat}, ${tokyoLon}`);
console.log(`Grid Cell ID: ${tokyoCell}`);

const tokyoBounds = gridCellToBounds(tokyoCell);
console.log('\nCell Bounds (20m x 20m):');
console.log(`  North: ${tokyoBounds.north.toFixed(6)}`);
console.log(`  South: ${tokyoBounds.south.toFixed(6)}`);
console.log(`  East:  ${tokyoBounds.east.toFixed(6)}`);
console.log(`  West:  ${tokyoBounds.west.toFixed(6)}`);

const tokyoPrecision = getPrecisionInfo(tokyoLat);
console.log('\nPrecision at this latitude:');
console.log(`  4 decimal places = ~${tokyoPrecision.fourDecimalLatMeters.toFixed(2)}m (latitude)`);
console.log(`  4 decimal places = ~${tokyoPrecision.fourDecimalLonMeters.toFixed(2)}m (longitude)`);

// ============================================
// 3. SYDNEY (Opera House)
// ============================================
console.log('\n\n📍 SYDNEY (Opera House)');
console.log('-'.repeat(60));

const sydneyLat = -33.856784;
const sydneyLon = 151.215297;

const sydneyCell = latLonToGridCell(sydneyLat, sydneyLon);
console.log(`Original coordinates: ${sydneyLat}, ${sydneyLon}`);
console.log(`Grid Cell ID: ${sydneyCell}`);

const sydneyBounds = gridCellToBounds(sydneyCell);
console.log('\nCell Bounds (20m x 20m):');
console.log(`  North: ${sydneyBounds.north.toFixed(6)}`);
console.log(`  South: ${sydneyBounds.south.toFixed(6)}`);
console.log(`  East:  ${sydneyBounds.east.toFixed(6)}`);
console.log(`  West:  ${sydneyBounds.west.toFixed(6)}`);

const sydneyPrecision = getPrecisionInfo(sydneyLat);
console.log('\nPrecision at this latitude (Southern Hemisphere):');
console.log(`  4 decimal places = ~${sydneyPrecision.fourDecimalLatMeters.toFixed(2)}m (latitude)`);
console.log(`  4 decimal places = ~${sydneyPrecision.fourDecimalLonMeters.toFixed(2)}m (longitude)`);

// ============================================
// 4. EDGE CASES
// ============================================
console.log('\n\n🌐 EDGE CASES');
console.log('-'.repeat(60));

// International Date Line
console.log('\n1. International Date Line (Fiji):');
const fijiLat = -18.1416;
const fijiLon = 178.4419;
const fijiCell = latLonToGridCell(fijiLat, fijiLon);
console.log(`   Coordinates: ${fijiLat}, ${fijiLon}`);
console.log(`   Cell ID: ${fijiCell}`);

// Near Date Line (crossing)
const crossLon1 = 179.9999;
const crossLon2 = -179.9999;
console.log(`\n2. Longitude normalization:`);
console.log(`   ${crossLon1} normalized: ${normalizeLongitude(crossLon1)}`);
console.log(`   ${crossLon2} normalized: ${normalizeLongitude(crossLon2)}`);
console.log(`   ${190} normalized: ${normalizeLongitude(190)}`);
console.log(`   ${-190} normalized: ${normalizeLongitude(-190)}`);

// Equator
console.log('\n3. Equator (Galapagos Islands):');
const equatorLat = 0.0;
const equatorLon = -91.0;
const equatorCell = latLonToGridCell(equatorLat, equatorLon);
console.log(`   Coordinates: ${equatorLat}, ${equatorLon}`);
console.log(`   Cell ID: ${equatorCell}`);

// North Pole region
console.log('\n4. High Latitude (Svalbard, Norway):');
const arcticLat = 78.2232;
const arcticLon = 15.6267;
const arcticCell = latLonToGridCell(arcticLat, arcticLon);
console.log(`   Coordinates: ${arcticLat}, ${arcticLon}`);
console.log(`   Cell ID: ${arcticCell}`);
const arcticPrecision = getPrecisionInfo(arcticLat);
console.log(`   4 decimal longitude = ~${arcticPrecision.fourDecimalLonMeters.toFixed(2)}m`);
console.log(`   (Note: Longitude precision decreases near poles)`);

// ============================================
// 5. FUNCTIONAL TESTS
// ============================================
console.log('\n\n🧪 FUNCTIONAL TESTS');
console.log('-'.repeat(60));

// Parse cell ID
console.log('\n1. Parse Cell ID:');
const testCell = "40.7589_-73.9851";
const parsed = parseCellId(testCell);
console.log(`   Cell ID: ${testCell}`);
console.log(`   Parsed: lat=${parsed.latitude}, lon=${parsed.longitude}`);

// Neighboring cells
console.log('\n2. Neighboring Cells (NYC):');
const neighbors = getNeighboringCells(nycCell);
console.log(`   Center cell: ${nycCell}`);
console.log(`   8 neighbors:`);
neighbors.forEach((n, i) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  console.log(`     ${directions[i]}: ${n}`);
});

// Cells in radius
console.log('\n3. Cells in 50m Radius (NYC):');
const radiusCells = getCellsInRadius(nycLat, nycLon, 50);
console.log(`   Center: ${nycLat}, ${nycLon}`);
console.log(`   Cells found: ${radiusCells.length}`);
console.log(`   Cell IDs: ${radiusCells.slice(0, 5).join(', ')}...`);

// Distance calculation
console.log('\n4. Distance Calculation:');
const dist1 = calculateDistance(nycLat, nycLon, tokyoLat, tokyoLon);
const dist2 = calculateDistance(nycLat, nycLon, sydneyLat, sydneyLon);
console.log(`   NYC to Tokyo: ${(dist1 / 1000).toFixed(0)} km`);
console.log(`   NYC to Sydney: ${(dist2 / 1000).toFixed(0)} km`);

// Point in cell check
console.log('\n5. Point in Cell Check:');
const testLat = 40.7590;
const testLon = -73.9850;
const inCell = isPointInCell(testLat, testLon, nycCell);
console.log(`   Point: ${testLat}, ${testLon}`);
console.log(`   Cell: ${nycCell}`);
console.log(`   Is in cell: ${inCell}`);

// Rounding comparison
console.log('\n6. Simple vs Grid-Snapped Rounding:');
const testLat2 = 40.71234567;
const testLon2 = -74.00987654;
const simple = latLonToGridCellSimple(testLat2, testLon2);
const snapped = latLonToGridCell(testLat2, testLon2);
console.log(`   Original: ${testLat2}, ${testLon2}`);
console.log(`   Simple rounding: ${simple}`);
console.log(`   Grid-snapped: ${snapped}`);

// ============================================
// 6. PRECISION ANALYSIS
// ============================================
console.log('\n\n📐 DECIMAL PRECISION ANALYSIS');
console.log('-'.repeat(60));

console.log('\nLatitude (constant at all locations):');
console.log('  1 decimal place  = ~11.1 km');
console.log('  2 decimal places = ~1.1 km');
console.log('  3 decimal places = ~111 m');
console.log('  4 decimal places = ~11.1 m  ✓ (Used for 20m grid)');
console.log('  5 decimal places = ~1.1 m');
console.log('  6 decimal places = ~0.11 m');

console.log('\nLongitude (varies by latitude):');
console.log('  At Equator (0°):');
console.log(`    4 decimal places = ~${getPrecisionInfo(0).fourDecimalLonMeters.toFixed(2)}m`);
console.log('  At NYC (40.76°):');
console.log(`    4 decimal places = ~${getPrecisionInfo(40.76).fourDecimalLonMeters.toFixed(2)}m`);
console.log('  At Tokyo (35.66°):');
console.log(`    4 decimal places = ~${getPrecisionInfo(35.66).fourDecimalLonMeters.toFixed(2)}m`);
console.log('  At Arctic (78°):');
console.log(`    4 decimal places = ~${getPrecisionInfo(78).fourDecimalLonMeters.toFixed(2)}m`);

console.log('\n💡 Note: 4 decimal places provides ~11m precision,');
console.log('   which is adequate for 20m x 20m grid cells.');

// ============================================
// 7. CONSTANTS
// ============================================
console.log('\n\n⚙️  CONSTANTS');
console.log('-'.repeat(60));
console.log(`Grid Size: ${CONSTANTS.GRID_SIZE_METERS}m x ${CONSTANTS.GRID_SIZE_METERS}m`);
console.log(`Decimal Precision: ${CONSTANTS.DECIMAL_PRECISION} places`);
console.log(`Earth Radius: ${CONSTANTS.EARTH_RADIUS_METERS.toLocaleString()}m`);
console.log(`Meters per Degree (Lat): ${CONSTANTS.METERS_PER_DEGREE_LAT.toLocaleString()}m`);

console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS COMPLETED');
console.log('='.repeat(60) + '\n');
