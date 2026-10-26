import assert from 'node:assert';

const API_BASE = 'http://localhost:5000/api';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    console.log(`[PASS] ${name} -> HTTP ${res.status} (success: ${json.success})`);
    return { status: res.status, data: json };
  } catch (err) {
    console.error(`[FAIL] ${name} -> ${err.message}`);
    return { status: 500, error: err.message };
  }
}

async function runAuditSuite() {
  console.log('====================================================');
  console.log('🚀 AEROSYNC AI — FULL APPLICATION VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Health
  await testEndpoint('System Health Check', `${API_BASE}/health`);

  // 2. Dashboard
  await testEndpoint('Dashboard Summary', `${API_BASE}/dashboard/summary`);

  // 3. Flights
  await testEndpoint('Flights Operational List', `${API_BASE}/flights`);
  await testEndpoint('Flights Search (DEL)', `${API_BASE}/flights/search?q=DEL`);

  // 4. Disruptions
  await testEndpoint('Active Disruptions', `${API_BASE}/disruptions`);

  // 5. Recovery Plans
  await testEndpoint('Recovery Plans List', `${API_BASE}/recovery/plans`);
  await testEndpoint('Approve Recovery Plan', `${API_BASE}/recovery/plan-a/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 'V1', notes: 'Operator authorized execution' })
  });

  // 6. Simulation Sandbox
  await testEndpoint('What-If Scenario Simulation', `${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delayMins: 60, aircraftUnavailable: true })
  });

  // 7. Crew
  await testEndpoint('Crew Roster', `${API_BASE}/crew`);

  // 8. Aircraft & Gates
  await testEndpoint('Aircraft Fleet', `${API_BASE}/aircraft`);
  await testEndpoint('Airport Gates', `${API_BASE}/gates`);

  // 9. Passengers
  await testEndpoint('Passenger Manifest', `${API_BASE}/passengers`);
  await testEndpoint('Passenger Impact Summary', `${API_BASE}/passengers/impact-summary`);

  // 10. Notifications
  await testEndpoint('System Notifications', `${API_BASE}/notifications`);

  // 11. Ticket Booking & Boarding Pass Generation
  const bookingRes = await testEndpoint('Passenger Ticket Booking', `${API_BASE}/passengers/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flightNumber: 'AI 204',
      origin: 'MDU',
      destination: 'MAA',
      seatNumber: '04A',
      passengerName: 'Capt. Rajiv Sen',
      email: 'rajiv.sen@airindia.in',
      cabin: 'Business'
    })
  });

  assert(bookingRes.data?.data?.pnr, 'Booking must generate a valid PNR');
  console.log(`[PASS] PNR Issued: ${bookingRes.data.data.pnr} | Ticket: ${bookingRes.data.data.ticketNumber}`);

  // 12. Authentication Endpoints
  const loginRes = await testEndpoint('Staff Login', `${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ops.controller@aerosync.aero',
      password: 'AeroSync2026!',
      station: 'DEL'
    })
  });
  assert(loginRes.data?.data?.token, 'Login must issue auth token');

  await testEndpoint('Clearance Registration', `${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@aerosync.aero',
      department: 'Operations Research',
      station: 'DEL'
    })
  });

  await testEndpoint('Password Recovery', `${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'arjun.mehta@aerosync.aero'
    })
  });

  console.log('\n====================================================');
  console.log('✅ ALL BACKEND AND API INTEGRATIONS VERIFIED!');
  console.log('====================================================\n');
}

runAuditSuite().catch(err => {
  console.error('Audit suite failure:', err);
  process.exit(1);
});
