import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plane, AlertTriangle, ArrowRight, Play, Pause, RotateCcw, 
  Layers, MapPin, Eye, CheckCircle2, Activity, Info, X, Zap, Globe, Filter, ShieldAlert, Users, Building2 
} from 'lucide-react';
import { 
  worldAirports, 
  globalFlightsData, 
  globalAirlinesFilter, 
  regionViewCenters, 
  globalNetworkSummaryData 
} from '../../data/airlineNetwork';

// Map View Changer Helper
function MapViewHandler({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Leaflet DivIcon Generators for Dark OCC Theme
const createAirportMarker = (airport, hasCritical) => {
  return L.divIcon({
    className: 'world-airport-marker',
    html: `
      <div className="relative flex items-center justify-center group cursor-pointer">
        ${hasCritical ? '<span className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping"></span>' : ''}
        <div className="px-2.5 py-1 rounded-md ${hasCritical ? 'bg-red-600 text-white font-bold' : 'bg-slate-900/90 text-cyan-300'} border border-cyan-500/40 text-[11px] font-mono shadow-md flex items-center gap-1.5 group-hover:scale-110 transition-transform">
          <span className="w-1.5 h-1.5 rounded-full ${hasCritical ? 'bg-white' : 'bg-cyan-400'}"></span>
          <span>${airport.code}</span>
        </div>
      </div>
    `,
    iconSize: [46, 24],
    iconAnchor: [23, 12]
  });
};

const createAircraftMarker = (flight) => {
  const colorBg = 
    flight.statusType === 'critical' ? 'bg-red-600 text-white shadow-red-500/50' :
    flight.statusType === 'delayed' ? 'bg-amber-500 text-white shadow-amber-500/50' :
    flight.statusType === 'inflight' ? 'bg-cyan-500 text-white shadow-cyan-500/50' :
    flight.statusType === 'ontime' ? 'bg-emerald-500 text-white shadow-emerald-500/50' :
    'bg-slate-700 text-slate-200';

  return L.divIcon({
    className: 'world-aircraft-marker',
    html: `
      <div className="relative flex items-center justify-center group cursor-pointer">
        ${flight.isDisrupted ? '<span className="absolute -inset-2 rounded-full bg-red-500/60 animate-ping"></span>' : ''}
        <div className="w-8 h-8 rounded-full ${colorBg} shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs transform transition-transform group-hover:scale-125">
          ✈
        </div>
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 text-white text-[9px] font-mono whitespace-nowrap border border-slate-700 shadow-md pointer-events-none">
          ${flight.flightNumber}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function WorldNetworkMap({ selectedAirline: propSelectedAirline }) {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState([20.0, 10.0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [activeRegion, setActiveRegion] = useState('WORLD');

  // Filter States
  const [selectedAirline, setSelectedAirline] = useState(propSelectedAirline || 'All Airlines');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Sync selectedAirline prop if changed from top header
  useEffect(() => {
    if (propSelectedAirline) {
      setSelectedAirline(propSelectedAirline);
    }
  }, [propSelectedAirline]);

  // Simulation & Selection States
  const [isSimulating, setIsSimulating] = useState(true);
  const [simStep, setSimStep] = useState(0);
  const [flightsList, setFlightsList] = useState(globalFlightsData);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [tileError, setTileError] = useState(false);

  // Region Switcher
  const handleRegionChange = (regionKey) => {
    setActiveRegion(regionKey);
    const region = regionViewCenters[regionKey];
    if (region) {
      setMapCenter(region.center);
      setMapZoom(region.zoom);
    }
  };

  // Simulated Live Aircraft Movement Loop (Deterministic)
  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimStep((prev) => {
          const nextStep = (prev + 1) % 20;
          setFlightsList((currentFlights) =>
            currentFlights.map((flight) => {
              if (!flight.coordinates) return flight;
              const { originCoords, destCoords } = flight.coordinates;
              const progress = (nextStep * 5) / 100;
              const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
              const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;

              return {
                ...flight,
                coordinates: {
                  ...flight.coordinates,
                  currentLat: parseFloat(lat.toFixed(4)),
                  currentLng: parseFloat(lng.toFixed(4))
                }
              };
            })
          );
          return nextStep;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Filtered Flights Computation
  const filteredFlights = useMemo(() => {
    return flightsList.filter((flight) => {
      const matchesAirline = selectedAirline === 'All Airlines' || flight.airline === selectedAirline;
      
      const matchesStatus = 
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ON_TIME' && flight.statusType === 'ontime') ||
        (selectedStatusFilter === 'DELAYED' && flight.statusType === 'delayed') ||
        (selectedStatusFilter === 'CRITICAL' && flight.statusType === 'critical') ||
        (selectedStatusFilter === 'IN_FLIGHT' && flight.statusType === 'inflight');

      const matchesCategory = 
        selectedCategoryFilter === 'ALL' ||
        (selectedCategoryFilter === 'CREW_RISK' && flight.crewStatus.includes('Risk')) ||
        (selectedCategoryFilter === 'PAX_IMPACT' && flight.affectedPax > 0) ||
        (selectedCategoryFilter === 'GATE_CONFLICT' && flight.gate.includes('Conflict'));

      return matchesAirline && matchesStatus && matchesCategory;
    });
  }, [flightsList, selectedAirline, selectedStatusFilter, selectedCategoryFilter]);

  return (
    <div className="w-full p-6 lg:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xl space-y-7 lg:space-y-8">
      
      {/* 1. MAP HEADER & REGION SWITCHER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-5 border-b border-surface-container-highest">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5 font-label-code text-xs">
            <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-fixed font-bold uppercase flex items-center gap-2 shadow-sm">
              <Globe className="w-4 h-4 text-cyan-400" />
              GLOBAL AIRLINE NETWORK • LIVE OPERATIONS MAP
            </span>
            <span className="text-on-surface-variant font-semibold">SIMULATED LIVE NETWORK • Demo operational data</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs md:text-sm font-label-code pt-1">
            <span className="flex items-center gap-2 text-emerald-600 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Network Operational
            </span>
            <span className="text-amber-600 font-bold">● 14 Delayed</span>
            <span className="text-error font-bold">● 6 Critical</span>
            <span className="text-on-surface font-bold">● 124 Affected PAX</span>
          </div>
        </div>

        {/* REGION VIEW SWITCHER BUTTONS */}
        <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container-highest font-label-code text-xs shrink-0 shadow-inner">
          {Object.keys(regionViewCenters).map((reg) => (
            <button
              key={reg}
              onClick={() => handleRegionChange(reg)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                activeRegion === reg 
                  ? 'bg-primary-container text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* 2. AIRLINE & MAP FILTERS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-5 lg:gap-6 p-5 lg:p-6 rounded-2xl bg-surface-container-low/80 border border-surface-container-highest/80 shadow-sm font-label-code text-xs md:text-sm">
        
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Airline Dropdown */}
          <div className="flex items-center gap-2.5">
            <span className="text-on-surface-variant uppercase font-bold text-xs">Airline:</span>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-bold border border-surface-container-highest focus:outline-none shadow-sm cursor-pointer"
            >
              {globalAirlinesFilter.map((al) => (
                <option key={al} value={al}>{al}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'ALL' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setSelectedStatusFilter('ON_TIME')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'ON_TIME' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              On Time
            </button>
            <button
              onClick={() => setSelectedStatusFilter('DELAYED')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'DELAYED' ? 'bg-amber-500 text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Delayed
            </button>
            <button
              onClick={() => setSelectedStatusFilter('CRITICAL')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'CRITICAL' ? 'bg-error text-on-error shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setSelectedStatusFilter('CANCELLED')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'CANCELLED' ? 'bg-slate-700 text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setSelectedStatusFilter('IN_FLIGHT')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedStatusFilter === 'IN_FLIGHT' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              In Flight
            </button>
          </div>

          {/* Operational Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-semibold border border-surface-container-highest focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">Operational View: All</option>
            <option value="CREW_RISK">Crew FDTL Risk</option>
            <option value="PAX_IMPACT">Passenger Connection Impact</option>
            <option value="GATE_CONFLICT">Gate Conflicts</option>
          </select>

        </div>

        {/* Simulation Movement Controls */}
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 shadow-md ${
            isSimulating ? 'bg-amber-500 text-white animate-pulse' : 'bg-secondary text-on-secondary hover:bg-secondary-container'
          }`}
        >
          {isSimulating ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
          <span>{isSimulating ? 'Pause Motion' : '▶ Animate Flight Movement'}</span>
        </button>

      </div>

      {/* 3. FULL WORLD MAP CANVAS (Generous Vertical Height) */}
      <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl border border-surface-container-highest overflow-hidden shadow-2xl bg-slate-950">
        
        {tileError && (
          <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white font-label-code space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <div className="font-bold text-base">Map service temporarily unavailable</div>
            <div className="text-xs text-slate-400">Rendering network topology using cached airport and flight dataset.</div>
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <MapViewHandler center={mapCenter} zoom={mapZoom} />

          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTileError(true)
            }}
          />

          {/* AIRPORT MARKERS */}
          {Object.entries(worldAirports).map(([code, airport]) => {
            const hasCritical = ['DEL', 'MAA'].includes(code);
            return (
              <Marker
                key={code}
                position={[airport.lat, airport.lng]}
                icon={createAirportMarker(airport, hasCritical)}
              >
                <Popup className="font-label-code text-xs">
                  <div className="p-1 space-y-1 font-sans">
                    <div className="font-bold text-sm text-slate-900">{airport.name}</div>
                    <div className="text-xs text-slate-600">Code: <strong>{airport.code}</strong> • {airport.country}</div>
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>Active Flights: <strong>{airport.activeFlights}</strong></div>
                      <div>Delayed Flights: <strong className="text-red-600">{airport.delayedFlights}</strong></div>
                      <div>Available Gates: <strong>{airport.availableGates}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* FLIGHT ROUTES & DISRUPTION CASCADE */}
          {filteredFlights.map((flight) => {
            if (!flight.coordinates) return null;
            const { currentLat, currentLng, originCoords, destCoords } = flight.coordinates;
            const isCritical = flight.statusType === 'critical';

            return (
              <React.Fragment key={flight.id}>
                
                {/* Route Polyline */}
                <Polyline
                  positions={[originCoords, destCoords]}
                  pathOptions={{
                    color: 
                      isCritical ? '#ef4444' :
                      flight.statusType === 'delayed' ? '#f59e0b' :
                      flight.statusType === 'inflight' ? '#06b6d4' :
                      flight.statusType === 'ontime' ? '#10b981' : '#64748b',
                    weight: isCritical ? 4 : 2,
                    dashArray: isCritical ? '6, 6' : undefined,
                    opacity: 0.85
                  }}
                  eventHandlers={{
                    click: () => setSelectedFlight(flight)
                  }}
                />

                {/* Downstream Cascade Polyline */}
                {flight.cascade && (
                  <Polyline
                    positions={[[28.5562, 77.1000], [51.4700, -0.4543]]}
                    pathOptions={{ color: '#6366f1', weight: 3, dashArray: '4, 4', opacity: 0.9 }}
                  />
                )}

                {/* MOVING AIRCRAFT MARKER */}
                <Marker
                  position={[currentLat, currentLng]}
                  icon={createAircraftMarker(flight)}
                  eventHandlers={{
                    click: () => setSelectedFlight(flight)
                  }}
                />

              </React.Fragment>
            );
          })}

        </MapContainer>

        {/* DISRUPTION CASCADE OVERLAY BADGE */}
        <div className="absolute top-5 left-5 z-10 bg-slate-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-red-500/50 shadow-2xl flex items-center gap-3.5 font-label-code text-xs md:text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
          <div>
            <div className="font-extrabold text-red-400">DISRUPTION CASCADE ACTIVE</div>
            <div className="text-xs text-slate-300 mt-0.5">Flight 6E 1234 (MAA → DEL) • Delay +120m</div>
          </div>
        </div>

        {/* BOTTOM-RIGHT MAP LEGEND */}
        <div className="absolute bottom-5 right-5 z-10 bg-slate-950/90 backdrop-blur-md p-4 px-5 rounded-2xl border border-slate-800 shadow-xl font-label-code text-xs text-white flex items-center gap-4">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> On Time</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Delayed</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Critical</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-500"></span> In Flight</span>
          <span className="flex items-center gap-2"><span className="font-bold text-cyan-400">✈</span> Aircraft</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-700 border border-cyan-400"></span> Airport</span>
        </div>

      </div>

      {/* 4. GLOBAL NETWORK SUMMARY FOOTER */}
      <div className="p-5 lg:p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6 font-label-code text-center text-xs md:text-sm shadow-sm">
        <div>
          <span className="text-xs text-on-surface-variant uppercase font-bold">Total Airports</span>
          <div className="font-data-display text-xl font-bold text-on-surface mt-1">{globalNetworkSummaryData.totalAirports}</div>
        </div>
        <div>
          <span className="text-xs text-on-surface-variant uppercase font-bold">Active Flights</span>
          <div className="font-data-display text-xl font-bold text-on-surface mt-1">{globalNetworkSummaryData.activeFlights}</div>
        </div>
        <div>
          <span className="text-xs text-cyan-600 uppercase font-bold">In Flight</span>
          <div className="font-data-display text-xl font-bold text-cyan-600 mt-1">{globalNetworkSummaryData.inFlight}</div>
        </div>
        <div>
          <span className="text-xs text-amber-600 uppercase font-bold">Delayed</span>
          <div className="font-data-display text-xl font-bold text-amber-600 mt-1">{globalNetworkSummaryData.delayed}</div>
        </div>
        <div>
          <span className="text-xs text-error uppercase font-bold">Critical</span>
          <div className="font-data-display text-xl font-bold text-error mt-1">{globalNetworkSummaryData.critical}</div>
        </div>
        <div>
          <span className="text-xs text-error uppercase font-bold">Affected PAX</span>
          <div className="font-data-display text-xl font-bold text-error mt-1">{globalNetworkSummaryData.affectedPassengers}</div>
        </div>
        <div>
          <span className="text-xs text-secondary uppercase font-bold">Aircraft Available</span>
          <div className="font-data-display text-xl font-bold text-secondary mt-1">{globalNetworkSummaryData.aircraftAvailable}</div>
        </div>
        <div>
          <span className="text-xs text-secondary uppercase font-bold">Crew Available</span>
          <div className="font-data-display text-xl font-bold text-secondary mt-1">{globalNetworkSummaryData.crewAvailable}</div>
        </div>
      </div>

      {/* 5. RIGHT-SIDE FLIGHT DETAILS PANEL */}
      {selectedFlight && (
        <div className="p-6 lg:p-8 rounded-2xl bg-surface-container-lowest border border-secondary-container/80 shadow-2xl space-y-5 font-label-code text-xs md:text-sm">
          
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg font-data-display shadow-md">
                ✈
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl text-on-surface font-headline-lg">
                  {selectedFlight.flightNumber} ({selectedFlight.originCity} → {selectedFlight.destinationCity})
                </h3>
                <p className="text-xs md:text-sm text-on-surface-variant font-semibold">Airline: {selectedFlight.airline}</p>
              </div>
            </div>
            <button onClick={() => setSelectedFlight(null)} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
              <X className="w-6 h-6 text-on-surface-variant" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-xs text-on-surface-variant uppercase font-bold">Current Status</span>
              <div className={`font-bold text-sm mt-1.5 ${selectedFlight.statusType === 'critical' ? 'text-error' : 'text-emerald-700'}`}>
                {selectedFlight.statusLabel}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-xs text-on-surface-variant uppercase font-bold">Aircraft Registration</span>
              <div className="font-bold text-sm text-on-surface mt-1.5">{selectedFlight.tailNumber}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{selectedFlight.aircraft}</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-xs text-on-surface-variant uppercase font-bold">Crew & Gate</span>
              <div className="font-bold text-sm text-on-surface mt-1.5">{selectedFlight.crewStatus}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{selectedFlight.gate}</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-xs text-on-surface-variant uppercase font-bold">Seat Inventory & PAX</span>
              <div className="font-bold text-sm text-on-surface mt-1.5">{selectedFlight.bookedSeats} / {selectedFlight.totalSeats} Booked</div>
              <div className="text-xs text-error font-bold mt-0.5">{selectedFlight.affectedPax} Affected PAX</div>
            </div>
          </div>

          {/* DISRUPTION CASCADE BREAKDOWN IF DISRUPTED */}
          {selectedFlight.cascade && (
            <div className="p-5 rounded-xl bg-error-container/30 border border-error/40 space-y-3">
              <div className="font-bold text-sm text-error uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                DISRUPTION CASCADE VECTOR ANALYSIS
              </div>
              <div className="text-xs md:text-sm text-on-surface space-y-1.5">
                <div>• Affected Route: <strong>{selectedFlight.cascade.affectedRoute}</strong></div>
                <div>• Downstream Leg: <strong>{selectedFlight.cascade.downstreamFlight}</strong></div>
                <div>• Passenger Impact: <strong>{selectedFlight.cascade.passengerConnections}</strong></div>
                <div>• Crew Duty Impact: <strong>{selectedFlight.cascade.crewRisk}</strong></div>
                <div>• Gate Impact: <strong>{selectedFlight.cascade.gateConflict}</strong></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => navigate(`/flights?id=${selectedFlight.id}`)}
              className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-bold text-xs md:text-sm shadow-sm"
            >
              View Flight Telemetry
            </button>

            <button
              onClick={() => navigate('/disruptions')}
              className="px-5 py-2.5 rounded-xl bg-error text-on-error font-bold text-xs md:text-sm shadow-md"
            >
              Open AI Disruption Center
            </button>

            <button
              onClick={() => navigate('/recovery-sandbox')}
              className="px-5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs md:text-sm shadow-md"
            >
              Simulate Recovery Scenario
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
