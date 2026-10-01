import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Search, Filter, 
  Plane, ArrowRight, RefreshCw, Cpu, Layers, UserCheck, Sparkles, Building2
} from 'lucide-react';
import { crewData } from '../data/crew';
import { getAvailableFlights, getNetworkAvailability, getAlternativeFlights } from '../services/api';
import FlightSeatMapDrawer from '../components/crew/FlightSeatMapDrawer';

export default function CrewManagementPage({ selectedAirline }) {
  // Crew Search & Filter State
  const [crewSearch, setCrewSearch] = useState('');
  const [crewStatusFilter, setCrewStatusFilter] = useState('ALL');

  // Flight Availability State
  const [availableFlights, setAvailableFlights] = useState([]);
  const [networkDestinations, setNetworkDestinations] = useState([]);
  const [alternativeFlights, setAlternativeFlights] = useState([]);
  const [selectedDrawerFlightId, setSelectedDrawerFlightId] = useState(null);

  // Network Availability Filters
  const [originFilter, setOriginFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [flightStatusFilter, setFlightStatusFilter] = useState('ALL');
  const [flightSearch, setFlightSearch] = useState('');

  // Simulation State
  const [isRebookingSimulating, setIsRebookingSimulating] = useState(false);
  const [rebookingSimCompleted, setRebookingSimCompleted] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('19:45:12 UTC');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const flRes = await getAvailableFlights({ origin: originFilter, destination: destFilter, status: flightStatusFilter });
      const netRes = await getNetworkAvailability();
      const altRes = await getAlternativeFlights('6E1234');

      if (isMounted) {
        setAvailableFlights(flRes.data);
        setNetworkDestinations(netRes.data);
        setAlternativeFlights(altRes.data);
        
        const now = new Date();
        const hrs = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        setLastUpdatedTime(`${hrs}:${mins}:${secs} UTC`);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [originFilter, destFilter, flightStatusFilter]);

  // Filter Crew
  const filteredCrew = crewData.filter(crew => {
    const matchesSearch = 
      crew.captain.toLowerCase().includes(crewSearch.toLowerCase()) ||
      crew.crewCode.toLowerCase().includes(crewSearch.toLowerCase()) ||
      crew.id.toLowerCase().includes(crewSearch.toLowerCase());
    const matchesStatus = crewStatusFilter === 'ALL' || crew.status === crewStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Available Flights
  const filteredAvailableFlights = availableFlights.filter(f => {
    const matchesSearch = 
      f.flightNumber.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.route.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.tailNumber.toLowerCase().includes(flightSearch.toLowerCase());
    return matchesSearch;
  });

  const handleSimulateRebooking = () => {
    setIsRebookingSimulating(true);
    setTimeout(() => {
      setIsRebookingSimulating(false);
      setRebookingSimCompleted(true);
    }, 1200);
  };

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-8 font-body-md text-on-surface">
      
      {/* 1. CREW MANAGEMENT & FDTL COMPLIANCE HEADER (Kept Intact!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              COCKPIT & CABIN ROSTER DISPATCH
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Crew Management & FDTL Compliance
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Monitor pilot and cabin crew duty hours, legal rest limitations (DGCA FDTL), and standby reserve availability.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm font-label-code">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Hot Reserve Crew</span>
            <div className="font-data-display text-xl font-bold text-secondary">18 Available</div>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-caps text-[10px] text-error uppercase font-bold">FDTL Alerts</span>
            <div className="font-data-display text-xl font-bold text-error">1 Breach</div>
          </div>
        </div>
      </div>

      {/* Crew Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={crewSearch}
            onChange={(e) => setCrewSearch(e.target.value)}
            placeholder="Search crew name, code (e.g. Capt. Rajiv), ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>

        <div className="flex items-center gap-3 font-label-code text-xs w-full sm:w-auto">
          <select
            value={crewStatusFilter}
            onChange={(e) => setCrewStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest w-full sm:w-auto"
          >
            <option value="ALL">All Crew Statuses</option>
            <option value="Available">Available (Reserve)</option>
            <option value="Assigned">Assigned (On Duty)</option>
            <option value="At Risk">At Risk (FDTL Near Limit)</option>
            <option value="Duty Limit">Duty Limit Exceeded</option>
          </select>
        </div>
      </div>

      {/* Crew Roster Table (Kept Intact!) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs font-body-sm">
          <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
            <tr>
              <th className="p-4">Crew Pair / Code</th>
              <th className="p-4">Role & Base</th>
              <th className="p-4">Current Flight</th>
              <th className="p-4">Duty Elapsed</th>
              <th className="p-4">Remaining Legal Duty</th>
              <th className="p-4">Next Assignment</th>
              <th className="p-4">Status & FDTL Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest font-label-code">
            {filteredCrew.map((crew) => (
              <tr key={crew.id} className="hover:bg-surface-container-low/60 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-sm text-on-surface">{crew.captain}</div>
                  <div className="text-[10px] text-on-surface-variant">{crew.fo} • {crew.crewCode}</div>
                </td>

                <td className="p-4">
                  <div className="font-bold text-on-surface">{crew.role}</div>
                  <div className="text-[10px] text-secondary font-bold">Base: {crew.baseLocation}</div>
                </td>

                <td className="p-4 font-bold text-on-surface">
                  {crew.currentFlight}
                </td>

                <td className="p-4 text-on-surface font-bold">
                  {crew.dutyTime}
                </td>

                <td className="p-4">
                  <div className={`font-bold ${crew.status === 'At Risk' || crew.status === 'Duty Limit' ? 'text-error' : 'text-emerald-700'}`}>
                    {crew.remainingDuty}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">Limit: {crew.legalDutyLimit}</div>
                </td>

                <td className="p-4 text-on-surface">
                  {crew.nextAssignment}
                </td>

                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    crew.status === 'At Risk' ? 'bg-error-container text-on-error-container' :
                    crew.status === 'Duty Limit' ? 'bg-error text-on-error' :
                    crew.status === 'Available' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    • {crew.statusBadge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="border-surface-container-highest my-6" />

      {/* 2. AVAILABLE FLIGHTS & SEAT INVENTORY SECTION (New Requirement) */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 font-label-code text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                DEMO INVENTORY
              </span>
              <span className="text-on-surface-variant">Last updated: <strong>{lastUpdatedTime}</strong></span>
            </div>
            <h2 className="font-headline-lg text-2xl font-extrabold text-on-surface">AVAILABLE FLIGHTS</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Flights currently available for operational recovery, seat reallocation, and passenger re-accommodation.
            </p>
          </div>
        </div>

        {/* Available Flights Filter Controls */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-wrap items-center justify-between gap-3 font-label-code text-xs">
          
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              value={flightSearch}
              onChange={(e) => setFlightSearch(e.target.value)}
              placeholder="Search flight number or airport..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
            />
          </div>

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest"
          >
            <option value="ALL">Origin: All</option>
            <option value="DEL">Origin: DEL (Delhi)</option>
            <option value="BOM">Origin: BOM (Mumbai)</option>
            <option value="MDU">Origin: MDU (Madurai)</option>
          </select>

          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest"
          >
            <option value="ALL">Destination: All</option>
            <option value="MAA">Destination: MAA (Chennai)</option>
            <option value="DEL">Destination: DEL (Delhi)</option>
            <option value="BLR">Destination: BLR (Bengaluru)</option>
          </select>

          <select
            value={flightStatusFilter}
            onChange={(e) => setFlightStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest"
          >
            <option value="ALL">Status: All</option>
            <option value="normal">On Time</option>
            <option value="critical">Delayed</option>
          </select>

        </div>

        {/* Available Flights Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-body-sm">
            <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
              <tr>
                <th className="p-4">Flight Number</th>
                <th className="p-4">Origin</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Departure</th>
                <th className="p-4">Arrival</th>
                <th className="p-4">Aircraft</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total Seats</th>
                <th className="p-4">Booked</th>
                <th className="p-4">Available Seats</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-label-code">
              {filteredAvailableFlights.map((flight) => (
                <tr 
                  key={flight.id} 
                  onClick={() => setSelectedDrawerFlightId(flight.id)}
                  className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-bold text-sm text-secondary font-data-display">
                    {flight.flightNumber}
                  </td>
                  <td className="p-4 font-bold text-on-surface">{flight.origin}</td>
                  <td className="p-4 font-bold text-on-surface">{flight.destination}</td>
                  <td className="p-4 font-bold text-on-surface">{flight.departure} UTC</td>
                  <td className="p-4 font-bold text-on-surface">{flight.arrival} UTC</td>
                  <td className="p-4 text-on-surface font-semibold">{flight.aircraft}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      flight.statusType === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      • {flight.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-on-surface">{flight.totalSeats}</td>
                  <td className="p-4 font-bold text-red-700">{flight.bookedSeats}</td>
                  <td className="p-4 font-bold text-emerald-700">
                    {flight.availableSeats} available / {flight.totalSeats} total
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors">
                      View Seat Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 3. NETWORK FLIGHT AVAILABILITY SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="font-headline-lg text-2xl font-extrabold text-on-surface">NETWORK FLIGHT AVAILABILITY</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Aggregated seat inventory metrics across primary network destination corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 font-label-code">
          {networkDestinations.map((dest, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-secondary font-headline-md">{dest.route}</span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                  {dest.flightsCount} flights
                </span>
              </div>
              <div className="font-data-display text-2xl font-bold text-emerald-700">
                {dest.totalAvailableSeats} Seats
              </div>
              <div className="text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-highest">
                Next Dep: <strong>{dest.nextDeparture}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECOVERY CONNECTION & ALTERNATIVE FLIGHTS REBOOKING (Requirement 7 & 8) */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-secondary-container/60 shadow-lg space-y-6 font-label-code">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold uppercase">
                DISRUPTION RECOVERY MATCHING
              </span>
            </div>
            <h2 className="font-headline-lg text-xl font-bold text-on-surface">
              ALTERNATIVE FLIGHTS & PASSENGER REBOOKING SIMULATION
            </h2>
          </div>

          <button
            onClick={handleSimulateRebooking}
            disabled={isRebookingSimulating}
            className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-md hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Cpu className="w-4 h-4" />
            <span>{isRebookingSimulating ? 'Simulating Allocation...' : '[ SIMULATE REBOOKING ]'}</span>
          </button>
        </div>

        {/* Disrupted Original Flight Banner */}
        <div className="p-4 rounded-xl bg-error-container/30 border border-error/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-error uppercase text-xs">Original Disrupted Flight:</span>
            <div className="font-headline-md text-lg font-bold text-on-surface mt-0.5">
              AI-204 (Madurai MDU → Chennai MAA)
            </div>
            <div className="text-xs text-error font-bold">🔴 DELAYED +90 min • 47 Affected Connecting Passengers</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-error text-on-error text-xs font-bold shrink-0">
            47 Pax Needing Rebooking
          </span>
        </div>

        {/* Simulation Completion Notification */}
        {rebookingSimCompleted && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-900 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Rebooking Simulation Complete! All 47 passengers successfully matched across alternative flights AI-206 & AI-208. Zero stranding.
            </span>
            <button onClick={() => setRebookingSimCompleted(false)} className="underline font-normal">Dismiss</button>
          </div>
        )}

        {/* Alternative Flights Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-on-surface">AI-206 (MDU → MAA)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">18:45 UTC</span>
            </div>
            <div className="font-data-display text-xl font-bold text-emerald-700">32 Seats Available</div>
            <p className="text-xs text-on-surface-variant">Can accommodate <strong>32 affected passengers</strong></p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-on-surface">AI-208 (MDU → MAA)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">20:10 UTC</span>
            </div>
            <div className="font-data-display text-xl font-bold text-emerald-700">61 Seats Available</div>
            <p className="text-xs text-on-surface-variant">Can accommodate <strong>remaining 15 passengers</strong></p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-on-surface">AI-212 (MDU → MAA)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">21:30 UTC</span>
            </div>
            <div className="font-data-display text-xl font-bold text-emerald-700">12 Seats Available</div>
            <p className="text-xs text-on-surface-variant">Reserve buffer pool available</p>
          </div>

        </div>

      </div>

      {/* FLIGHT DETAILS & SEAT MAP DRAWER */}
      {selectedDrawerFlightId && (
        <FlightSeatMapDrawer 
          flightId={selectedDrawerFlightId} 
          onClose={() => setSelectedDrawerFlightId(null)} 
        />
      )}

    </div>
  );
}
