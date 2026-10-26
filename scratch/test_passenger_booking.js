import app, { server } from '../backend/server.js';

async function testBookingEndpoint() {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/passengers/book`;
  console.log(`Testing booking endpoint at ${baseUrl}...`);

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flightId: 'flt-6e1234',
        flightNumber: '6E 1234',
        origin: 'DEL',
        destination: 'MAA',
        seatNumber: '04A',
        cabin: 'Business Class',
        passengerName: 'Priya Sharma',
        email: 'priya.sharma@aerosync.aero',
        phone: '+91 98765 43210',
        departure: '18:30 UTC',
        gate: 'Gate B4'
      })
    });

    const data = await res.json();
    console.log('Booking endpoint response status:', res.status);
    console.log('Response success:', data.success);
    console.log('Confirmed PNR:', data.data?.pnr);
    console.log('Ticket Number:', data.data?.ticketNumber);
    console.log('Passenger:', data.data?.passengerName);
    console.log('Seat:', data.data?.seatNumber);
    console.log('Status:', data.data?.status);

    if (data.success && data.data?.pnr && data.data?.seatNumber === '04A') {
      console.log('✓ PASSENGER BOOKING API TEST PASSED!');
    } else {
      console.error('✗ Test validation failed.');
    }
  } catch (err) {
    console.error('Error during booking test:', err);
  } finally {
    server.close(() => {
      console.log('Server closed cleanly.');
      process.exit(0);
    });
  }
}

testBookingEndpoint();
