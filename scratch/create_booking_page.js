const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PassengerBookingPage.jsx');

const code = `import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plane, Search, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  Ticket, User, Mail, Phone, ShieldCheck, Download, RefreshCw, Printer, 
  MapPin, Clock, Calendar, Check, X, Shield, Sparkles
} from 'lucide-react';
import { availableFlightsData, networkDestinationAvailability, generateFlightSeats, getSeatSummary } from '../data/seatInventory';
import { getAvailableFlights, getFlightSeats, bookFlightTicket } from '../services/api';

export default function PassengerBookingPage({ selectedAirline = 'All Airlines' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFlightId = searchParams.get('flightId');

  // Step state: 1 = Flight Search, 2 = Seat Map, 3 = Passenger Info, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Flight search & filter state
  const [originFilter, setOriginFilter] = useState('ALL');
  const [destinationFilter, setDestinationFilter] = useState('ALL');
  const [airlineFilter, setAirlineFilter] = useState(selectedAirline !== 'All Airlines' ? selectedAirline : 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [flights, setFlights] = useState(availableFlightsData);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);

  // Selected Flight & Seats state
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightSeatsData, setFlightSeatsData] = useState(null);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Passenger Form State
  const [passengerDetails, setPassengerDetails] = useState({
    title: 'Ms.',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@aerosync.aero',
    phone: '+91 98765 43210',
    category: 'RECOVERY', // RECOVERY, STANDARD, PRIORITY, ASSISTANCE
    specialAssistance: false,
    priorityBaggage: true
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load flights from service on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFlights = async () => {
      setIsLoadingFlights(true);
      try {
        const res = await getAvailableFlights();
        if (isMounted && res?.data && res.data.length > 0) {
          setFlights(res.data);
        }
      } catch {
        // Fallback to local dataset
      } finally {
        if (isMounted) setIsLoadingFlights(false);
      }
    };
    fetchFlights();
    return () => { isMounted = false; };
  }, []);

  // Handle preselected flightId from query params
  useEffect(() => {
    if (preselectedFlightId && flights.length > 0) {
      const found = flights.find(f => f.id === preselectedFlightId || f.flightNumber.replace(/\\s+/g, '') === preselectedFlightId.replace(/\\s+/g, ''));
      if (found) {
        handleSelectFlight(found);
      }
    }
  }, [preselectedFlightId, flights]);

  // Filtered flights
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      const matchesOrigin = originFilter === 'ALL' || flight.origin === originFilter;
      const matchesDest = destinationFilter === 'ALL' || flight.destination === destinationFilter;
      const matchesAirline = airlineFilter === 'ALL' || flight.airline.toLowerCase().includes(airlineFilter.toLowerCase());
      const matchesQuery = !searchQuery.trim() || 
        flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flight.route && flight.route.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesOrigin && matchesDest && matchesAirline && matchesQuery;
    });
  }, [flights, originFilter, destinationFilter, airlineFilter, searchQuery]);

  // Select flight and load cabin seats
  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null);
    setIsLoadingSeats(true);
    setCurrentStep(2);

    try {
      const res = await getFlightSeats(flight.id);
      if (res?.data) {
        setFlightSeatsData(res.data);
      } else {
        const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
        const summary = getSeatSummary(seats);
        setFlightSeatsData({
          ...flight,
          ...summary,
          seats
        });
      }
    } catch {
      const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
      const summary = getSeatSummary(seats);
      setFlightSeatsData({
        ...flight,
        ...summary,
        seats
      });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // Submit confirmed booking
  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFlight || !selectedSeat) {
      setBookingError('Please select a flight and an available seat.');
      return;
    }
    if (!passengerDetails.fullName.trim()) {
      setBookingError('Please enter passenger full name.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    const payload = {
      flightId: selectedFlight.id,
      flightNumber: selectedFlight.flightNumber,
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      departure: selectedFlight.departure,
      gate: selectedFlight.gate || 'Gate B4',
      seatNumber: selectedSeat.seatNumber,
      cabin: selectedSeat.cabin || 'Economy',
      passengerName: \`\${passengerDetails.title} \${passengerDetails.fullName.trim()}\`,
      email: passengerDetails.email.trim(),
      phone: passengerDetails.phone.trim(),
      category: passengerDetails.category,
      specialAssistance: passengerDetails.specialAssistance
    };

    try {
      const res = await bookFlightTicket(payload);
      if (res && res.success) {
        setConfirmedBooking(res.data);
        setCurrentStep(4);
      } else {
        setBookingError(res?.message || 'Failed to confirm booking. Please try again.');
      }
    } catch (err) {
      setBookingError('Booking service timeout. Local ticket issued.');
      setConfirmedBooking({
        ...payload,
        pnr: \`AS-\${Math.floor(10000 + Math.random() * 90000)}\`,
        ticketNumber: \`098-\${Date.now().toString().slice(-8)}\`,
        status: 'CONFIRMED',
        issuedAt: new Date().toISOString()
      });
      setCurrentStep(4);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-body-md text-on-surface">
      
      {/* =========================================================================
          PAGE HEADER & PROGRESS STEPPER
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-surface-container-highest">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-label-code text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-secondary" />
              PASSENGER RESERVATIONS & SEAT INVENTORY DESK
            </span>
            <span className="text-on-surface-variant hidden sm:inline">• Real-time Cabin Telemetry</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Ticket Booking & Seat Selection
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl mt-1">
            Search scheduled flights, inspect interactive aircraft seat maps, allocate available seats, and issue verified passenger boarding passes.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low p-2 rounded-2xl border border-surface-container-highest shadow-sm shrink-0 font-label-code text-xs">
          {[
            { step: 1, label: 'Search' },
            { step: 2, label: 'Seat Map' },
            { step: 3, label: 'Passenger' },
            { step: 4, label: 'E-Ticket' },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <button
                onClick={() => {
                  if (s.step === 1) setCurrentStep(1);
                  if (s.step === 2 && selectedFlight) setCurrentStep(2);
                  if (s.step === 3 && selectedFlight && selectedSeat) setCurrentStep(3);
                  if (s.step === 4 && confirmedBooking) setCurrentStep(4);
                }}
                disabled={(s.step === 2 && !selectedFlight) || (s.step === 3 && !selectedSeat) || (s.step === 4 && !confirmedBooking)}
                className={\`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed \${
                  currentStep === s.step
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : currentStep > s.step
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }\`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                  {currentStep > s.step ? '✓' : s.step}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </button>
              {idx < 3 && <span className="text-outline text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {bookingError && (
        <div className="p-4 rounded-2xl bg-error-container/80 border border-error/30 text-on-error-container flex items-center justify-between gap-3 font-label-code text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-error shrink-0" />
            <span>{bookingError}</span>
          </div>
          <button onClick={() => setBookingError(null)} className="p-1 hover:text-error">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          STEP 1: FLIGHT SEARCH & SECTOR AVAILABILITY
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          
          {/* Corridor Availability Metric Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                NETWORK CAPACITY & HIGH-FREQUENCY CORRIDORS
              </span>
              <span className="font-label-code text-[11px] text-secondary font-bold">
                {networkDestinationAvailability.length} Key Hub Corridors
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 font-label-code">
              {networkDestinationAvailability.map((corridor, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setOriginFilter(corridor.origin);
                    setDestinationFilter(corridor.destination);
                  }}
                  className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm hover:border-secondary hover:shadow-md transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-secondary font-headline-md">{corridor.route}</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                      {corridor.flightsCount} Flts
                    </span>
                  </div>
                  <div className="font-data-display text-xl font-bold text-emerald-700">
                    {corridor.totalAvailableSeats} Seats
                  </div>
                  <div className="text-[11px] text-on-surface-variant pt-1.5 border-t border-surface-container-highest flex items-center justify-between">
                    <span>Next: <strong>{corridor.nextDeparture}</strong></span>
                    <span className="text-secondary font-bold">Select →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3 font-label-code text-xs">
              
              {/* Search Query */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flight number (e.g. 6E 1234), origin, or destination..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container-highest"
                />
              </div>

              {/* Origin Filter */}
              <div className="w-full md:w-auto">
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                >
                  <option value="ALL">Origin: All Airports</option>
                  <option value="DEL">Origin: DEL (Delhi)</option>
                  <option value="BOM">Origin: BOM (Mumbai)</option>
                  <option value="BLR">Origin: BLR (Bengaluru)</option>
                  <option value="MAA">Origin: MAA (Chennai)</option>
                  <option value="MDU">Origin: MDU (Madurai)</option>
                  <option value="DXB">Origin: DXB (Dubai)</option>
                  <option value="LHR">Origin: LHR (London)</option>
                </select>
              </div>

              {/* Destination Filter */}
              <div className="w-full md:w-auto">
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                >
                  <option value="ALL">Destination: All Airports</option>
                  <option value="MAA">Destination: MAA (Chennai)</option>
                  <option value="DEL">Destination: DEL (Delhi)</option>
                  <option value="BLR">Destination: BLR (Bengaluru)</option>
                  <option value="BOM">Destination: BOM (Mumbai)</option>
                  <option value="MDU">Destination: MDU (Madurai)</option>
                </select>
              </div>

              {/* Airline Filter */}
              <div className="w-full md:w-auto">
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                >
                  <option value="ALL">Airline: All Carriers</option>
                  <option value="Air India">Air India</option>
                  <option value="IndiGo">IndiGo</option>
                  <option value="Vistara">Vistara</option>
                </select>
              </div>

              {(originFilter !== 'ALL' || destinationFilter !== 'ALL' || airlineFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setOriginFilter('ALL');
                    setDestinationFilter('ALL');
                    setAirlineFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Available Flights Grid */}
          <div className="space-y-3 font-label-code">
            <div className="flex items-center justify-between px-1 text-xs text-on-surface-variant">
              <span>Showing <strong>{filteredFlights.length}</strong> available flights matching search</span>
              <span className="text-secondary font-bold">Click flight to select seat</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlights.map((flight) => {
                const summary = getSeatSummary(flight.seats || generateFlightSeats(flight.id));

                return (
                  <div
                    key={flight.id}
                    onClick={() => handleSelectFlight(flight)}
                    className="group p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm hover:shadow-lg hover:border-secondary transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Card Header: Flight Number & Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-secondary text-white font-bold font-data-display text-xs flex items-center justify-center">
                            {flight.airline ? flight.airline.substring(0, 2).toUpperCase() : 'FL'}
                          </span>
                          <div>
                            <span className="font-bold text-base text-on-surface font-headline-md block">
                              {flight.flightNumber}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              {flight.airline} • {flight.aircraft}
                            </span>
                          </div>
                        </div>

                        <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold \${
                          flight.statusType === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-emerald-100 text-emerald-900'
                        }\`}>
                          • {flight.status}
                        </span>
                      </div>

                      {/* Route & Times */}
                      <div className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-lg font-data-display text-primary">{flight.origin}</div>
                          <div className="text-[11px] text-on-surface-variant">{flight.departure} UTC</div>
                        </div>

                        <div className="flex flex-col items-center px-4 flex-1">
                          <span className="text-[10px] text-outline font-semibold mb-1">Direct Flight</span>
                          <div className="w-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                            <div className="w-full h-0.5 bg-secondary-container"></div>
                            <Plane className="w-3.5 h-3.5 text-secondary shrink-0 transform rotate-90" />
                          </div>
                          <span className="text-[10px] text-outline mt-1">{flight.gate || 'Gate B4'}</span>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg font-data-display text-primary">{flight.destination}</div>
                          <div className="text-[11px] text-on-surface-variant">{flight.arrival} UTC</div>
                        </div>
                      </div>
                    </div>

                    {/* Seat Inventory Metric & Action */}
                    <div className="pt-3 border-t border-surface-container-highest flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-emerald-700">
                          {summary.availableSeats} Seats Available
                        </span>
                      </div>

                      <button className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs group-hover:bg-primary transition-colors flex items-center gap-1.5">
                        <span>Select Seat</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 2: AIRCRAFT CABIN SEAT MAP SELECTION
         ========================================================================= */}
      {currentStep === 2 && selectedFlight && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Flight Search</span>
            </button>

            <div className="flex items-center gap-4 text-xs font-label-code">
              <div>
                Flight: <strong className="text-on-surface">{selectedFlight.flightNumber}</strong> ({selectedFlight.origin} → {selectedFlight.destination})
              </div>
              <div className="hidden sm:inline">
                Departure: <strong>{selectedFlight.departure} UTC</strong> • Gate: <strong>{selectedFlight.gate || 'Gate B4'}</strong>
              </div>
            </div>

            {selectedSeat ? (
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90 transition-colors"
              >
                <span>Continue with Seat {selectedSeat.seatNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-bold text-outline">
                Click an available green seat below to continue
              </span>
            )}
          </div>

          {/* Cabin Layout and Seat Summary */}
          {isLoadingSeats ? (
            <div className="p-16 text-center text-xs font-label-code text-on-surface-variant animate-pulse">
              Loading live cabin seat telemetry...
            </div>
          ) : flightSeatsData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-label-code">
              
              {/* Left Side: Seat Map & Columns (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
                
                {/* Cockpit Indicator */}
                <div className="text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-widest pb-3 border-b border-surface-container-highest flex items-center justify-center gap-2">
                  <Plane className="w-4 h-4 text-secondary transform -rotate-45" />
                  <span>Aircraft Nose & Cockpit (Row 01 - Business Class)</span>
                </div>

                {/* Legend Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low text-xs">
                  <span className="font-bold text-on-surface">Seat Map Legend:</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> 🟢 Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-secondary ring-2 ring-secondary-container"></span> 🔵 Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-red-500"></span> 🔴 Booked</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400"></span> 🟡 Held</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-700"></span> ⚫ Blocked</span>
                  </div>
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-on-surface-variant py-1 border-b border-surface-container-highest">
                  <div>Row</div>
                  <div className="flex justify-center gap-2"><span>A</span><span>B</span><span>C</span></div>
                  <div>Aisle</div>
                  <div className="flex justify-center gap-2"><span>D</span><span>E</span><span>F</span></div>
                </div>

                {/* Seat Rows Scrollable Container */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {Array.from({ length: 30 }).map((_, rIdx) => {
                    const rowNum = rIdx + 1;
                    const rowStr = rowNum < 10 ? \`0\${rowNum}\` : \`\${rowNum}\`;
                    const rowSeats = (flightSeatsData.seats || []).filter(s => s.row === rowStr);
                    const isBusiness = rowNum <= 4;

                    return (
                      <div 
                        key={rowStr} 
                        className={\`grid grid-cols-7 gap-1 items-center text-center p-1 rounded-xl transition-colors \${
                          isBusiness ? 'bg-secondary-fixed/20' : ''
                        }\`}
                      >
                        <span className="text-[10px] font-bold text-outline">{rowStr}</span>
                        
                        {/* Left Block A, B, C */}
                        <div className="flex justify-center gap-1.5">
                          {['A', 'B', 'C'].map(col => {
                            const seat = rowSeats.find(s => s.column === col);
                            if (!seat) return <div key={col} className="w-7 h-7"></div>;
                            const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
                            const isAvailable = seat.status === 'AVAILABLE';

                            const bgClass = isSelected 
                              ? 'bg-secondary text-white ring-2 ring-secondary-container shadow-md scale-105' 
                              : isAvailable 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer active:scale-95' 
                              : seat.status === 'BOOKED' 
                              ? 'bg-red-500/80 text-white cursor-not-allowed opacity-60' 
                              : seat.status === 'HELD' 
                              ? 'bg-amber-400 text-amber-950 font-bold cursor-not-allowed' 
                              : 'bg-slate-700 text-slate-300 cursor-not-allowed';

                            return (
                              <button
                                key={col}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => setSelectedSeat(seat)}
                                className={\`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center \${bgClass}\`}
                                title={\`Seat \${seat.seatNumber} • \${seat.cabin} (\${seat.status})\`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-[10px] text-outline font-normal">Aisle</div>

                        {/* Right Block D, E, F */}
                        <div className="flex justify-center gap-1.5">
                          {['D', 'E', 'F'].map(col => {
                            const seat = rowSeats.find(s => s.column === col);
                            if (!seat) return <div key={col} className="w-7 h-7"></div>;
                            const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
                            const isAvailable = seat.status === 'AVAILABLE';

                            const bgClass = isSelected 
                              ? 'bg-secondary text-white ring-2 ring-secondary-container shadow-md scale-105' 
                              : isAvailable 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer active:scale-95' 
                              : seat.status === 'BOOKED' 
                              ? 'bg-red-500/80 text-white cursor-not-allowed opacity-60' 
                              : seat.status === 'HELD' 
                              ? 'bg-amber-400 text-amber-950 font-bold cursor-not-allowed' 
                              : 'bg-slate-700 text-slate-300 cursor-not-allowed';

                            return (
                              <button
                                key={col}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => setSelectedSeat(seat)}
                                className={\`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center \${bgClass}\`}
                                title={\`Seat \${seat.seatNumber} • \${seat.cabin} (\${seat.status})\`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-widest pt-3 border-t border-surface-container-highest">
                  Galley & Rear Exit (Row 30)
                </div>

              </div>

              {/* Right Side: Selected Seat Details & Summary (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Active Selection Card */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
                  <span className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                    SEAT SELECTION STATUS
                  </span>

                  {selectedSeat ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-primary-container text-on-primary">
                        <span className="text-[10px] text-primary-fixed uppercase font-bold tracking-wider">SELECTED SEAT</span>
                        <div className="font-data-display text-3xl font-extrabold text-white mt-0.5">
                          {selectedSeat.seatNumber}
                        </div>
                        <div className="text-xs text-primary-fixed-dim mt-1">
                          {selectedSeat.cabin} • {selectedSeat.type} Seat
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-surface-container-highest">
                          <span className="text-on-surface-variant">Cabin Class:</span>
                          <strong className="text-on-surface">{selectedSeat.cabin}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-surface-container-highest">
                          <span className="text-on-surface-variant">Seat Position:</span>
                          <strong className="text-on-surface">{selectedSeat.type}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-surface-container-highest">
                          <span className="text-on-surface-variant">Aircraft:</span>
                          <strong className="text-on-surface">{selectedFlight.aircraft}</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-on-surface-variant">Fare Type:</span>
                          <span className="font-bold text-emerald-700">Complimentary Recovery Waiver</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Confirm Seat & Enter Passenger Info</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-surface-container-low border border-dashed border-outline/40 space-y-2">
                      <Ticket className="w-8 h-8 text-outline mx-auto" />
                      <div className="font-bold text-sm text-on-surface">No Seat Selected Yet</div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Click on any green seat in the aircraft map to select it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cabin Inventory Metrics */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-3 font-label-code text-xs">
                  <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider block">
                    CABIN INVENTORY TELEMETRY
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-surface-container-low">
                      <span className="text-[10px] text-on-surface-variant">TOTAL</span>
                      <div className="font-bold text-base text-on-surface">{flightSeatsData.totalSeats || 180}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <span className="text-[10px]">AVAILABLE</span>
                      <div className="font-bold text-base text-emerald-700">{flightSeatsData.availableSeats || 42}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-900 border border-red-200">
                      <span className="text-[10px]">BOOKED</span>
                      <div className="font-bold text-base text-red-700">{flightSeatsData.bookedSeats || 138}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                      <span className="text-[10px]">HELD</span>
                      <div className="font-bold text-base text-amber-800">{flightSeatsData.heldSeats || 6}</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          STEP 3: PASSENGER INFORMATION & BOOKING REVIEW
         ========================================================================= */}
      {currentStep === 3 && selectedFlight && selectedSeat && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seat Map</span>
            </button>

            <span className="font-label-code text-xs text-on-surface-variant">
              Booking for Flight <strong className="text-on-surface">{selectedFlight.flightNumber}</strong> • Seat <strong className="text-secondary">{selectedSeat.seatNumber}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-label-code">
            
            {/* Passenger Input Form (7 cols) */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-5">
              <div className="space-y-1">
                <h2 className="font-headline-md text-lg font-bold text-on-surface">Passenger Details</h2>
                <p className="text-xs text-on-surface-variant font-body-sm">
                  Enter passenger information to generate the flight reservation e-ticket.
                </p>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                
                {/* Title & Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">Title</label>
                    <select
                      value={passengerDetails.title}
                      onChange={(e) => setPassengerDetails({ ...passengerDetails, title: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest focus:outline-none"
                    >
                      <option value="Ms.">Ms.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Capt.">Capt.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="block font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">Passenger Full Name *</label>
                    <input
                      type="text"
                      value={passengerDetails.fullName}
                      onChange={(e) => setPassengerDetails({ ...passengerDetails, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest focus:outline-none focus:ring-2 focus:ring-secondary/40 font-bold text-on-surface"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">Contact Email Address *</label>
                  <input
                    type="email"
                    value={passengerDetails.email}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                    placeholder="passenger@aerosync.aero"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">Mobile Phone / Telemetry Alert Number</label>
                  <input
                    type="tel"
                    value={passengerDetails.phone}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  />
                </div>

                {/* Reservation Category */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">Passenger Category / Booking Reason</label>
                  <select
                    value={passengerDetails.category}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest focus:outline-none"
                  >
                    <option value="RECOVERY">Disruption Recovery Connection Re-accommodation (Priority)</option>
                    <option value="STANDARD">Standard Scheduled Passenger Booking</option>
                    <option value="PRIORITY">VIP / High-Yield Itinerary Protection</option>
                    <option value="STAFF">Airline OCC Staff Workstation Duty Travel</option>
                  </select>
                </div>

                {/* Checkbox Options */}
                <div className="space-y-2 pt-2 border-t border-surface-container-highest">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passengerDetails.priorityBaggage}
                      onChange={(e) => setPassengerDetails({ ...passengerDetails, priorityBaggage: e.target.checked })}
                      className="w-4 h-4 rounded text-secondary accent-secondary"
                    />
                    <span className="text-on-surface font-medium">Automatic Expedited Airside Baggage Transfer</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passengerDetails.specialAssistance}
                      onChange={(e) => setPassengerDetails({ ...passengerDetails, specialAssistance: e.target.checked })}
                      className="w-4 h-4 rounded text-secondary accent-secondary"
                    />
                    <span className="text-on-surface font-medium">Request Airside VIP Buggy Shuttle at Gate</span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer min-h-[44px]"
                >
                  {isSubmittingBooking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Issuing Boarding Pass & PNR...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Reservation & Generate E-Ticket</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Itinerary Summary Review (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
              <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider block">
                RESERVATION SUMMARY & WAIVER
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-surface-container-low space-y-2 border border-surface-container-highest">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary font-headline-md">{selectedFlight.flightNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Confirmed Slot</span>
                  </div>
                  <div className="text-sm font-bold text-on-surface">{selectedFlight.origin} → {selectedFlight.destination}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    Departure: {selectedFlight.departure} UTC • Gate: {selectedFlight.gate || 'Gate B4'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-secondary-fixed/30 border border-secondary/30 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Assigned Seat:</span>
                    <strong className="text-secondary font-data-display text-sm">{selectedSeat.seatNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Cabin Class:</span>
                    <strong className="text-on-surface">{selectedSeat.cabin}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Position:</span>
                    <strong className="text-on-surface">{selectedSeat.type}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container-highest space-y-1">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Base Reservation Fare:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Disruption Recovery Waiver:</span>
                    <span className="text-emerald-700 font-bold">100% Waived</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-surface-container-highest">
                    <span>Total Amount Due:</span>
                    <span className="text-emerald-700">$0.00 (Complimentary)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: CONFIRMED BOOKING & DIGITAL BOARDING PASS
         ========================================================================= */}
      {currentStep === 4 && confirmedBooking && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Success Alert Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 flex items-center justify-between gap-3 font-label-code text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Flight Reservation Confirmed & Verified</span>
                <span className="text-[11px] text-emerald-800">
                  Electronic ticket and baggage routing tags successfully issued.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase">
              Confirmed
            </span>
          </div>

          {/* REALISTIC AVIATION BOARDING PASS CARD */}
          <div className="rounded-3xl overflow-hidden bg-surface-container-lowest border-2 border-secondary-container shadow-2xl font-label-code">
            
            {/* Boarding Pass Header */}
            <div className="bg-primary-container text-on-primary p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container">
                  <Plane className="w-5 h-5 transform -rotate-45" />
                </div>
                <div>
                  <div className="font-headline-lg text-lg font-bold text-white flex items-center gap-2">
                    AeroSync <span className="text-secondary-container text-xs px-2 py-0.5 rounded bg-secondary-container/20">BOARDING PASS</span>
                  </div>
                  <div className="text-[11px] text-primary-fixed-dim">
                    Electronic Passenger Ticket & Telemetry Manifest
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-primary-fixed uppercase tracking-wider block font-bold">BOOKING REFERENCE (PNR)</span>
                <span className="font-data-display text-2xl font-extrabold text-secondary-container tracking-wider">
                  {confirmedBooking.pnr}
                </span>
              </div>
            </div>

            {/* Boarding Pass Body */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Route & Times Graphic */}
              <div className="flex items-center justify-between pb-6 border-b border-surface-container-highest">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase">ORIGIN</span>
                  <div className="font-data-display text-3xl font-extrabold text-primary mt-0.5">{confirmedBooking.origin}</div>
                  <div className="text-xs text-on-surface-variant mt-1">Terminal Gate {confirmedBooking.gate || 'Gate B4'}</div>
                </div>

                <div className="flex flex-col items-center px-4 flex-1">
                  <span className="text-[10px] text-outline uppercase font-semibold mb-1">Direct Operational Leg</span>
                  <div className="w-full flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <div className="w-full border-t-2 border-dashed border-secondary/40"></div>
                    <Plane className="w-4 h-4 text-secondary shrink-0 transform rotate-90" />
                  </div>
                  <span className="text-[11px] text-secondary font-bold mt-1">Flight {confirmedBooking.flightNumber}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-on-surface-variant font-bold uppercase">DESTINATION</span>
                  <div className="font-data-display text-3xl font-extrabold text-primary mt-0.5">{confirmedBooking.destination}</div>
                  <div className="text-xs text-on-surface-variant mt-1">Arrival: Scheduled</div>
                </div>
              </div>

              {/* Passenger & Ticket Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">PASSENGER NAME</span>
                  <div className="font-bold text-sm text-on-surface mt-0.5 truncate">{confirmedBooking.passengerName}</div>
                </div>

                <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary/30">
                  <span className="text-[10px] text-on-secondary-fixed uppercase font-bold">SEAT NUMBER</span>
                  <div className="font-data-display text-xl font-extrabold text-secondary mt-0.5">{confirmedBooking.seatNumber}</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">CABIN CLASS</span>
                  <div className="font-bold text-sm text-on-surface mt-0.5">{confirmedBooking.cabin || 'Economy'}</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">BOARDING TIME</span>
                  <div className="font-bold text-sm text-emerald-700 mt-0.5">{confirmedBooking.departure || '18:00 UTC'}</div>
                </div>
              </div>

              {/* Barcode & Security Tag */}
              <div className="pt-4 border-t border-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-[11px] text-on-surface-variant text-center sm:text-left">
                  <div>Ticket No: <strong className="text-on-surface">{confirmedBooking.ticketNumber}</strong></div>
                  <div>Status: <span className="text-emerald-700 font-bold">CONFIRMED / VERIFIED</span> • Issued by AeroSync Autonomous Dispatch Mesh</div>
                </div>

                {/* Simulated Barcode */}
                <div className="flex items-center gap-1 bg-white p-2.5 rounded-xl border border-outline/30 shadow-inner">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-black" 
                      style={{ 
                        width: (i % 3 === 0 ? '3px' : i % 2 === 0 ? '2px' : '1px'), 
                        height: '32px' 
                      }} 
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-highest shadow-sm hover:bg-surface-container-high font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-secondary" />
              <span>Print / Save E-Ticket</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(\`/passenger-view?pnr=\${confirmedBooking.pnr}\`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                <span>Track on Passenger Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedFlight(null);
                  setSelectedSeat(null);
                  setConfirmedBooking(null);
                  setCurrentStep(1);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Book Another Ticket</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully created frontend/src/pages/PassengerBookingPage.jsx');
