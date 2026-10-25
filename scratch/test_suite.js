import { isRouteActive } from '../frontend/src/utils/routeUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: AeroSync AI Navigation, Flights & Map ===\n');

// 1. Navigation Route Matching Tests
console.log('Test Group 1: Navigation Route Matching & Sandbox Isolation');
assert(isRouteActive('/recovery-sandbox', '/recovery-sandbox') === true, 'Sandbox highlights /recovery-sandbox');
assert(isRouteActive('/recovery-sandbox', '/recovery') === false, 'Sandbox DOES NOT highlight /recovery');
assert(isRouteActive('/recovery', '/recovery') === true, 'Recovery Plan highlights /recovery');
assert(isRouteActive('/recovery', '/recovery-sandbox') === false, 'Recovery Plan DOES NOT highlight /recovery-sandbox');
assert(isRouteActive('/flights', '/flights') === true, 'Flights highlights /flights');
assert(isRouteActive('/flights/FL-101', '/flights') === true, 'Child route /flights/FL-101 highlights /flights');
assert(isRouteActive('/flights', '/recovery') === false, 'Flights DOES NOT highlight /recovery');
assert(isRouteActive('/dashboard', '/flights') === false, 'Dashboard DOES NOT highlight /flights');

// 2. Flight Search and Filter Rules
console.log('\nTest Group 2: Flights Search & Filter Logic');
const mockFlights = [
  { flightNumber: '6E 1234', origin: 'DEL', destination: 'BOM', status: 'Delayed', delayMinutes: 90, airline: 'IndiGo' },
  { flightNumber: 'AI 201', origin: 'DEL', destination: 'LHR', status: 'On Time', delayMinutes: 0, airline: 'Air India' },
  { flightNumber: 'SG 89', origin: 'MAA', destination: 'DEL', status: 'Boarding', delayMinutes: 10, airline: 'SpiceJet' }
];

const filterByTerm = (list, term) => list.filter(f => 
  f.flightNumber.toLowerCase().includes(term.toLowerCase()) || 
  f.origin.toLowerCase().includes(term.toLowerCase()) ||
  f.destination.toLowerCase().includes(term.toLowerCase())
);
assert(filterByTerm(mockFlights, '6e').length === 1, 'Search by flight number "6e" finds 1 flight');
assert(filterByTerm(mockFlights, 'DEL').length === 3, 'Search by hub "DEL" finds all 3 flights connected to DEL');
assert(filterByTerm(mockFlights, 'XYZ').length === 0, 'Search for non-existent "XYZ" returns 0 flights');

// 3. Map Coordinate Validation & Bearing Calculation
console.log('\nTest Group 3: Map Coordinate Validation & Aircraft Bearing');
function isValidCoordinate(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' && 
         !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

function calculateBearing(startLat, startLng, destLat, destLng) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;
  const dLng = toRad(destLng - startLng);
  const y = Math.sin(dLng) * Math.cos(toRad(destLat));
  const x =
    Math.cos(toRad(startLat)) * Math.sin(toRad(destLat)) -
    Math.sin(toRad(startLat)) * Math.cos(toRad(destLat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

assert(isValidCoordinate(28.5562, 77.1000) === true, 'Delhi airport coordinates are valid');
assert(isValidCoordinate(-33.9399, 151.1753) === true, 'Sydney airport coordinates are valid');
assert(isValidCoordinate(95.0, 50.0) === false, 'Latitude > 90 is invalid');
assert(isValidCoordinate(NaN, 50.0) === false, 'NaN latitude is invalid');
assert(isValidCoordinate(20.0, 200.0) === false, 'Longitude > 180 is invalid');

// Calculate heading from DEL (28.55, 77.10) to BOM (19.08, 72.86) -> should be South-Southwest (~200°-220°)
const delToBomBearing = calculateBearing(28.5562, 77.1000, 19.0896, 72.8656);
assert(delToBomBearing > 190 && delToBomBearing < 230, `Bearing DEL -> BOM is realistic (${delToBomBearing.toFixed(1)}°)`);

// Calculate heading from DEL (28.55, 77.10) to LHR (51.47, -0.45) -> should be West-Northwest (~300°-330°)
const delToLhrBearing = calculateBearing(28.5562, 77.1000, 51.4700, -0.4543);
assert(delToLhrBearing > 300 && delToLhrBearing < 330, `Bearing DEL -> LHR is realistic (${delToLhrBearing.toFixed(1)}°)`);

console.log(`\n==================================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`==================================================`);

process.exit(failed > 0 ? 1 : 0);
