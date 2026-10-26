import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Activity, Radio, AlertTriangle, ArrowRight } from 'lucide-react';
import WorldNetworkMap from '../components/dashboard/WorldNetworkMap';

export default function LiveMapPage({ selectedAirline = 'Air India' }) {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-label-code text-xs">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ADS-B RADAR FEED
            </span>
            <span className="text-on-surface-variant hidden md:inline">
              Operations Control Center Network Visualizer
            </span>
          </div>

          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
            Live Flight Tracking & Route Network
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl mt-1">
            Real-time geospatial visualization of domestic and international route corridors, active aircraft bearings, and hub-level disruption vectors.
          </p>
        </div>

        {/* Quick OCC Links */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/disruptions')}
            className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disruptions</span>
          </button>
          <button
            onClick={() => navigate('/flights')}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Flights Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Live Map Console */}
      <div className="w-full">
        <WorldNetworkMap selectedAirline={selectedAirline} />
      </div>

    </div>
  );
}
