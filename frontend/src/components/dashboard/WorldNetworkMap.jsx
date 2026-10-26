import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, RotateCcw, 
  MapPin, X, Globe, Search, RefreshCw, Compass, Navigation,
  Plane, ArrowRight, ShieldCheck, Clock, Users, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { 
  worldAirports, 
  globalFlightsData, 
  globalAirlinesFilter, 
  regionViewCenters, 
  globalNetworkSummaryData 
} from '../../data/airlineNetwork';
import { indianAirports, airlineDatasets } from '../../data/airlines';
import { flightsData } from '../../data/flights';
import { getFlights } from '../../services/api';

// ---------------------------------------------------------------------------
// HELPER: Coordinate Validation
// ---------------------------------------------------------------------------
export function isValidCoordinate(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' && 
         !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

// ---------------------------------------------------------------------------
// HELPER: Resolve Airport Coordinates with Master Fallback
// ---------------------------------------------------------------------------
export function resolveAirportCoords(code) {
  if (!code) return null;
  const upper = String(code).toUpperCase().trim();
  if (worldAirports[upper] && isValidCoordinate(worldAirports[upper].lat, worldAirports[upper].lng)) {
    return [worldAirports[upper].lat, worldAirports[upper].lng];
  }
  if (indianAirports[upper] && isValidCoordinate(indianAirports[upper].lat, indianAirports[upper].lng)) {
    return [indianAirports[upper].lat, indianAirports[upper].lng];
  }
  return null;
}

// ---------------------------------------------------------------------------
// HELPER: Calculate Bearing (0° = North, 90° = East)
// ---------------------------------------------------------------------------
export function calculateBearing(startLat, startLng, destLat, destLng) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  const dLng = toRad(destLng - startLng);
  const y = Math.sin(dLng) * Math.cos(toRad(destLat));
  const x =
    Math.cos(toRad(startLat)) * Math.sin(toRad(destLat)) -
    Math.sin(toRad(startLat)) * Math.cos(toRad(destLat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// ---------------------------------------------------------------------------
// HELPER: Aviation Great-Circle Geodesic Arc Generator
// Computes curved spherical geodesic trajectory across Earth's surface
// ---------------------------------------------------------------------------
export function getGreatCircleArc(startLat, startLng, endLat, endLng, numPoints = 28) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  const phi1 = toRad(startLat);
  const lambda1 = toRad(startLng);
  const phi2 = toRad(endLat);
  const lambda2 = toRad(endLng);

  const cosDelta = Math.sin(phi1) * Math.sin(phi2) + 
                   Math.cos(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  const delta = Math.acos(Math.min(1, Math.max(-1, cosDelta)));

  if (isNaN(delta) || delta < 1e-5) {
    return [[startLat, startLng], [endLat, endLng]];
  }

  const sinDelta = Math.sin(delta);
  const arcPoints = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * delta) / sinDelta;
    const B = Math.sin(f * delta) / sinDelta;

    const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
    const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));

    arcPoints.push([lat, lng]);
  }

  return arcPoints;
}

// ---------------------------------------------------------------------------
// MAP CONTROLLER (Dynamic Pan, FitBounds, Resize Handling)
// ---------------------------------------------------------------------------
function MapController({ center, zoom, bounds, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 7, animate: true, duration: 1 });
    } else if (center) {
      map.setView(center, zoom || 3, { animate: true, duration: 1 });
    }
  }, [center, zoom, bounds, resetTrigger, map]);

  return null;
}

// ---------------------------------------------------------------------------
// LEAFLET CUSTOM ICONS
// ---------------------------------------------------------------------------

// Airport Hub DivIcon
const createAirportMarker = (airport, hasCritical, isSelected, isConnected) => {
  const ringStyle = isSelected 
    ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-125 z-30'
    : isConnected
      ? 'ring-2 ring-cyan-400/80 scale-110'
      : '';

  return L.divIcon({
    className: 'world-airport-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        ${hasCritical ? '<span class="absolute -inset-2.5 rounded-full bg-red-500/50 animate-ping"></span>' : ''}
        ${isSelected ? '<span class="absolute -inset-3 rounded-full bg-cyan-400/30 animate-pulse"></span>' : ''}
        <div class="px-2.5 py-1 rounded-md ${
          isSelected 
            ? 'bg-cyan-500 text-slate-950 font-black shadow-cyan-500/50' 
            : hasCritical 
              ? 'bg-red-600 text-white font-bold shadow-red-600/40' 
              : isConnected
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold'
                : 'bg-slate-900/90 text-cyan-300'
        } border border-cyan-500/50 text-[11px] font-mono shadow-lg flex items-center gap-1.5 transition-all duration-200 group-hover:scale-125 ${ringStyle}">
          <span class="w-1.5 h-1.5 rounded-full ${hasCritical ? 'bg-white' : isSelected ? 'bg-slate-950' : 'bg-cyan-400'}"></span>
          <span>${airport.code}</span>
        </div>
      </div>
    `,
    iconSize: [48, 26],
    iconAnchor: [24, 13]
  });
};

// Aircraft DivIcon with True Aviation Heading Rotation
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
        <div class="absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/95 text-white text-[9px] font-mono whitespace-nowrap border border-slate-700 shadow-md pointer-events-none ${isSelected ? 'border-cyan-400 text-cyan-300 font-bold' : ''}">
          ${flight.flightNumber}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Directional Trajectory Chevron Icon (Oriented along flight path)
const createRouteChevronIcon = (bearing = 0, color = '#38bdf8', isSelected = false) => {
  const size = isSelected ? 22 : 16;
  return L.divIcon({
    className: 'route-chevron-marker',
    html: `
      <div class="flex items-center justify-center pointer-events-none transition-transform duration-300" style="transform: rotate(${Math.round(bearing)}deg); width: ${size}px; height: ${size}px;">
        <svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-md" fill="${color}">
          <path d="M12 2L4 20l8-4 8 4L12 2z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT: WorldNetworkMap
// ---------------------------------------------------------------------------
export default function WorldNetworkMap({ selectedAirline: propSelectedAirline, flights: propFlights }) {
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

  // Selection States
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState(null);
  const [tileError, setTileError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC';
  });

  // Sync prop changes for selectedAirline
  useEffect(() => {
    if (propSelectedAirline && propSelectedAirline !== 'ALL') {
      setSelectedAirline(propSelectedAirline);
    }
  }, [propSelectedAirline]);

  // Master Ingested Flights List (Seed with globalFlightsData + domestic corridors)
  const [rawFlightsList, setRawFlightsList] = useState(globalFlightsData);

  // Fetch / Refresh flights from backend REST API
  const refreshMapTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getFlights();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        // Integrate backend flight updates dynamically
        setRawFlightsList(prev => {
          return prev.map(gf => {
            const matched = res.data.find(rf => 
              rf.flightNumber === gf.flightNumber || 
              rf.id === gf.id ||
              rf.flight_number === gf.flightNumber
            );
            if (matched) {
              const status = (matched.status || gf.status).toUpperCase();
              const delayMinutes = matched.delayMinutes ?? matched.delay_minutes ?? gf.delayMinutes;
              const isDisrupted = delayMinutes > 45 || status.includes('CRITICAL') || status.includes('DELAYED');
              return {
                ...gf,
                status,
                statusType: isDisrupted ? 'critical' : delayMinutes > 15 ? 'delayed' : gf.statusType,
                delayMinutes,
                gate: matched.gate || matched.gate_id || gf.gate,
                isDisrupted
              };
            }
            return gf;
          });
        });
      }
      setLastTelemetryTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    } catch (err) {
      console.warn('[WorldNetworkMap] Telemetry refresh notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Periodic Telemetry Refresh (Every 45 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      refreshMapTelemetry();
    }, 45000);
    return () => clearInterval(timer);
  }, [refreshMapTelemetry]);

  // -------------------------------------------------------------------------
  // FLIGHT DATA PIPELINE WITH AUTOMATIC COORDINATE RESOLUTION
  // Ensures all domestic & international corridors resolve coordinates reliably
  // -------------------------------------------------------------------------
  const resolvedFlightsList = useMemo(() => {
    const masterList = [...rawFlightsList];

    // Merge flights from airlineDatasets so any airline selected in the dashboard has its routes
    Object.entries(airlineDatasets).forEach(([alName, ds]) => {
      if (Array.isArray(ds?.flights)) {
        ds.flights.forEach(df => {
          if (!masterList.some(f => f.flightNumber === df.flightNumber || f.id === df.id)) {
            masterList.push({
              ...df,
              airline: df.airline || alName
            });
          }
        });
      }
    });

    // Merge flights from flightsData
    flightsData.forEach(fd => {
      if (!masterList.some(f => f.flightNumber === fd.flightNumber || f.id === fd.id)) {
        const inferredAirline = 
          fd.flightNumber?.startsWith('6E') ? 'IndiGo' :
          fd.flightNumber?.startsWith('AI') ? 'Air India' :
          fd.flightNumber?.startsWith('UK') ? 'Vistara' :
          fd.flightNumber?.startsWith('IX') ? 'Air India Express' :
          fd.flightNumber?.startsWith('QP') ? 'Akasa Air' : 'Demo Airline';
        masterList.push({
          ...fd,
          airline: fd.airline || inferredAirline
        });
      }
    });

    // If parent passed liveFlights from Dashboard, merge any missing flights
    if (Array.isArray(propFlights) && propFlights.length > 0) {
      propFlights.forEach(pf => {
        if (!masterList.some(f => f.flightNumber === pf.flightNumber || f.id === pf.id)) {
          masterList.push(pf);
        }
      });
    }

    // Resolve coordinates for each flight
    return masterList.map(flight => {
      let originCoords = flight.coordinates?.originCoords;
      let destCoords = flight.coordinates?.destCoords;

      if (!originCoords || !isValidCoordinate(originCoords[0], originCoords[1])) {
        originCoords = resolveAirportCoords(flight.origin);
      }
      if (!destCoords || !isValidCoordinate(destCoords[0], destCoords[1])) {
        destCoords = resolveAirportCoords(flight.destination);
      }

      if (!originCoords || !destCoords) {
        return null; // Cannot route without valid origin and dest
      }

      // Compute curved great-circle arc
      const arc = getGreatCircleArc(originCoords[0], originCoords[1], destCoords[0], destCoords[1], 28);

      // Midpoint along arc for directional chevron marker
      const midIdx = Math.floor(arc.length / 2);
      const midPoint = arc[midIdx] || originCoords;
      const midNext = arc[Math.min(midIdx + 1, arc.length - 1)] || destCoords;
      const routeBearing = calculateBearing(midPoint[0], midPoint[1], midNext[0], midNext[1]);

      // Determine aircraft live coordinates
      let currentLat = flight.coordinates?.currentLat;
      let currentLng = flight.coordinates?.currentLng;
      let hasLivePosition = false;

      if (isValidCoordinate(currentLat, currentLng)) {
        hasLivePosition = true;
      } else if (flight.statusType === 'inflight' || flight.status?.includes('IN FLIGHT')) {
        // Interpolate along route arc if airborne but exact ADS-B coordinates pending
        currentLat = midPoint[0];
        currentLng = midPoint[1];
        hasLivePosition = true;
      } else {
        // Flight is at origin gate / scheduled / on ground
        currentLat = originCoords[0];
        currentLng = originCoords[1];
        hasLivePosition = false;
      }

      // Calculate bearing from current position toward destination
      const aircraftBearing = calculateBearing(currentLat, currentLng, destCoords[0], destCoords[1]);

      const originCity = flight.originCity || worldAirports[flight.origin]?.city || flight.origin;
      const destinationCity = flight.destinationCity || worldAirports[flight.destination]?.city || flight.destination;

      return {
        ...flight,
        originCity,
        destinationCity,
        hasLivePosition,
        routeBearing,
        aircraftBearing,
        coordinates: {
          originCoords,
          destCoords,
          currentLat,
          currentLng
        },
        routeArc: arc,
        midPoint
      };
    }).filter(Boolean);
  }, [rawFlightsList, propFlights]);

  // -------------------------------------------------------------------------
  // FILTERED FLIGHTS COMPUTATION
  // -------------------------------------------------------------------------
  const filteredFlights = useMemo(() => {
    return resolvedFlightsList.filter(flight => {
      const matchesAirline = selectedAirline === 'All Airlines' || 
        flight.airline === selectedAirline ||
        (selectedAirline === 'Air India' && (flight.flightNumber?.startsWith('AI') || flight.airline?.includes('Air India'))) ||
        (selectedAirline === 'IndiGo' && (flight.flightNumber?.startsWith('6E') || flight.airline?.includes('IndiGo'))) ||
        (selectedAirline === 'Vistara' && (flight.flightNumber?.startsWith('UK') || flight.airline?.includes('Vistara'))) ||
        (selectedAirline === 'Air India Express' && (flight.flightNumber?.startsWith('IX') || flight.airline?.includes('Express'))) ||
        (selectedAirline === 'Akasa Air' && (flight.flightNumber?.startsWith('QP') || flight.airline?.includes('Akasa')));
      
      const matchesStatus = 
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ON_TIME' && (flight.statusType === 'ontime' || flight.status === 'ON TIME')) ||
        (selectedStatusFilter === 'DELAYED' && (flight.statusType === 'delayed' || flight.status === 'DELAYED')) ||
        (selectedStatusFilter === 'CRITICAL' && (flight.statusType === 'critical' || flight.status === 'CRITICAL')) ||
        (selectedStatusFilter === 'IN_FLIGHT' && (flight.statusType === 'inflight' || flight.status?.includes('IN FLIGHT'))) ||
        (selectedStatusFilter === 'SCHEDULED' && (flight.statusType === 'scheduled' || flight.status === 'SCHEDULED'));

      const matchesCategory = 
        selectedCategoryFilter === 'ALL' ||
        (selectedCategoryFilter === 'CREW_RISK' && flight.crewStatus?.includes('Risk')) ||
        (selectedCategoryFilter === 'PAX_IMPACT' && (flight.affectedPax > 0 || flight.cascade?.passengerConnections)) ||
        (selectedCategoryFilter === 'GATE_CONFLICT' && (flight.gate?.includes('Conflict') || flight.gateStatus?.includes('CONFLICT')));

      const term = mapSearch.trim().toLowerCase();
      const matchesSearch = 
        !term ||
        flight.flightNumber?.toLowerCase().includes(term) ||
        flight.origin?.toLowerCase().includes(term) ||
        flight.destination?.toLowerCase().includes(term) ||
        flight.originCity?.toLowerCase().includes(term) ||
        flight.destinationCity?.toLowerCase().includes(term) ||
        flight.tailNumber?.toLowerCase().includes(term);

      const matchesAirport = 
        !selectedAirportCode || 
        flight.origin === selectedAirportCode || 
        flight.destination === selectedAirportCode;

      return matchesAirline && matchesStatus && matchesCategory && matchesSearch && matchesAirport;
    });
  }, [resolvedFlightsList, selectedAirline, selectedStatusFilter, selectedCategoryFilter, mapSearch, selectedAirportCode]);

  // Connected flights for currently selected airport
  const airportConnectedFlights = useMemo(() => {
    if (!selectedAirportCode) return { departures: [], arrivals: [] };
    const departures = resolvedFlightsList.filter(f => f.origin === selectedAirportCode);
    const arrivals = resolvedFlightsList.filter(f => f.destination === selectedAirportCode);
    return { departures, arrivals };
  }, [selectedAirportCode, resolvedFlightsList]);

  // -------------------------------------------------------------------------
  // INTERACTION HANDLERS
  // -------------------------------------------------------------------------
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

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setSelectedAirportCode(null);
    if (flight?.coordinates) {
      const { originCoords, destCoords } = flight.coordinates;
      if (isValidCoordinate(originCoords[0], originCoords[1]) && isValidCoordinate(destCoords[0], destCoords[1])) {
        setMapBounds([originCoords, destCoords]);
      }
    }
  };

  const handleSelectAirport = (code) => {
    setSelectedAirportCode(code);
    setSelectedFlight(null);
    const airport = worldAirports[code] || indianAirports[code];
    if (airport && isValidCoordinate(airport.lat, airport.lng)) {
      setMapCenter([airport.lat, airport.lng]);
      setMapZoom(5);
      setMapBounds(null);
      setResetTrigger(prev => prev + 1);
    }
  };

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

  // Helper for Route Colors by Status
  const getRouteColor = (flight, isSelected) => {
    if (isSelected) return '#38bdf8'; // Bright Sky Cyan for selected
    if (flight.statusType === 'critical' || flight.status === 'CRITICAL') return '#ef4444'; // Red
    if (flight.statusType === 'delayed' || flight.status === 'DELAYED') return '#f59e0b'; // Amber
    if (flight.statusType === 'inflight' || flight.status?.includes('IN FLIGHT')) return '#06b6d4'; // Cyan
    if (flight.statusType === 'ontime' || flight.status === 'ON TIME') return '#10b981'; // Emerald
    return '#64748b'; // Slate for scheduled/ground
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xl space-y-5">
      
      {/* ---------------------------------------------------------------------
          1. MAP HEADER & TELEMETRY STREAM STATUS
         --------------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 font-label-code text-xs">
            <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-bold uppercase flex items-center gap-2 shadow-sm">
              <Globe className="w-4 h-4 text-cyan-400" />
              GLOBAL AIRLINE NETWORK • OPERATIONS CONTROL MAP
            </span>
            <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-secondary" />
              OCC Live Trajectory Telemetry • Fix: {lastTelemetryTimestamp}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-label-code pt-1">
            <span className="flex items-center gap-2 text-emerald-600 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Dispatch System Nominal
            </span>
            <span className="text-cyan-600 font-bold">● {globalNetworkSummaryData.inFlight} In Flight</span>
            <span className="text-amber-600 font-bold">● {globalNetworkSummaryData.delayed} Delayed</span>
            <span className="text-error font-bold">● {globalNetworkSummaryData.critical} Critical</span>
            <span className="text-on-surface font-bold">● {globalNetworkSummaryData.affectedPassengers} Pax Protected</span>
          </div>
        </div>

        {/* REGION VIEW SWITCHER BUTTONS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl border border-surface-container-highest font-label-code text-xs shrink-0 shadow-inner">
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
            title="Reset to Full Network View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          2. AIRLINE & MAP FILTERS TOOLBAR
         --------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-low/80 border border-surface-container-highest/80 shadow-sm font-label-code text-xs">
        
        {/* Search Input for Flights or Hubs */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search Flight # or Hub (e.g. MAA, BLR)..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-code text-xs border border-surface-container-highest focus:outline-none focus:ring-1 focus:ring-secondary"
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

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full py-0.5">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'IN_FLIGHT', label: 'In Flight' },
              { id: 'ON_TIME', label: 'On Time' },
              { id: 'DELAYED', label: 'Delayed' },
              { id: 'CRITICAL', label: 'Critical' }
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

      {/* Airport Selection Filter Indicator Banner */}
      {selectedAirportCode && (
        <div className="px-4 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-label-code flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>
              Filtering routes connected to Hub: <strong>{worldAirports[selectedAirportCode]?.name || selectedAirportCode} ({selectedAirportCode})</strong>
              &nbsp;• {airportConnectedFlights.departures.length} Departures, {airportConnectedFlights.arrivals.length} Arrivals
            </span>
          </div>
          <button 
            onClick={() => setSelectedAirportCode(null)}
            className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-xs text-white font-bold flex items-center gap-1 transition-colors"
          >
            <span>Show All Hubs</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          3. FULL WORLD MAP CANVAS (Responsive Height & Leaflet Engine)
         --------------------------------------------------------------------- */}
      <div className="relative w-full h-[440px] sm:h-[540px] md:h-[620px] lg:h-[720px] rounded-2xl border border-surface-container-highest overflow-hidden shadow-2xl bg-slate-950">
        
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

          {/* ---------------------------------------------------------------
              CONNECTING FLIGHT ROUTES (Great-Circle Arcs & Trajectories)
             --------------------------------------------------------------- */}
          {filteredFlights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;
            const isCritical = flight.statusType === 'critical';
            const routeColor = getRouteColor(flight, isSelected);

            // Determine if route should be dimmed (when another flight or airport is selected)
            const isDimmed = (selectedFlight && !isSelected) || 
                             (selectedAirportCode && flight.origin !== selectedAirportCode && flight.destination !== selectedAirportCode);

            const opacity = isSelected ? 1.0 : isDimmed ? 0.12 : 0.8;
            const weight = isSelected ? 5 : isCritical ? 3.5 : 2.5;
            const dashArray = isSelected ? undefined : isCritical ? '8, 6' : flight.statusType === 'scheduled' ? '4, 6' : undefined;

            return (
              <React.Fragment key={`route-${flight.id}`}>
                
                {/* Glow Underlay for Selected Route */}
                {isSelected && (
                  <Polyline
                    positions={flight.routeArc}
                    pathOptions={{
                      color: '#38bdf8',
                      weight: 10,
                      opacity: 0.35,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                )}

                {/* Primary Great-Circle Flight Path */}
                <Polyline
                  positions={flight.routeArc}
                  pathOptions={{
                    color: routeColor,
                    weight,
                    dashArray,
                    opacity,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                  eventHandlers={{
                    click: () => handleSelectFlight(flight)
                  }}
                />

                {/* Downstream Cascade Polyline for Selected Disrupted Flight */}
                {flight.cascade && isSelected && (
                  <Polyline
                    positions={[[12.9941, 80.1709], [28.5562, 77.1000]]}
                    pathOptions={{ color: '#818cf8', weight: 3, dashArray: '4, 4', opacity: 0.9 }}
                  />
                )}

                {/* Midpoint Directional Chevron Marker (Flight Travel Direction) */}
                {!isDimmed && flight.midPoint && (
                  <Marker
                    position={flight.midPoint}
                    icon={createRouteChevronIcon(flight.routeBearing, routeColor, isSelected)}
                    interactive={false}
                  />
                )}

                {/* AIRCRAFT MARKER WITH HEADING ROTATION (Positioned along route) */}
                <Marker
                  position={[flight.coordinates.currentLat, flight.coordinates.currentLng]}
                  icon={createAircraftMarker(flight, isSelected, flight.aircraftBearing)}
                  eventHandlers={{
                    click: () => handleSelectFlight(flight)
                  }}
                >
                  <Popup className="font-label-code text-xs">
                    <div className="p-1 space-y-1.5 font-sans">
                      <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                        <span>{flight.flightNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {flight.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">
                        {flight.origin} ({flight.originCity}) → {flight.destination} ({flight.destinationCity})
                      </div>
                      <div className="text-xs text-slate-600">Airline: <strong>{flight.airline}</strong> • {flight.aircraft}</div>
                      
                      <div className="pt-2 border-t border-slate-200 text-[11px] space-y-0.5">
                        <div>Position Status: <strong>{flight.hasLivePosition ? 'Airborne (ADS-B Live)' : 'Scheduled / Ground Stand'}</strong></div>
                        <div>Tail: <strong>{flight.tailNumber}</strong> • Gate: <strong>{flight.gate || 'Assigned'}</strong></div>
                        <div>Bearing: <strong>{Math.round(flight.aircraftBearing)}°</strong> • Fix: <strong>{lastTelemetryTimestamp}</strong></div>
                      </div>

                      <button
                        onClick={() => handleSelectFlight(flight)}
                        className="mt-2 w-full py-1.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold hover:bg-slate-800 transition-colors"
                      >
                        Select Route & Inspect Telemetry
                      </button>
                    </div>
                  </Popup>
                </Marker>

              </React.Fragment>
            );
          })}

          {/* ---------------------------------------------------------------
              AIRPORT MARKERS
             --------------------------------------------------------------- */}
          {Object.entries(worldAirports).map(([code, airport]) => {
            if (!isValidCoordinate(airport.lat, airport.lng)) return null;
            const hasCritical = ['DEL', 'MAA', 'MDU'].includes(code);
            const isSelected = selectedAirportCode === code;
            const isConnected = selectedFlight && (selectedFlight.origin === code || selectedFlight.destination === code);

            return (
              <Marker
                key={code}
                position={[airport.lat, airport.lng]}
                icon={createAirportMarker(airport, hasCritical, isSelected, isConnected)}
                eventHandlers={{
                  click: () => handleSelectAirport(code)
                }}
              >
                <Popup className="font-label-code text-xs">
                  <div className="p-1 space-y-1.5 font-sans">
                    <div className="font-bold text-sm text-slate-900">{airport.name}</div>
                    <div className="text-xs text-slate-600">IATA: <strong>{airport.code}</strong> • {airport.city}, {airport.country}</div>
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                      <div>Active Flights: <strong>{airport.activeFlights}</strong></div>
                      <div>Delayed: <strong className="text-red-600">{airport.delayedFlights}</strong></div>
                      <div>Gates Available: <strong>{airport.availableGates}</strong></div>
                      <div>Runway Status: <strong className="text-emerald-700">Nominal</strong></div>
                    </div>
                    <div className="pt-2 flex gap-1.5">
                      <button
                        onClick={() => handleSelectAirport(code)}
                        className="flex-1 py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-bold hover:bg-slate-800 transition-colors"
                      >
                        Filter Routes for {code}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>

        {/* ACTIVE DISRUPTION OVERLAY BADGE */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-red-500/50 shadow-2xl flex items-center gap-3 font-label-code text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <div>
            <div className="font-extrabold text-red-400">DISRUPTION CASCADE ALERT</div>
            <div className="text-[11px] text-slate-300">Flight AI 204 (MDU → MAA) • Delay +90m • FDTL Exceedance</div>
          </div>
        </div>

        {/* RESET VIEW BUTTON ON MAP */}
        {(selectedFlight || selectedAirportCode || activeRegion !== 'WORLD') && (
          <button
            onClick={handleResetToWorld}
            className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md hover:bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-xl font-label-code text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Network</span>
          </button>
        )}

        {/* BOTTOM-RIGHT MAP LEGEND */}
        <div className="absolute bottom-4 right-4 z-10 bg-slate-950/95 backdrop-blur-md p-2.5 px-3.5 rounded-xl border border-slate-800 shadow-xl font-label-code text-[11px] text-white flex flex-wrap items-center gap-3 max-w-[90vw]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Time</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Delayed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> In Flight</span>
          <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-cyan-400" /> Aircraft</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-cyan-400"></span> Hub</span>
        </div>

      </div>

      {/* ---------------------------------------------------------------------
          4. AIRPORT OCC HUB INSPECTION CARD (When an Airport is Clicked)
         --------------------------------------------------------------------- */}
      {selectedAirportCode && (
        <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-lowest border border-cyan-500/40 shadow-xl space-y-4 font-label-code text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container-highest">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-base font-data-display shadow-md">
                {selectedAirportCode}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface">
                  {worldAirports[selectedAirportCode]?.name || selectedAirportCode}
                </h3>
                <p className="text-xs text-on-surface-variant font-semibold">
                  City: {worldAirports[selectedAirportCode]?.city} • Country: {worldAirports[selectedAirportCode]?.country} • Gates: {worldAirports[selectedAirportCode]?.availableGates} Available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetToWorld}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Hubs</span>
              </button>
              <button onClick={() => setSelectedAirportCode(null)} className="p-1.5 rounded-lg hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Departures */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-600 uppercase">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  Active Departures ({airportConnectedFlights.departures.length})
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {airportConnectedFlights.departures.length === 0 ? (
                  <div className="text-on-surface-variant text-xs italic py-2">No active departures recorded.</div>
                ) : (
                  airportConnectedFlights.departures.map(flight => (
                    <div 
                      key={flight.id}
                      onClick={() => handleSelectFlight(flight)}
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container cursor-pointer border border-surface-container-highest/60 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{flight.flightNumber}</span>
                        <span className="text-on-surface-variant">→ {flight.destination} ({flight.destinationCity})</span>
                      </div>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        flight.statusType === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {flight.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Arrivals */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-secondary uppercase">
                <span className="flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4" />
                  Active Arrivals ({airportConnectedFlights.arrivals.length})
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {airportConnectedFlights.arrivals.length === 0 ? (
                  <div className="text-on-surface-variant text-xs italic py-2">No active arrivals recorded.</div>
                ) : (
                  airportConnectedFlights.arrivals.map(flight => (
                    <div 
                      key={flight.id}
                      onClick={() => handleSelectFlight(flight)}
                      className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container cursor-pointer border border-surface-container-highest/60 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{flight.flightNumber}</span>
                        <span className="text-on-surface-variant">from {flight.origin} ({flight.originCity})</span>
                      </div>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        flight.statusType === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {flight.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          5. SELECTED FLIGHT DETAILS & TELEMETRY PANEL
         --------------------------------------------------------------------- */}
      {selectedFlight && (
        <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-lowest border border-cyan-500/50 shadow-2xl space-y-4 font-label-code text-xs animate-in fade-in duration-200">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container-highest">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-base font-data-display shadow-md">
                <Plane className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface">
                  {selectedFlight.flightNumber} ({selectedFlight.origin} → {selectedFlight.destination})
                </h3>
                <p className="text-xs text-on-surface-variant font-semibold">
                  Route Corridor: {selectedFlight.originCity} to {selectedFlight.destinationCity} • Airline: {selectedFlight.airline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetToWorld}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Routes</span>
              </button>
              <button onClick={() => setSelectedFlight(null)} className="p-1.5 rounded-lg hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase font-bold">
                <span>Operational Status</span>
                <Clock className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className={`font-bold text-xs sm:text-sm mt-1 ${
                selectedFlight.statusType === 'critical' ? 'text-error' : selectedFlight.statusType === 'delayed' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {selectedFlight.statusLabel || selectedFlight.status}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                Delay: {selectedFlight.delayMinutes || 0} mins
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase font-bold">
                <span>Aircraft & Stand</span>
                <Plane className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">{selectedFlight.tailNumber}</div>
              <div className="text-[11px] text-on-surface-variant">{selectedFlight.aircraft || selectedFlight.aircraftType}</div>
              <div className="text-[10px] text-secondary font-bold mt-0.5">{selectedFlight.gate || 'Gate Assigned'}</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase font-bold">
                <span>Crew Duty Status</span>
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">{selectedFlight.crewStatus || 'Nominal Crew'}</div>
              <div className="text-[11px] text-on-surface-variant">Bearing: {Math.round(selectedFlight.aircraftBearing || selectedFlight.routeBearing)}°</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase font-bold">
                <span>Seat Load & PAX</span>
                <Users className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-on-surface mt-1">
                {selectedFlight.bookedSeats || 160} / {selectedFlight.totalSeats || 180} Booked
              </div>
              <div className={`text-[11px] font-bold ${selectedFlight.affectedPax > 0 ? 'text-error' : 'text-emerald-700'}`}>
                {selectedFlight.affectedPax || 0} Affected Passengers
              </div>
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
                <div>• Affected Route Corridor: <strong>{selectedFlight.cascade.affectedRoute}</strong></div>
                <div>• Downstream Dependent Leg: <strong>{selectedFlight.cascade.downstreamFlight}</strong></div>
                <div>• Passenger Connection Risk: <strong>{selectedFlight.cascade.passengerConnections}</strong></div>
                <div>• Crew Duty Lockout: <strong>{selectedFlight.cascade.crewRisk}</strong></div>
                <div>• Stand / Gate Conflict: <strong>{selectedFlight.cascade.gateConflict}</strong></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => navigate(`/flights?id=${selectedFlight.id}`)}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>View Flight Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5 text-secondary" />
            </button>

            <button
              onClick={() => navigate('/disruptions')}
              className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 font-bold text-xs shadow-md transition-colors"
            >
              Open AI Disruption Center
            </button>

            <button
              onClick={() => navigate('/recovery-sandbox')}
              className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 font-bold text-xs shadow-md transition-colors"
            >
              Simulate Recovery Scenario
            </button>

            <button
              onClick={() => navigate('/booking')}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary-container/90 font-bold text-xs shadow-md transition-colors"
            >
              Seat Map & Booking
            </button>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------------
          6. GLOBAL NETWORK SUMMARY FOOTER
         --------------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-label-code text-center text-xs shadow-sm">
        <div>
          <span className="text-[10px] text-on-surface-variant uppercase font-bold">Total Hubs</span>
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

    </div>
  );
}
