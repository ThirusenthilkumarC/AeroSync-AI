import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, RotateCcw, 
  MapPin, X, Globe, Search, RefreshCw, Compass, Navigation
} from 'lucide-react';
import { 
  worldAirports, 
  globalFlightsData, 
  globalAirlinesFilter, 
  regionViewCenters, 
  globalNetworkSummaryData 
} from '../../data/airlineNetwork';
import { getFlights } from '../../services/api';

// Helper: Calculate bearing in degrees between two coordinates (0° = North, 90° = East)
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

// Helper: Validate latitude and longitude
function isValidCoordinate(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' && 
         !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

// Map Controller for Dynamic View, FitBounds, and Resizing
function MapController({ center, zoom, bounds, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount, window resize, and layout transition
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: true });
    } else if (center) {
      map.setView(center, zoom || 3, { animate: true, duration: 1 });
    }
  }, [center, zoom, bounds, resetTrigger, map]);

  return null;
}

// Airport DivIcon Generator
const createAirportMarker = (airport, hasCritical, isSelected) => {
  return L.divIcon({
    className: 'world-airport-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        ${hasCritical ? '<span class="absolute -inset-2 rounded-full bg-red-500/50 animate-ping"></span>' : ''}
        <div class="px-2.5 py-1 rounded-md ${
          isSelected 
            ? 'bg-cyan-500 text-slate-950 font-extrabold ring-2 ring-white scale-110' 
            : hasCritical 
              ? 'bg-red-600 text-white font-bold' 
              : 'bg-slate-900/90 text-cyan-300'
        } border border-cyan-500/40 text-[11px] font-mono shadow-md flex items-center gap-1.5 group-hover:scale-110 transition-transform">
          <span class="w-1.5 h-1.5 rounded-full ${hasCritical ? 'bg-white' : 'bg-cyan-400'}"></span>
          <span>${airport.code}</span>
        </div>
      </div>
    `,
    iconSize: [46, 24],
    iconAnchor: [23, 12]
  });
};

// Aircraft DivIcon Generator with True Aviation Heading / Bearing
const createAircraftMarker = (flight, isSelected, bearing = 0) => {
  const colorBg = 
    flight.statusType === 'critical' ? 'bg-red-600 text-white shadow-red-500/50' :
    flight.statusType === 'delayed' ? 'bg-amber-500 text-white shadow-amber-500/50' :
    flight.statusType === 'inflight' ? 'bg-cyan-500 text-white shadow-cyan-500/50' :
    flight.statusType === 'ontime' ? 'bg-emerald-500 text-white shadow-emerald-500/50' :
    'bg-slate-700 text-slate-200';

  const ringStyle = isSelected ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-125' : '';

  return L.divIcon({
    className: 'world-aircraft-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        ${flight.isDisrupted ? '<span class="absolute -inset-2.5 rounded-full bg-red-500/60 animate-ping"></span>' : ''}
        <div class="w-8 h-8 rounded-full ${colorBg} shadow-lg border-2 border-white flex items-center justify-center transition-all duration-200 group-hover:scale-125 ${ringStyle}">
          <svg style="transform: rotate(${Math.round(bearing)}deg);" class="w-4 h-4 fill-current transition-transform duration-300" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
        <div class="absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 text-white text-[9px] font-mono whitespace-nowrap border border-slate-700 shadow-md pointer-events-none ${isSelected ? 'border-cyan-400 text-cyan-300 font-bold' : ''}">
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
  const [mapBounds, setMapBounds] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [activeRegion, setActiveRegion] = useState('WORLD');

  // Filter States
  const [selectedAirline, setSelectedAirline] = useState(propSelectedAirline || 'All Airlines');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [mapSearch, setMapSearch] = useState('');

  // Flights & Selection States
  const [flightsList, setFlightsList] = useState(globalFlightsData);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState(null);
  const [tileError, setTileError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC';
  });


  // Fetch / Refresh flights from backend API
  const refreshMapTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getFlights();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        // Integrate backend flights that have coordinates
        const merged = globalFlightsData.map(gf => {
          const matched = res.data.find(rf => rf.flightNumber === gf.flightNumber || rf.id === gf.id);
          if (matched) {
            return {
              ...gf,
              status: matched.status?.toUpperCase() || gf.status,
              delayMinutes: matched.delayMinutes ?? gf.delayMinutes,
              gate: matched.gate || gf.gate
            };
          }
          return gf;
        });
        setFlightsList(merged);
      }
      setLastTelemetryTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    } catch (err) {
      console.warn('[WorldNetworkMap] Telemetry refresh notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Periodic Telemetry Refresh (Every 45s)
  useEffect(() => {
    const timer = setInterval(() => {
      refreshMapTelemetry();
    }, 45000);
    return () => clearInterval(timer);
  }, [refreshMapTelemetry]);

  // Region View Switcher
  const handleRegionChange = (regionKey) => {
    setActiveRegion(regionKey);
    setSelectedFlight(null);
    setSelectedAirportCode(null);
    setMapBounds(null);
    const region = regionViewCenters[regionKey];
    if (region) {
      setMapCenter(region.center);
      setMapZoom(region.zoom);
      setResetTrigger(prev => prev + 1);
    }
  };

  // Select Flight and Fit Bounds
  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setSelectedAirportCode(null);
    if (flight?.coordinates) {
      const { originCoords, destCoords } = flight.coordinates;
      if (
        isValidCoordinate(originCoords[0], originCoords[1]) && 
        isValidCoordinate(destCoords[0], destCoords[1])
      ) {
        setMapBounds([originCoords, destCoords]);
      }
    }
  };

  // Select Airport
  const handleSelectAirport = (code) => {
    setSelectedAirportCode(code);
    setSelectedFlight(null);
    const airport = worldAirports[code];
    if (airport && isValidCoordinate(airport.lat, airport.lng)) {
      setMapCenter([airport.lat, airport.lng]);
      setMapZoom(5);
      setMapBounds(null);
      setResetTrigger(prev => prev + 1);
    }
  };

  // Reset to Full Network View
  const handleResetToWorld = () => {
    setSelectedFlight(null);
    setSelectedAirportCode(null);
    setMapBounds(null);
    setMapSearch('');
    setSelectedStatusFilter('ALL');
    setSelectedCategoryFilter('ALL');
    setActiveRegion('WORLD');
    setMapCenter([20.0, 10.0]);
    setMapZoom(2);
    setResetTrigger(prev => prev + 1);
  };

  // Filtered Flights Computation
  const filteredFlights = useMemo(() => {
    return flightsList.filter((flight) => {
      const matchesAirline = selectedAirline === 'All Airlines' || flight.airline === selectedAirline;
      
      const matchesStatus = 
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ON_TIME' && flight.statusType === 'ontime') ||
        (selectedStatusFilter === 'DELAYED' && flight.statusType === 'delayed') ||
        (selectedStatusFilter === 'CRITICAL' && flight.statusType === 'critical') ||
        (selectedStatusFilter === 'IN_FLIGHT' && flight.statusType === 'inflight') ||
        (selectedStatusFilter === 'CANCELLED' && flight.statusType === 'cancelled');

      const matchesCategory = 
        selectedCategoryFilter === 'ALL' ||
        (selectedCategoryFilter === 'CREW_RISK' && flight.crewStatus?.includes('Risk')) ||
        (selectedCategoryFilter === 'PAX_IMPACT' && (flight.affectedPax > 0 || flight.cascade?.passengerConnections)) ||
        (selectedCategoryFilter === 'GATE_CONFLICT' && flight.gate?.includes('Conflict'));

      const term = mapSearch.trim().toLowerCase();
      const matchesSearch = 
        !term ||
        flight.flightNumber.toLowerCase().includes(term) ||
        flight.origin.toLowerCase().includes(term) ||
        flight.destination.toLowerCase().includes(term) ||
        flight.originCity.toLowerCase().includes(term) ||
        flight.destinationCity.toLowerCase().includes(term) ||
        flight.tailNumber.toLowerCase().includes(term);

      const matchesAirport = 
        !selectedAirportCode || 
        flight.origin === selectedAirportCode || 
        flight.destination === selectedAirportCode;

      return matchesAirline && matchesStatus && matchesCategory && matchesSearch && matchesAirport;
    });
  }, [flightsList, selectedAirline, selectedStatusFilter, selectedCategoryFilter, mapSearch, selectedAirportCode]);

  return (
    <div className="w-full p-6 lg:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xl space-y-6">
      
      {/* 1. MAP HEADER & TELEMETRY STREAM STATUS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-5 border-b border-surface-container-highest">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5 font-label-code text-xs">
            <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-bold uppercase flex items-center gap-2 shadow-sm">
              <Globe className="w-4 h-4 text-cyan-400" />
              GLOBAL AIRLINE NETWORK • OPERATIONS CONTROL MAP
            </span>
            <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-secondary" />
              OCC Scheduled Rotation Telemetry • Last Fix: {lastTelemetryTimestamp}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs md:text-sm font-label-code pt-1">
            <span className="flex items-center gap-2 text-emerald-600 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Dispatch System Nominal
            </span>
            <span className="text-amber-600 font-bold">● {globalNetworkSummaryData.delayed} Delayed</span>
            <span className="text-error font-bold">● {globalNetworkSummaryData.critical} Critical</span>
            <span className="text-on-surface font-bold">● {globalNetworkSummaryData.affectedPassengers} Pax Protected</span>
          </div>
        </div>

        {/* REGION VIEW SWITCHER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container-highest font-label-code text-xs shrink-0 shadow-inner">
          {Object.keys(regionViewCenters).map((reg) => (
            <button
              key={reg}
              onClick={() => handleRegionChange(reg)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeRegion === reg 
                  ? 'bg-primary-container text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {reg}
            </button>
          ))}
          <button
            onClick={handleResetToWorld}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold transition-all flex items-center gap-1"
            title="Reset Map Bounds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. AIRLINE & MAP FILTERS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-4 rounded-2xl bg-surface-container-low/80 border border-surface-container-highest/80 shadow-sm font-label-code text-xs">
        
        {/* Search Input for Flights or Airports */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search Flight # or Hub..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-code text-xs border border-surface-container-highest focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          {mapSearch && (
            <button 
              onClick={() => setMapSearch('')}
              className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          
          {/* Airline Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant uppercase font-bold text-[11px]">Airline:</span>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-bold border border-surface-container-highest focus:outline-none shadow-sm cursor-pointer text-xs"
            >
              {globalAirlinesFilter.map((al) => (
                <option key={al} value={al}>{al}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full py-0.5">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'ON_TIME', label: 'On Time' },
              { id: 'DELAYED', label: 'Delayed' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'IN_FLIGHT', label: 'In Flight' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs shrink-0 ${
                  selectedStatusFilter === tab.id 
                    ? 'bg-primary-container text-on-primary shadow-sm' 
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Operational Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-semibold border border-surface-container-highest focus:outline-none shadow-sm cursor-pointer text-xs"
          >
            <option value="ALL">Operational View: All</option>
            <option value="CREW_RISK">Crew FDTL Risk</option>
            <option value="PAX_IMPACT">Passenger Connection Impact</option>
            <option value="GATE_CONFLICT">Gate Conflicts</option>
          </select>

          {/* Manual Telemetry Refresh Button */}
          <button
            onClick={refreshMapTelemetry}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-surface-container-highest font-bold transition-all flex items-center gap-1.5 shadow-sm text-xs disabled:opacity-50"
            title="Refresh Ingested Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

        </div>

      </div>

      {/* Airport Filter Indicator Banner */}
      {selectedAirportCode && (
        <div className="px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-label-code flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Filtering routes connected to Hub: <strong>{worldAirports[selectedAirportCode]?.name} ({selectedAirportCode})</strong></span>
          </div>
          <button 
            onClick={() => setSelectedAirportCode(null)}
            className="text-xs hover:underline flex items-center gap-1 text-white"
          >
            <span>Show All Hubs</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. FULL WORLD MAP CANVAS */}
      <div className="relative w-full h-[450px] sm:h-[580px] lg:h-[700px] rounded-2xl border border-surface-container-highest overflow-hidden shadow-2xl bg-slate-950">
        
        {tileError && (
          <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white font-label-code space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <div className="font-bold text-base">Tile map network timeout</div>
            <div className="text-xs text-slate-400">Displaying vector network topology using cached OCC airport dataset.</div>
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <MapController 
            center={mapCenter} 
            zoom={mapZoom} 
            bounds={mapBounds}
            resetTrigger={resetTrigger}
          />

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
            if (!isValidCoordinate(airport.lat, airport.lng)) return null;
            const hasCritical = ['DEL', 'MAA'].includes(code);
            const isSelected = selectedAirportCode === code;

            return (
              <Marker
                key={code}
                position={[airport.lat, airport.lng]}
                icon={createAirportMarker(airport, hasCritical, isSelected)}
                eventHandlers={{
                  click: () => handleSelectAirport(code)
                }}
              >
                <Popup className="font-label-code text-xs">
                  <div className="p-1 space-y-1.5 font-sans">
                    <div className="font-bold text-sm text-slate-900">{airport.name}</div>
                    <div className="text-xs text-slate-600">IATA: <strong>{airport.code}</strong> • {airport.country}</div>
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>Active Flights: <strong>{airport.activeFlights}</strong></div>
                      <div>Delayed: <strong className="text-red-600">{airport.delayedFlights}</strong></div>
                      <div>Gates Available: <strong>{airport.availableGates}</strong></div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => handleSelectAirport(code)}
                        className="w-full py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-bold"
                      >
                        Filter Routes for {code}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* FLIGHT ROUTES & AIRCRAFT MARKERS */}
          {filteredFlights.map((flight) => {
            if (!flight.coordinates) return null;
            const { currentLat, currentLng, originCoords, destCoords } = flight.coordinates;
            
            // Validate coordinates
            if (
              !isValidCoordinate(originCoords[0], originCoords[1]) ||
              !isValidCoordinate(destCoords[0], destCoords[1]) ||
              !isValidCoordinate(currentLat, currentLng)
            ) {
              return null;
            }

            const isSelected = selectedFlight?.id === flight.id;
            const isCritical = flight.statusType === 'critical';
            
            // Calculate true bearing from current position toward destination
            const bearing = calculateBearing(currentLat, currentLng, destCoords[0], destCoords[1]);

            return (
              <React.Fragment key={flight.id}>
                
                {/* Route Polyline */}
                <Polyline
                  positions={[originCoords, destCoords]}
                  pathOptions={{
                    color: 
                      isSelected ? '#38bdf8' :
                      isCritical ? '#ef4444' :
                      flight.statusType === 'delayed' ? '#f59e0b' :
                      flight.statusType === 'inflight' ? '#06b6d4' :
                      flight.statusType === 'ontime' ? '#10b981' : '#64748b',
                    weight: isSelected ? 4 : isCritical ? 3 : 2,
                    dashArray: isSelected ? undefined : isCritical ? '6, 6' : undefined,
                    opacity: isSelected ? 1 : 0.75
                  }}
                  eventHandlers={{
                    click: () => handleSelectFlight(flight)
                  }}
                />

                {/* Downstream Cascade Polyline if active */}
                {flight.cascade && isSelected && (
                  <Polyline
                    positions={[[28.5562, 77.1000], [51.4700, -0.4543]]}
                    pathOptions={{ color: '#6366f1', weight: 3, dashArray: '4, 4', opacity: 0.9 }}
                  />
                )}

                {/* AIRCRAFT MARKER WITH HEADING ROTATION */}
                <Marker
                  position={[currentLat, currentLng]}
                  icon={createAircraftMarker(flight, isSelected, bearing)}
                  eventHandlers={{
                    click: () => handleSelectFlight(flight)
                  }}
                >
                  <Popup className="font-label-code text-xs">
                    <div className="p-1 space-y-1 font-sans">
                      <div className="font-bold text-sm text-slate-900">{flight.flightNumber} ({flight.origin} → {flight.destination})</div>
                      <div className="text-xs text-slate-600">Airline: <strong>{flight.airline}</strong> • {flight.aircraft}</div>
                      <div className="pt-2 border-t border-slate-200 text-[11px] space-y-0.5">
                        <div>Status: <strong className={isCritical ? 'text-red-600' : 'text-emerald-700'}>{flight.statusLabel}</strong></div>
                        <div>Tail: <strong>{flight.tailNumber}</strong> • Gate: <strong>{flight.gate}</strong></div>
                        <div>Bearing: <strong>{Math.round(bearing)}°</strong> • Fix: <strong>{lastTelemetryTimestamp}</strong></div>
                      </div>
                      <button
                        onClick={() => handleSelectFlight(flight)}
                        className="mt-2 w-full py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-bold"
                      >
                        Inspect Full Telemetry
                      </button>
                    </div>
                  </Popup>
                </Marker>

              </React.Fragment>
            );
          })}

        </MapContainer>

        {/* ACTIVE DISRUPTION OVERLAY BADGE */}
        <div className="absolute top-5 left-5 z-10 bg-slate-950/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-red-500/50 shadow-2xl flex items-center gap-3 font-label-code text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <div>
            <div className="font-extrabold text-red-400">DISRUPTION CASCADE ALERT</div>
            <div className="text-[11px] text-slate-300">Flight 6E 1234 (MAA → DEL) • Delay +120m</div>
          </div>
        </div>

        {/* BOTTOM-RIGHT MAP LEGEND */}
        <div className="absolute bottom-4 right-4 z-10 bg-slate-950/95 backdrop-blur-md p-3 px-4 rounded-xl border border-slate-800 shadow-xl font-label-code text-[11px] text-white flex flex-wrap items-center gap-3.5 max-w-[90vw]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Time</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Delayed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> In Flight</span>
          <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-cyan-400" /> Aircraft</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-cyan-400"></span> Airport</span>
        </div>

      </div>

      {/* 4. GLOBAL NETWORK SUMMARY FOOTER */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 font-label-code text-center text-xs shadow-sm">
        <div>
          <span className="text-[10px] text-on-surface-variant uppercase font-bold">Total Airports</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-on-surface mt-0.5">{globalNetworkSummaryData.totalAirports}</div>
        </div>
        <div>
          <span className="text-[10px] text-on-surface-variant uppercase font-bold">Active Flights</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-on-surface mt-0.5">{globalNetworkSummaryData.activeFlights}</div>
        </div>
        <div>
          <span className="text-[10px] text-cyan-600 uppercase font-bold">In Flight</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-cyan-600 mt-0.5">{globalNetworkSummaryData.inFlight}</div>
        </div>
        <div>
          <span className="text-[10px] text-amber-600 uppercase font-bold">Delayed</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-amber-600 mt-0.5">{globalNetworkSummaryData.delayed}</div>
        </div>
        <div>
          <span className="text-[10px] text-error uppercase font-bold">Critical</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-error mt-0.5">{globalNetworkSummaryData.critical}</div>
        </div>
        <div>
          <span className="text-[10px] text-error uppercase font-bold">Affected PAX</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-error mt-0.5">{globalNetworkSummaryData.affectedPassengers}</div>
        </div>
        <div>
          <span className="text-[10px] text-secondary uppercase font-bold">Aircraft Avail</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-secondary mt-0.5">{globalNetworkSummaryData.aircraftAvailable}</div>
        </div>
        <div>
          <span className="text-[10px] text-secondary uppercase font-bold">Crew Avail</span>
          <div className="font-data-display text-lg sm:text-xl font-bold text-secondary mt-0.5">{globalNetworkSummaryData.crewAvailable}</div>
        </div>
      </div>

      {/* 5. SELECTED FLIGHT DETAILS PANEL */}
      {selectedFlight && (
        <div className="p-5 sm:p-7 rounded-2xl bg-surface-container-lowest border border-secondary-container/80 shadow-2xl space-y-4 font-label-code text-xs">
          
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-base font-data-display shadow-md">
                ✈
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface font-headline-lg">
                  {selectedFlight.flightNumber} ({selectedFlight.originCity} → {selectedFlight.destinationCity})
                </h3>
                <p className="text-xs text-on-surface-variant font-semibold">Airline: {selectedFlight.airline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetToWorld}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
              <button onClick={() => setSelectedFlight(null)} className="p-1.5 rounded-lg hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Current Status</span>
              <div className={`font-bold text-xs sm:text-sm mt-1 ${selectedFlight.statusType === 'critical' ? 'text-error' : 'text-emerald-700'}`}>
                {selectedFlight.statusLabel}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Aircraft & Tail</span>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">{selectedFlight.tailNumber}</div>
              <div className="text-[11px] text-on-surface-variant">{selectedFlight.aircraft}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Crew & Stand</span>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">{selectedFlight.crewStatus}</div>
              <div className="text-[11px] text-on-surface-variant">{selectedFlight.gate}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Seats & Impact</span>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">{selectedFlight.bookedSeats} / {selectedFlight.totalSeats} Booked</div>
              <div className="text-[11px] text-error font-bold">{selectedFlight.affectedPax} Affected PAX</div>
            </div>
          </div>

          {/* DISRUPTION CASCADE BREAKDOWN IF DISRUPTED */}
          {selectedFlight.cascade && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 space-y-2">
              <div className="font-bold text-xs text-error uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                DISRUPTION CASCADE VECTOR ANALYSIS
              </div>
              <div className="text-xs text-on-surface space-y-1">
                <div>• Affected Route: <strong>{selectedFlight.cascade.affectedRoute}</strong></div>
                <div>• Downstream Leg: <strong>{selectedFlight.cascade.downstreamFlight}</strong></div>
                <div>• Passenger Impact: <strong>{selectedFlight.cascade.passengerConnections}</strong></div>
                <div>• Crew Duty Impact: <strong>{selectedFlight.cascade.crewRisk}</strong></div>
                <div>• Gate Stand Impact: <strong>{selectedFlight.cascade.gateConflict}</strong></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/flights?id=${selectedFlight.id}`)}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-bold text-xs shadow-sm"
            >
              View Flight Telemetry
            </button>

            <button
              onClick={() => navigate('/disruptions')}
              className="px-4 py-2 rounded-xl bg-error text-on-error font-bold text-xs shadow-md"
            >
              Open AI Disruption Center
            </button>

            <button
              onClick={() => navigate('/recovery-sandbox')}
              className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs shadow-md"
            >
              Simulate Recovery Scenario
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
