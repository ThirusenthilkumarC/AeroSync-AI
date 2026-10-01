import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, 
  Plane, Users, Building2, TrendingUp, ShieldAlert, Cpu, Download, RefreshCw, Zap, Layers, Sparkles
} from 'lucide-react';
import { airlineDatasets, airlinesList } from '../data/airlines';
import WorldNetworkMap from '../components/dashboard/WorldNetworkMap';

export default function DashboardPage({ selectedAirline }) {
  const navigate = useNavigate();
  const currentDataset = airlineDatasets[selectedAirline] || airlineDatasets['Air India'];
  const networkStats = currentDataset.stats;
  const activeFlights = currentDataset.flights;

  return (
    <div className="w-full max-w-[1750px] mx-auto px-6 lg:px-12 py-8 lg:py-10 space-y-8 lg:space-y-10">
      
      {/* 1. TOP WELCOME & SHIFT CONTROL HEADER */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-2 border-b border-surface-container-highest/40">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-xs font-semibold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              Monitored Airline: <strong className="text-on-surface font-bold">{selectedAirline}</strong> • Shift Alpha
            </span>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-outline px-2.5 py-1 rounded-md bg-surface-container-low font-bold">
              Real-time Ingestion Live
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl lg:text-4xl font-extrabold tracking-tight text-primary">
            Good Morning, Operations Team
          </h1>
          <p className="font-body-lg text-sm md:text-base text-on-surface-variant leading-relaxed">
            Monitoring <strong className="text-on-surface font-semibold">{selectedAirline}</strong> operations with real-time autonomous disruption solver.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto shrink-0">
          <button 
            onClick={() => navigate('/disruptions')}
            className="flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs md:text-sm border border-surface-container-highest"
          >
            <Activity className="w-4.5 h-4.5 text-secondary" />
            <span>Run Network Health Check</span>
          </button>
          
          <button 
            onClick={() => navigate('/recovery')}
            className="flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs md:text-sm border border-surface-container-highest"
          >
            <Download className="w-4.5 h-4.5 text-on-surface-variant" />
            <span>Export OCC Briefing</span>
          </button>

          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary shadow-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-container"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-[9px] text-primary-fixed uppercase tracking-widest font-bold">Auto-Pilot Active</span>
              <span className="font-label-code text-xs font-bold text-on-primary leading-tight">Semi-Autonomous Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SUMMARY KPI CARDS (Generous Internal Padding & Spacing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 lg:gap-6">
        
        {/* Metric 1: Total Flights */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Flights</span>
            <Plane className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="my-2">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{networkStats.totalFlights}</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-medium">Scheduled</span>
            <span className="font-label-code text-xs font-bold text-secondary flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {networkStats.otp} OTP
            </span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* Metric 2: Delayed Flights */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-amber-200/60 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Delayed Flights</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="my-2 flex items-baseline gap-2.5">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{networkStats.delayedFlights}</span>
            <span className="font-label-code text-xs font-bold text-error px-2 py-0.5 rounded-md bg-error-container/60">+45m avg</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-label-code">Compounding</span>
            <span className="font-label-code text-xs font-bold text-on-surface px-2 py-0.5 rounded-md bg-surface-container">3 Aircraft</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* Metric 3: Affected Passengers */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-error uppercase tracking-wider font-bold">Affected Pax</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-error tracking-tight">{networkStats.affectedPax}</span>
            <span className="font-label-code text-xs font-bold text-error">Pax</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-label-code">Critical Conx</span>
            <span className="font-label-code text-xs font-bold text-error bg-error-container/60 px-2 py-0.5 rounded-md">24 at risk</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-error h-full rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Metric 4: Available Aircraft */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Available Aircraft</span>
            <Plane className="w-5 h-5 text-secondary" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{networkStats.availableAircraft}</span>
            <span className="font-label-code text-xs font-bold text-secondary">Standby</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-label-code">DEL & BLR Hubs</span>
            <span className="font-label-code text-xs font-bold text-on-surface-variant">2 A320 • 4 B737</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-secondary-container h-full rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* Metric 5: Available Crew */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Available Crew</span>
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{networkStats.availableCrew}</span>
            <span className="font-label-code text-xs font-bold text-on-surface-variant">Reserve</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-label-code">Hot Standby</span>
            <span className="font-label-code text-xs font-bold text-secondary">100% Ready</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Metric 6: Gate Conflicts */}
        <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-5 lg:p-6 shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[150px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-xs text-error uppercase tracking-wider font-bold">Gate Conflicts</span>
            <Building2 className="w-5 h-5 text-error" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-3xl lg:text-4xl font-extrabold text-error tracking-tight">{networkStats.gateConflicts}</span>
            <span className="font-label-code text-xs font-bold text-error">Alerts</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
            <span className="text-on-surface-variant font-label-code">DEL Terminal 3</span>
            <span className="font-label-code text-xs font-bold text-error px-2 py-0.5 rounded-md bg-error-container/60">Gate A4 & B2</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

      </div>

      {/* 3. FULL WORLD AIRLINE NETWORK MAP */}
      <WorldNetworkMap selectedAirline={selectedAirline} />

      {/* 4. ACTIVE NETWORK DISRUPTION SPOTLIGHT */}
      <div className="rounded-2xl bg-surface-container-lowest border border-error/30 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-error/90 via-error to-error/95 text-on-error px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-white animate-ping"></span>
            <span className="font-label-code text-sm lg:text-base font-extrabold tracking-wider uppercase">
              Active Network Disruption — {selectedAirline} Primary Route (MDU → MAA → DEL)
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="px-3 py-1 rounded-md bg-white/20 font-label-code text-xs uppercase font-bold">
              CRITICAL ROOT CAUSE
            </span>
            <button 
              onClick={() => navigate('/disruptions')}
              className="px-4.5 py-2 rounded-xl bg-white text-error hover:bg-surface-container-lowest transition-colors text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <span>Open AI Disruption Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sequential Cascade Chain */}
        <div className="p-6 lg:p-8 space-y-5">
          <div className="text-xs md:text-sm text-on-surface-variant font-body-sm">
            Cascading dependency tree dynamically mapped by Neural Solver engine for <strong className="font-label-code text-on-surface font-bold">{selectedAirline}</strong> • Incident Code: <strong className="font-label-code text-on-surface font-bold">INC-MAA-9921</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 font-label-code text-xs">
            
            {/* Node 1 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-error uppercase tracking-wider">Node 01: Root Flight</span>
                <div className="font-data-display text-lg font-bold text-on-surface mt-1.5">{activeFlights[0]?.flightNumber || 'AI 204'}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">MDU → MAA ({activeFlights[0]?.aircraftType || 'A320neo'})</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container text-xs font-bold inline-block">
                  +90m ATC Hold
                </span>
              </div>
            </div>

            {/* Node 2 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-secondary-container/40 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-wider">Node 02: Aircraft</span>
                <div className="font-data-display text-lg font-bold text-on-surface mt-1.5">VT-IFZ</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Turnaround Critical</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-semibold inline-block">
                  Turnaround: 18m Left
                </span>
              </div>
            </div>

            {/* Node 3 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-error uppercase tracking-wider">Node 03: Crew FDTL</span>
                <div className="font-headline-md text-base font-bold text-on-surface mt-1.5">Capt. Rajiv & FO</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Cockpit Pair Base</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container text-xs font-bold inline-block">
                  +12m Exceeds Duty
                </span>
              </div>
            </div>

            {/* Node 4 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-error uppercase tracking-wider">Node 04: Gate Conflict</span>
                <div className="font-data-display text-lg font-bold text-on-surface mt-1.5">DEL Gate A4</div>
                <div className="text-xs text-on-surface-variant mt-0.5">T3 International Pier</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container text-xs font-bold inline-block">
                  Occupied Stand
                </span>
              </div>
            </div>

            {/* Node 5 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-wider">Node 05: Pax Conx</span>
                <div className="font-data-display text-lg font-bold text-on-surface mt-1.5">24 Connectors</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Connecting Flights</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed text-xs font-bold inline-block">
                  LHR Connection Risk
                </span>
              </div>
            </div>

            {/* Node 6 */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-secondary-container/40 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-wider">Node 06: Downstream</span>
                <div className="font-data-display text-lg font-bold text-on-surface mt-1.5">Downstream Leg</div>
                <div className="text-xs text-on-surface-variant mt-0.5">MAA → DEL Rotation</div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-highest">
                <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-semibold inline-block">
                  +45m Knock-On
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* AI Synthetic Recommendation Bar */}
        <div className="bg-primary-container p-5 lg:p-6 px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-on-primary font-label-code border-t border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shrink-0 shadow-inner">
              <Sparkles className="w-6.5 h-6.5 text-secondary-container" />
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-sm md:text-base text-white flex flex-wrap items-center gap-2.5">
                <span>AI Synthetic Solution Generated • Plan #REC-982-A</span>
                <span className="px-2.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-xs font-bold">INSTANT RECOVERY</span>
              </div>
              <div className="text-xs md:text-sm text-primary-fixed-dim leading-relaxed">
                Swap DEL inbound stand to Remote Bay R14 • Dispatch Standby Crew Pair • Expedite VIP Pax transfer buggy.
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/recovery')}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors font-bold text-xs md:text-sm shadow-md whitespace-nowrap shrink-0"
          >
            Review & Authorize Plan
          </button>
        </div>

      </div>

      {/* 5. MAIN SPLIT LAYOUT: LIVE FLIGHT STREAM (LEFT) + AI SMART SUGGESTIONS FEED (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start font-label-code">
        
        {/* Left Column: Live Critical Flight Stream (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-3">
              <Activity className="w-5.5 h-5.5 text-secondary" />
              <h2 className="font-headline-lg text-xl font-bold text-on-surface">Live Critical Flights ({selectedAirline})</h2>
            </div>
            <span className="text-xs md:text-sm text-on-surface-variant font-medium">Real-time vector progression</span>
          </div>

          <div className="space-y-4">
            {activeFlights.map((flight) => (
              <div 
                key={flight.id}
                onClick={() => navigate(`/flights?id=${flight.id}`)}
                className="group p-5 lg:p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4.5">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-sm font-data-display shrink-0 shadow-sm ${
                    flight.statusType === 'critical' 
                      ? 'bg-error-container text-on-error-container' 
                      : flight.statusType === 'warning'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-surface-container-high text-on-surface'
                  }`}>
                    {flight.flightNumber.substring(0, 2)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base md:text-lg text-on-surface font-headline-md">{flight.flightNumber} ({flight.route})</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        flight.statusType === 'critical' ? 'bg-error text-on-error' :
                        flight.statusType === 'warning' ? 'bg-amber-500 text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {flight.status}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-on-surface-variant">
                      STD: {flight.std} UTC • EST: {flight.etd} UTC • Gate: {flight.gate} • Tail: {flight.tailNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3.5">
                  <span className="text-xs md:text-sm text-secondary font-bold bg-secondary-fixed/40 px-3 py-1.5 rounded-xl">
                    {flight.impactLevel} Impact
                  </span>
                  <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Smart Suggestions (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5.5 h-5.5 text-secondary" />
              <h2 className="font-headline-lg text-xl font-bold text-on-surface">AI Smart Suggestions</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
              Instant Feed
            </span>
          </div>

          <div className="space-y-5">
            
            {/* Card 1 */}
            <div className="p-5 lg:p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider">GATE CONFLICT RESOLUTION</span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  99.1% Efficacy
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface leading-snug">Reassign DEL Gate A4 → Remote Stand R14</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-body-sm">
                Prevents 45-minute ground block for incoming flight. Ramp bus shuttle pre-dispatched to Terminal 3 corridor.
              </p>
              <div className="pt-3 flex items-center justify-between border-t border-surface-container-highest">
                <span className="text-xs text-on-surface-variant font-medium">Pax Impact: 0 min extra</span>
                <button 
                  onClick={() => navigate('/recovery')}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-bold"
                >
                  Review
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 lg:p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider">CREW FDTL RECOVERY</span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  97.8% Efficacy
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface leading-snug">Swap Crew Pair to Standby Reserve</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-body-sm">
                Captain duty expired. Standby Capt. Vikas & FO Rao on hot reserve ready at briefing lounge.
              </p>
              <div className="pt-3 flex items-center justify-between border-t border-surface-container-highest">
                <span className="text-xs text-on-surface-variant font-medium">FDTL Risk: Eliminated</span>
                <button 
                  onClick={() => navigate('/recovery')}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-bold"
                >
                  Review
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
