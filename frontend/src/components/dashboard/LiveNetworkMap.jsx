import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plane, AlertTriangle, ArrowRight, Play, Pause, RotateCcw, 
  Layers, MapPin, Eye, CheckCircle2, Activity, Info, X, Zap 
} from 'lucide-react';
import { indianAirports } from '../../data/airlines';

// Component to handle map view reset
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcon Generators using pure HTML & SVG
const createAirportIcon = (code, isAffected) => {
  return L.divIcon({
    className: 'custom-airport-icon',
    html: `
      <div className="relative flex items-center justify-center">
        ${isAffected ? '<span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></span>' : ''}
        <div className="px-2 py-1 rounded-md ${isAffected ? 'bg-error text-white font-bold' : 'bg-primary-container text-white'} text-[10px] font-mono shadow-md border border-white/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full ${isAffected ? 'bg-white' : 'bg-cyan-400'}"></span>
          <span>${code}</span>
        </div>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12]
  });
};

const createAircraftIcon = (flight, statusType) => {
  const colorClass = 
    statusType === 'critical' ? 'bg-red-500 text-white shadow-red-500/50' :
    statusType === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/50' :
    statusType === 'grounded' ? 'bg-slate-700 text-slate-300' :
    'bg-emerald-500 text-white shadow-emerald-500/50';

  return L.divIcon({
    className: 'custom-aircraft-icon',
    html: `
      <div className="relative flex items-center justify-center group cursor-pointer">
        ${statusType === 'critical' ? '<span className="absolute -inset-2 rounded-full bg-red-500/50 animate-ping"></span>' : ''}
        <div className="w-8 h-8 rounded-full ${colorClass} shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs transform transition-transform group-hover:scale-125">
          ✈
        </div>
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[9px] font-mono whitespace-nowrap shadow-md pointer-events-none">
          ${flight.flightNumber}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function LiveNetworkMap({ selectedAirline, activeFlights, networkStats }) {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, DELAYED, AT_RISK, AIRPORTS, ROUTES
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simulatedFlights, setSimulatedFlights] = useState(activeFlights);

  // Sync state when activeFlights or selectedAirline changes
  useEffect(() => {
    setSimulatedFlights(activeFlights);
    setSelectedFlight(null);
  }, [activeFlights, selectedAirline]);

  // Demo Live Simulation Loop (Deterministic motion every 3 seconds)
  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimStep((prev) => {
          const nextStep = (prev + 1) % 10;
          setSimulatedFlights((currentList) =>
            currentList.map((flight) => {
              if (!flight.coordinates) return flight;
              const { originCoords, destCoords } = flight.coordinates;
              const progress = ((nextStep * 10) % 100) / 100;
              const interpolatedLat = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
              const interpolatedLng = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;
              
              return {
                ...flight,
                coordinates: {
                  ...flight.coordinates,
                  currentLat: parseFloat(interpolatedLat.toFixed(4)),
                  currentLng: parseFloat(interpolatedLng.toFixed(4))
                }
              };
            })
          );
          return nextStep;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleResetView = () => {
    setMapCenter([20.5937, 78.9629]);
    setMapZoom(5);
    setSelectedFlight(null);
  };

  const filteredFlightsList = simulatedFlights.filter((flight) => {
    if (filterMode === 'DELAYED') return flight.statusType === 'critical';
    if (filterMode === 'AT_RISK') return flight.statusType === 'warning';
    return true;
  });

  return (
    <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-md space-y-4">
      
      {/* Top Map Header & Live Summary Strip */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-code text-[10px] font-bold uppercase">
              DEMO LIVE FEED • SIMULATED LIVE POSITIONS
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h2 className="font-headline-lg text-xl font-bold text-on-surface">
            {selectedAirline} — Live Network & Flight Position Map
          </h2>
        </div>

        {/* Live Network Summary Metrics Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-surface-container-low p-2.5 px-4 rounded-xl border border-surface-container-highest font-label-code text-xs">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Tracked</span>
            <div className="font-bold text-on-surface">{networkStats.totalFlights}</div>
          </div>
          <div className="w-px h-6 bg-surface-container-highest"></div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Airborne</span>
            <div className="font-bold text-secondary">{networkStats.totalFlights - 4}</div>
          </div>
          <div className="w-px h-6 bg-surface-container-highest"></div>
          <div>
            <span className="text-[10px] text-error uppercase font-bold">Delayed</span>
            <div className="font-bold text-error">{networkStats.delayedFlights}</div>
          </div>
          <div className="w-px h-6 bg-surface-container-highest"></div>
          <div>
            <span className="text-[10px] text-amber-600 uppercase font-bold">At Risk</span>
            <div className="font-bold text-amber-600">8</div>
          </div>
          <div className="w-px h-6 bg-surface-container-highest"></div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Pax Impacted</span>
            <div className="font-bold text-error">{networkStats.affectedPax}</div>
          </div>
        </div>
      </div>

      {/* Map Control Bar & Simulation Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-label-code text-xs">
        
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterMode === 'ALL' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All Flights
          </button>
          <button
            onClick={() => setFilterMode('DELAYED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterMode === 'DELAYED' ? 'bg-error text-on-error' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Delayed
          </button>
          <button
            onClick={() => setFilterMode('AT_RISK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterMode === 'AT_RISK' ? 'bg-amber-500 text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            At Risk
          </button>
          <button
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>

        {/* Right Simulation Trigger Button */}
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm ${
            isSimulating 
              ? 'bg-amber-500 text-white animate-pulse' 
              : 'bg-secondary text-on-secondary hover:bg-secondary-container'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isSimulating ? 'Pause Live Simulation' : '▶ Start Live Simulation'}</span>
        </button>

      </div>

      {/* Main Interactive Leaflet Map Container */}
      <div className="relative w-full h-[480px] rounded-2xl border border-surface-container-highest overflow-hidden shadow-inner bg-slate-950">
        
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <ChangeMapView center={mapCenter} zoom={mapZoom} />

          {/* Free OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Airport Markers */}
          {Object.entries(indianAirports).map(([code, airport]) => {
            const isAffected = ['DEL', 'MAA', 'MDU'].includes(code);
            return (
              <Marker
                key={code}
                position={[airport.lat, airport.lng]}
                icon={createAirportIcon(code, isAffected)}
              >
                <Popup className="font-label-code text-xs">
                  <div className="font-bold">{airport.fullName}</div>
                  <div className="text-slate-600">Hub Status: {airport.hub ? 'Primary Hub' : 'Regional Airport'}</div>
                  {isAffected && <div className="text-red-600 font-bold mt-1">⚠️ Active Disruption Bottleneck</div>}
                </Popup>
              </Marker>
            );
          })}

          {/* Render Flight Route Lines & Aircraft Markers */}
          {filteredFlightsList.map((flight) => {
            if (!flight.coordinates) return null;
            const { currentLat, currentLng, originCoords, destCoords } = flight.coordinates;
            const isDisrupted = flight.statusType === 'critical';

            return (
              <React.Fragment key={flight.id}>
                {/* Route Polyline */}
                <Polyline
                  positions={[originCoords, destCoords]}
                  pathOptions={{
                    color: isDisrupted ? '#ef4444' : flight.statusType === 'warning' ? '#f59e0b' : '#0284c7',
                    weight: isDisrupted ? 4 : 2,
                    dashArray: isDisrupted ? '6, 6' : undefined,
                    opacity: 0.8
                  }}
                  eventHandlers={{
                    click: () => setSelectedFlight(flight)
                  }}
                />

                {/* Downstream Cascade Route Highlight if present */}
                {flight.downstreamCoords && (
                  <Polyline
                    positions={flight.downstreamCoords}
                    pathOptions={{
                      color: '#6366f1',
                      weight: 3,
                      dashArray: '4, 4',
                      opacity: 0.8
                    }}
                  />
                )}

                {/* Live Aircraft Marker */}
                <Marker
                  position={[currentLat, currentLng]}
                  icon={createAircraftIcon(flight, flight.statusType)}
                  eventHandlers={{
                    click: () => setSelectedFlight(flight)
                  }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Disruption Cascade Warning Badge on Map */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-red-500/40 shadow-lg flex items-center gap-2 font-label-code text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="font-bold text-red-400">NETWORK IMPACT DETECTED</span>
          <span className="text-[10px] text-slate-300">Cascade: MDU → MAA → DEL</span>
        </div>

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-10 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl border border-surface-container-highest shadow-md font-label-code text-[11px] flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Time</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> At Risk</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Delayed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Grounded</span>
        </div>

      </div>

      {/* FLIGHT CLICK SIDE PANEL (MODAL / OVERLAY) */}
      {selectedFlight && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-secondary-container/80 shadow-xl space-y-4 font-label-code">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold font-data-display">
                ✈
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface font-headline-md">{selectedFlight.flightNumber} ({selectedFlight.route})</h3>
                <p className="text-xs text-on-surface-variant">Airline Monitored: {selectedAirline}</p>
              </div>
            </div>
            <button onClick={() => setSelectedFlight(null)} className="p-1 rounded-lg hover:bg-surface-container">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Status</span>
              <div className={`font-bold mt-1 ${selectedFlight.statusType === 'critical' ? 'text-error' : 'text-emerald-700'}`}>
                {selectedFlight.status} (+{selectedFlight.delayMinutes}m)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Aircraft</span>
              <div className="font-bold text-on-surface mt-1">{selectedFlight.tailNumber} ({selectedFlight.aircraftType})</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Gate & Crew</span>
              <div className="font-bold text-on-surface mt-1">{selectedFlight.gate}</div>
              <div className="text-[10px] text-on-surface-variant">{selectedFlight.crew.captain}</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Pax & Connections</span>
              <div className="font-bold text-on-surface mt-1">{selectedFlight.paxOnBoard} Passengers</div>
              <div className="text-[10px] text-error font-bold">{selectedFlight.connectingPax} Misconnect Risk</div>
            </div>
          </div>

          {selectedFlight.downstreamFlight && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-xs text-error font-semibold flex items-center justify-between">
              <span>⚠️ Downstream Cascade Impact: {selectedFlight.downstreamFlight} at risk</span>
              <span className="px-2 py-0.5 rounded bg-error text-white font-bold text-[10px]">CASCADE ACTIVE</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={() => navigate(`/flights?id=${selectedFlight.id}`)}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-bold text-xs"
            >
              View Flight
            </button>

            <button 
              onClick={() => navigate('/disruptions')}
              className="px-4 py-2 rounded-xl bg-error text-on-error font-bold text-xs shadow-sm"
            >
              View Disruption Cascade
            </button>

            <button 
              onClick={() => navigate('/recovery-sandbox')}
              className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs shadow-sm"
            >
              Simulate Recovery
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
