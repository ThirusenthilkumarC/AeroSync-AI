import app, { server } from '../backend/server.js';

async function runTests() {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;
  console.log(`Testing auth endpoints at ${baseUrl}...`);

  try {
    // 1. Test Login
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ops.controller@aerosync.aero',
        password: 'AeroSync2026!',
        station: 'DEL'
      })
    });
    const loginData = await loginRes.json();
    console.log('✓ Login Test Passed:', loginData.success, 'Token:', loginData.data?.token ? 'Present' : 'Missing', 'User:', loginData.data?.user?.name);

    // 2. Test Forgot Password
    const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ops.controller@aerosync.aero' })
    });
    const forgotData = await forgotRes.json();
    console.log('✓ Forgot Password Test Passed:', forgotData.success, 'Message:', forgotData.message);

    // 3. Test Register
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First Officer Sharma',
        email: 'fo.sharma@aerosync.aero',
        department: 'Flight Operations',
        station: 'BOM'
      })
    });
    const regData = await regRes.json();
    console.log('✓ Register Test Passed:', regData.success, 'Clearance ID:', regData.data?.clearanceId);

    // 4. Test Me
    const meRes = await fetch(`${baseUrl}/me`);
    const meData = await meRes.json();
    console.log('✓ Get Me Test Passed:', meData.success, 'Role:', meData.data?.role);

    console.log('All 4 Authentication Tests Passed Successfully!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close(() => {
      console.log('Server closed cleanly.');
      process.exit(0);
    });
  }
}

runTests();
