import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, RefreshCw, Download, Plane, ArrowRight, Clock, Building2, Users, AlertTriangle, CheckCircle2, X, Eye 
} from 'lucide-react';
import { flightsData } from '../data/flights';

export default function FlightManagementPage() {
  const [searchParams] = useSearchParams();
  const initialSelectedId = searchParams.get('id');

  const [searchTerm, setSearchTerm] = useState(initialSelectedId || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hubFilter, setHubFilter] = useState('ALL');
  const [selectedFlight, setSelectedFlight] = useState(
    initialSelectedId ? flightsData.find(f => f.id === initialSelectedId) || null : null
  );

  const filteredFlights = useMemo(() => {
    return flightsData.filter(flight => {
      const matchesSearch = 
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.tailNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.route.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'DELAYED' && flight.statusType === 'critical') ||
        (statusFilter === 'AT_RISK' && flight.statusType === 'warning') ||
        (statusFilter === 'ON_TIME' && flight.statusType === 'normal');

      const matchesHub = 
        hubFilter === 'ALL' || 
        flight.origin === hubFilter || 
        flight.destination === hubFilter;

      return matchesSearch && matchesStatus && matchesHub;
    });
  }, [searchTerm, statusFilter, hubFilter]);

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              NETWORK FLEET TELEMETRY • SECTOR 04 // REAL-TIME INGESTION
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-primary">
            Flight Operations & Fleet Tracking
          </h1>
          <p className="font-body-lg text-sm text-on-surface-variant mt-1">
            Live schedule, delay telemetry, and AI impact severity across domestic and international sectors.
          </p>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center gap-4 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Active Flights</span>
            <div className="font-data-display text-xl font-bold text-on-surface">482</div>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">On Time</span>
            <div className="font-data-display text-xl font-bold text-secondary">458</div>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Delayed</span>
            <div className="font-data-display text-xl font-bold text-error">14</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Flight # (e.g. 6E 1234), Tail number, Route..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/40 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-label-code text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="ALL">All Statuses (Active)</option>
            <option value="DELAYED">Delayed (+45m+)</option>
            <option value="AT_RISK">At Risk</option>
            <option value="ON_TIME">On-Time</option>
          </select>

          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="ALL">All Hubs (DEL, BOM, BLR, MAA)</option>
            <option value="DEL">Delhi (DEL Hub)</option>
            <option value="BOM">Mumbai (BOM Hub)</option>
            <option value="MAA">Chennai (MAA Hub)</option>
            <option value="BLR">Bengaluru (BLR Hub)</option>
          </select>

          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setHubFilter('ALL'); }}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Live Refresh
          </button>

          <button className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-bold hover:bg-primary transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export Manifest
          </button>
        </div>

      </div>

      {/* Flight Operations Data Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs font-body-sm">
          <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
            <tr>
              <th className="p-4">Flight</th>
              <th className="p-4">Sector / Route</th>
              <th className="p-4">Departure (STD/ETD)</th>
              <th className="p-4">Arrival (STA/ETA)</th>
              <th className="p-4">Equipment & Tail</th>
              <th className="p-4">Gate Allocation</th>
              <th className="p-4">Operational Status</th>
              <th className="p-4">AI Disruption Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest font-label-code">
            {filteredFlights.map((flight) => (
              <tr 
                key={flight.id}
                onClick={() => setSelectedFlight(flight)}
                className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
              >
                {/* Flight Code */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-secondary font-data-display text-xs">
                      6E
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface">{flight.flightNumber}</div>
                      <div className="text-[10px] text-on-surface-variant">{flight.icao} • {flight.flightType}</div>
                    </div>
                  </div>
                </td>

                {/* Sector / Route */}
                <td className="p-4">
                  <div className="font-bold text-sm text-on-surface font-headline-md">{flight.route}</div>
                  <div className="text-[10px] text-on-surface-variant">{flight.distanceKm} km • {flight.flightTime}</div>
                </td>

                {/* Departure */}
                <td className="p-4">
                  <div className="text-on-surface font-bold">{flight.std}</div>
                  {flight.delayMinutes > 0 ? (
                    <div className="text-error font-bold">{flight.etd} (+{flight.delayMinutes}m DELAY)</div>
                  ) : (
                    <div className="text-on-surface-variant">STD Nom</div>
                  )}
                </td>

                {/* Arrival */}
                <td className="p-4">
                  <div className="text-on-surface font-bold">{flight.sta}</div>
                  {flight.delayMinutes > 0 ? (
                    <div className="text-error font-bold">{flight.eta} revised</div>
                  ) : (
                    <div className="text-on-surface-variant">STA Nom</div>
                  )}
                </td>

                {/* Equipment & Tail */}
                <td className="p-4">
                  <div className="font-bold text-on-surface">{flight.aircraftType}</div>
                  <div className="text-secondary font-bold">{flight.tailNumber}</div>
                </td>

                {/* Gate Allocation */}
                <td className="p-4">
                  <div className="font-bold text-on-surface">{flight.gate}</div>
                  <div className={`text-[10px] ${flight.gateStatus.includes('CONFLICT') ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                    {flight.gateStatus}
                  </div>
                </td>

                {/* Status */}
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    flight.statusType === 'critical' ? 'bg-error-container text-on-error-container' :
                    flight.statusType === 'warning' ? 'bg-amber-100 text-amber-900' :
                    flight.statusType === 'landed' ? 'bg-surface-container text-on-surface-variant' :
                    'bg-emerald-100 text-emerald-900'
                  }`}>
                    • {flight.status}
                  </span>
                </td>

                {/* AI Impact */}
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    flight.aiImpactSeverity.includes('High') ? 'bg-error text-on-error' :
                    flight.aiImpactSeverity.includes('Medium') ? 'bg-amber-500 text-white' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {flight.aiImpactSeverity}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILED FLIGHT DRAWER */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setSelectedFlight(null)}>
          <div 
            className="w-full max-w-xl h-full bg-surface-container-lowest p-6 md:p-8 shadow-2xl overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold font-data-display">
                  6E
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface font-headline-lg">{selectedFlight.flightNumber} Detailed Telemetry</h3>
                  <p className="text-xs text-on-surface-variant font-label-code">{selectedFlight.route} • {selectedFlight.flightType}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFlight(null)} className="p-2 rounded-xl hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4 font-label-code text-xs">
              
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
                <div className="font-bold text-secondary uppercase text-[11px]">Flight Schedule & Delay</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-on-surface-variant text-[10px]">STD / ETD</span>
                    <div className="font-bold">{selectedFlight.std} → {selectedFlight.etd}</div>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[10px]">STA / ETA</span>
                    <div className="font-bold">{selectedFlight.sta} → {selectedFlight.eta}</div>
                  </div>
                </div>
                {selectedFlight.delayReason && (
                  <div className="pt-2 border-t border-surface-container-highest text-error font-semibold">
                    Reason: {selectedFlight.delayReason}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
                <div className="font-bold text-secondary uppercase text-[11px]">Aircraft & Crew Allocation</div>
                <div>Tail Number: <strong className="text-on-surface">{selectedFlight.tailNumber}</strong> ({selectedFlight.aircraftType})</div>
                <div>Captain: <strong className="text-on-surface">{selectedFlight.crew.captain}</strong> ({selectedFlight.crew.crewCode})</div>
                <div className="text-on-surface-variant">FDTL Status: {selectedFlight.crew.fdtlStatus}</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
                <div className="font-bold text-secondary uppercase text-[11px]">Gate & Pax Connections</div>
                <div>Assigned Stand: <strong className="text-on-surface">{selectedFlight.gate}</strong> ({selectedFlight.gateStatus})</div>
                <div>Pax On Board: <strong className="text-on-surface">{selectedFlight.paxOnBoard} / {selectedFlight.paxCapacity}</strong> ({selectedFlight.loadFactor} Load)</div>
                <div>Connecting Pax at Risk: <strong className="text-error">{selectedFlight.connectingPax} Pax</strong></div>
              </div>

            </div>

            <button 
              onClick={() => navigate(`/disruptions?id=${selectedFlight.id}`)}
              className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <span>View Disruption Cascade Map for Flight</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
