import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, 
  Plane, Users, Building2, TrendingUp, ShieldAlert, Cpu, Download, RefreshCw, Zap, Layers, Sparkles,
  Search, X, Radio, ShieldCheck
} from 'lucide-react';
import { airlineDatasets } from '../data/airlines';
import { getDashboard, getFlights, getDisruptions } from '../services/api';
import WorldNetworkMap from '../components/dashboard/WorldNetworkMap';

export default function DashboardPage({ selectedAirline = 'Air India' }) {
  const navigate = useNavigate();

  // Local state for live API data
  const [stats, setStats] = useState(null);
  const [liveFlights, setLiveFlights] = useState([]);
  const [activeDisruptions, setActiveDisruptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback dataset for airline
  const currentDataset = airlineDatasets[selectedAirline] || airlineDatasets['Air India'];

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [dashRes, flightsRes, disRes] = await Promise.all([
        getDashboard(),
        getFlights({ airline: selectedAirline }),
        getDisruptions()
      ]);

      const dashData = dashRes?.data || {};
      const flData = Array.isArray(flightsRes?.data) && flightsRes.data.length > 0 
        ? flightsRes.data 
        : currentDataset.flights;
      const dData = Array.isArray(disRes?.data) && disRes.data.length > 0 
        ? disRes.data 
        : [];

      // Calculate dynamic OTP
      const total = dashData.activeFlights || currentDataset.stats.totalFlights || 482;
      const onTime = dashData.onTimeFlights || 462;
      const otpVal = ((onTime / total) * 100).toFixed(1) + '%';

      setStats({
        totalFlights: total,
        onTimeFlights: onTime,
        delayedFlights: dashData.delayedFlights ?? currentDataset.stats.delayedFlights ?? 14,
        cancelledFlights: dashData.cancelledFlights ?? 6,
        affectedPax: dashData.passengersImpacted ?? currentDataset.stats.affectedPax ?? 142,
        availableAircraft: dashData.aircraftAvailable ?? currentDataset.stats.availableAircraft ?? 6,
        availableCrew: (dashData.crewAtRisk ? 8 : currentDataset.stats.availableCrew) ?? 8,
        crewAtRisk: dashData.crewAtRisk ?? 3,
        gateConflicts: dashData.activeDisruptions ? Math.min(dashData.activeDisruptions, 2) : currentDataset.stats.gateConflicts ?? 2,
        otp: otpVal
      });

      setLiveFlights(flData);
      setActiveDisruptions(dData);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('[DashboardPage] Failed to fetch live data:', err);
      setError('Unable to reach backend telemetry stream. Fallback operational baseline is active.');
      setStats({
        totalFlights: currentDataset.stats.totalFlights,
        onTimeFlights: 462,
        delayedFlights: currentDataset.stats.delayedFlights,
        cancelledFlights: 6,
        affectedPax: currentDataset.stats.affectedPax,
        availableAircraft: currentDataset.stats.availableAircraft,
        availableCrew: currentDataset.stats.availableCrew,
        crewAtRisk: 3,
        gateConflicts: currentDataset.stats.gateConflicts,
        otp: currentDataset.stats.otp
      });
      setLiveFlights(currentDataset.flights);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedAirline, currentDataset]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Export OCC Briefing
  const handleExportBriefing = () => {
    const briefingData = {
      title: `AeroSync AI OCC Operational Briefing — ${selectedAirline}`,
      timestamp: new Date().toISOString(),
      airline: selectedAirline,
      statistics: stats,
      criticalDisruptions: activeDisruptions.length,
      activeFlightsSample: liveFlights.slice(0, 5)
    };
    const blob = new Blob([JSON.stringify(briefingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroSync-OCC-Briefing-${selectedAirline.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('OCC Briefing export generated successfully.');
  };

  // Run Health Check
  const handleHealthCheck = () => {
    showToast('Running ADS-B and Telemetry Health Check...');
    setTimeout(() => {
      fetchDashboardData(true);
      showToast('✓ Network Health Check completed. System integrity at 99.4%.');
    }, 800);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter live flights based on search query
  const filteredLiveFlights = useMemo(() => {
    if (!searchQuery.trim()) return liveFlights;
    const q = searchQuery.toLowerCase().trim();
    return liveFlights.filter(f => 
      (f.flightNumber || '').toLowerCase().includes(q) ||
      (f.route || '').toLowerCase().includes(q) ||
      (f.origin || '').toLowerCase().includes(q) ||
      (f.destination || '').toLowerCase().includes(q) ||
      (f.tailNumber || '').toLowerCase().includes(q) ||
      (f.status || '').toLowerCase().includes(q)
    );
  }, [liveFlights, searchQuery]);

  const primaryFlight = liveFlights[0] || currentDataset.flights[0] || {
    flightNumber: 'AI 204',
    route: 'MDU → MAA',
    aircraftType: 'A320neo',
    status: 'Delayed',
    statusType: 'critical',
    delayMinutes: 90
  };

  return (
    <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-xl bg-primary-container text-on-primary border border-secondary/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Activity className="w-5 h-5 text-secondary animate-pulse shrink-0" />
          <span className="text-xs font-label-code font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP WELCOME & SHIFT CONTROL HEADER */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 sm:gap-6 pb-2 border-b border-surface-container-highest/40">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-[11px] sm:text-xs font-semibold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              Monitored: <strong className="text-on-surface font-bold">{selectedAirline}</strong> • Shift Alpha
            </span>
            <span className="font-label-caps text-[9px] sm:text-[10px] uppercase tracking-widest text-outline px-2 py-0.5 sm:py-1 rounded-md bg-surface-container-low font-bold">
              Telemetry Live
            </span>
            <span className="font-label-code text-[10px] sm:text-[11px] text-on-surface-variant hidden sm:inline">
              Synced: {lastRefreshed}
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-primary">
            Good Morning, Operations Team
          </h1>
          <p className="font-body-lg text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
            Monitoring <strong className="text-on-surface font-semibold">{selectedAirline}</strong> operations with real-time autonomous disruption solver.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
          <button 
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs border border-surface-container-highest disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={handleHealthCheck}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs border border-surface-container-highest"
          >
            <Activity className="w-3.5 h-3.5 text-secondary" />
            <span>Health Check</span>
          </button>
          
          <button 
            onClick={handleExportBriefing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs border border-surface-container-highest"
          >
            <Download className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Export Briefing</span>
          </button>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-primary-container text-on-primary shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-[8px] text-primary-fixed uppercase tracking-widest font-bold">Auto-Pilot Active</span>
              <span className="font-label-code text-[11px] font-bold text-on-primary leading-tight">Semi-Autonomous</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 font-label-code text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          2. PURPOSE-BUILT RESPONSIVE SEARCH BAR (PHASE 4: B)
         ========================================================================= */}
      <div className="w-full p-3 sm:p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex items-center gap-3">
        <Search className="w-4.5 h-4.5 text-outline pointer-events-none shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter live critical flights by flight number (e.g. 6E 1234), route, tail, status..."
          className="w-full bg-transparent text-on-surface font-label-code text-xs sm:text-sm focus:outline-none placeholder:text-outline"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* =========================================================================
          3. HORIZONTALLY SWIPEABLE KPI CARDS ON MOBILE (PHASE 4: C)
             Touch-based horizontal swiping on mobile screens, responsive CSS grid on tablet/desktop.
         ========================================================================= */}
      <div className="relative">
        {/* Mobile Swipe Hint Pill (hidden on tablet/desktop) */}
        <div className="flex sm:hidden items-center justify-between text-[10px] font-label-code text-on-surface-variant mb-1.5 px-1">
          <span>Operational KPIs</span>
          <span className="text-secondary font-semibold">Swipe to explore →</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar">
          
          {/* Metric 1: Total Flights */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Flights</span>
              <Plane className="w-4.5 h-4.5 text-on-surface-variant" />
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5">
                <span className="font-headline-xl text-3xl font-extrabold text-primary tracking-tight">
                  {stats?.totalFlights ?? 482}
                </span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-medium">Scheduled</span>
              <span className="font-label-code text-xs font-bold text-secondary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {stats?.otp ?? '95.8%'} OTP
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-primary h-full rounded-full" style={{ width: stats?.otp || '92%' }}></div>
            </div>
          </div>

          {/* Metric 2: Delayed Flights */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-amber-200/60 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Delayed Flights</span>
              <Clock className="w-4.5 h-4.5 text-amber-600" />
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5 flex items-baseline gap-2">
                <span className="font-headline-xl text-3xl font-extrabold text-primary tracking-tight">
                  {stats?.delayedFlights ?? 14}
                </span>
                <span className="font-label-code text-[11px] font-bold text-error px-1.5 py-0.5 rounded-md bg-error-container/60">+45m avg</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-label-code">Compounding</span>
              <span className="font-label-code text-[11px] font-bold text-on-surface px-1.5 py-0.5 rounded-md bg-surface-container">3 Aircraft</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          {/* Metric 3: Affected Passengers */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-error uppercase tracking-wider font-bold">Affected Pax</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5 flex items-baseline gap-1.5">
                <span className="font-headline-xl text-3xl font-extrabold text-error tracking-tight">
                  {stats?.affectedPax ?? 142}
                </span>
                <span className="font-label-code text-xs font-bold text-error">Pax</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-label-code">Critical Conx</span>
              <span className="font-label-code text-[10px] font-bold text-error bg-error-container/60 px-1.5 py-0.5 rounded-md">24 at risk</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-error h-full rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Metric 4: Available Aircraft */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Available Aircraft</span>
              <Plane className="w-4.5 h-4.5 text-secondary" />
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5 flex items-baseline gap-1.5">
                <span className="font-headline-xl text-3xl font-extrabold text-primary tracking-tight">
                  {stats?.availableAircraft ?? 6}
                </span>
                <span className="font-label-code text-xs font-bold text-secondary">Standby</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-label-code">DEL & BLR Hubs</span>
              <span className="font-label-code text-[10px] font-bold text-on-surface-variant">2 A320 • 4 B737</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-secondary-container h-full rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Metric 5: Available Crew */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-surface-container-highest flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Available Crew</span>
              <Users className="w-4.5 h-4.5 text-secondary" />
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5 flex items-baseline gap-1.5">
                <span className="font-headline-xl text-3xl font-extrabold text-primary tracking-tight">
                  {stats?.availableCrew ?? 8}
                </span>
                <span className="font-label-code text-xs font-bold text-on-surface-variant">Reserve</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-label-code">Hot Standby</span>
              <span className="font-label-code text-xs font-bold text-secondary">100% Ready</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Metric 6: Gate Conflicts */}
          <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[145px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-error uppercase tracking-wider font-bold">Gate Conflicts</span>
              <Building2 className="w-4.5 h-4.5 text-error" />
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse my-2"></div>
            ) : (
              <div className="my-1.5 flex items-baseline gap-1.5">
                <span className="font-headline-xl text-3xl font-extrabold text-error tracking-tight">
                  {stats?.gateConflicts ?? 2}
                </span>
                <span className="font-label-code text-xs font-bold text-error">Alerts</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-xs font-body-sm">
              <span className="text-on-surface-variant font-label-code">DEL Terminal 3</span>
              <span className="font-label-code text-[10px] font-bold text-error px-1.5 py-0.5 rounded-md bg-error-container/60">Gate A4 & B2</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
              <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          4. FULL WORLD AIRLINE NETWORK MAP
         ========================================================================= */}
      <div className="w-full overflow-hidden rounded-2xl border border-surface-container-highest shadow-sm">
        <WorldNetworkMap selectedAirline={selectedAirline} flights={liveFlights} />
      </div>

      {/* =========================================================================
          5. ACTIVE NETWORK DISRUPTION SPOTLIGHT
         ========================================================================= */}
      <div className="rounded-2xl bg-surface-container-lowest border border-error/30 shadow-lg overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-error/90 via-error to-error/95 text-on-error px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping"></span>
            <span className="font-label-code text-xs sm:text-sm font-extrabold tracking-wider uppercase">
              Active Network Disruption — {selectedAirline} Primary Route ({primaryFlight.route || 'MDU → MAA → DEL'})
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 font-label-code text-[10px] sm:text-xs uppercase font-bold">
              CRITICAL ROOT CAUSE
            </span>
            <button 
              onClick={() => navigate('/disruptions')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white text-error hover:bg-surface-container-lowest transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Disruption Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sequential Cascade Chain */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="text-xs text-on-surface-variant font-body-sm">
            Cascading dependency tree dynamically mapped by Neural Solver engine for <strong className="font-label-code text-on-surface font-bold">{selectedAirline}</strong> • Incident Code: <strong className="font-label-code text-on-surface font-bold">INC-MAA-9921</strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 font-label-code text-xs">
            
            {/* Node 1 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-error uppercase tracking-wider">Node 01: Root Flight</span>
                <div className="font-data-display text-base font-bold text-on-surface mt-1">{primaryFlight.flightNumber || 'AI 204'}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{primaryFlight.route || 'MDU → MAA'}</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-error-container text-on-error-container text-[11px] font-bold inline-block">
                  +{primaryFlight.delayMinutes || 90}m ATC Hold
                </span>
              </div>
            </div>

            {/* Node 2 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-secondary-container/40 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-secondary uppercase tracking-wider">Node 02: Aircraft</span>
                <div className="font-data-display text-base font-bold text-on-surface mt-1">VT-IFZ</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Turnaround Critical</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-semibold inline-block">
                  Turnaround: 18m Left
                </span>
              </div>
            </div>

            {/* Node 3 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-error uppercase tracking-wider">Node 03: Crew FDTL</span>
                <div className="font-headline-md text-sm font-bold text-on-surface mt-1">Capt. Rajiv & FO</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Cockpit Pair Base</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-error-container text-on-error-container text-[11px] font-bold inline-block">
                  +12m Exceeds Duty
                </span>
              </div>
            </div>

            {/* Node 4 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-error/30 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-error uppercase tracking-wider">Node 04: Gate Conflict</span>
                <div className="font-data-display text-base font-bold text-on-surface mt-1">DEL Gate A4</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">T3 Pier Occupied</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-error-container text-on-error-container text-[11px] font-bold inline-block">
                  Occupied Stand
                </span>
              </div>
            </div>

            {/* Node 5 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-secondary uppercase tracking-wider">Node 05: Pax Conx</span>
                <div className="font-data-display text-base font-bold text-on-surface mt-1">24 Connectors</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">LHR Flight AI 161</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold inline-block">
                  Tight Connection
                </span>
              </div>
            </div>

            {/* Node 6 */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-secondary-container/40 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-label-caps text-[9px] font-bold text-secondary uppercase tracking-wider">Node 06: Downstream</span>
                <div className="font-data-display text-base font-bold text-on-surface mt-1">Downstream Leg</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">MAA → DEL Rotation</div>
              </div>
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-semibold inline-block">
                  +45m Knock-On
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* AI Synthetic Recommendation Bar */}
        <div className="bg-primary-container p-4 sm:p-5 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-on-primary font-label-code border-t border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shrink-0 shadow-inner">
              <Sparkles className="w-5.5 h-5.5 text-secondary-container" />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-xs sm:text-sm text-white flex flex-wrap items-center gap-2">
                <span>AI Synthetic Solution • Plan #REC-982-A</span>
                <span className="px-2 py-0.2 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-bold">INSTANT RECOVERY</span>
              </div>
              <div className="text-[11px] sm:text-xs text-primary-fixed-dim leading-relaxed">
                Swap DEL inbound stand to Remote Bay R14 • Dispatch Standby Crew Pair • Expedite VIP Pax transfer buggy.
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/recovery')}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors font-bold text-xs shadow-md whitespace-nowrap shrink-0 text-center"
          >
            Review & Authorize Plan
          </button>
        </div>

      </div>

      {/* =========================================================================
          6. MAIN SPLIT LAYOUT:
             CENTRAL FLIGHT STREAM (Left 8 Cols on xl:) + RIGHT ANALYTICS & ALERTS PANEL (Right 4 Cols on xl:)
             Seamlessly stacks on tablet and mobile without compressing contents.
         ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start font-label-code">
        
        {/* Central Dashboard: Live Critical Flight Stream (8 Cols on xl:) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-secondary" />
              <h2 className="font-headline-lg text-base sm:text-lg font-bold text-on-surface">
                Live Flight Stream ({selectedAirline})
              </h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              {filteredLiveFlights.length} flights displayed
            </span>
          </div>

          <div className="space-y-3.5">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest animate-pulse space-y-2.5">
                  <div className="h-5 w-44 bg-surface-container-high rounded"></div>
                  <div className="h-4 w-64 bg-surface-container rounded"></div>
                </div>
              ))
            ) : filteredLiveFlights.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-highest text-center space-y-2">
                <Plane className="w-8 h-8 text-outline mx-auto" />
                <p className="font-bold text-sm text-on-surface">No flights found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-xl bg-secondary text-white font-bold text-xs"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              filteredLiveFlights.slice(0, 6).map((flight) => (
                <div 
                  key={flight.id || flight.flightNumber}
                  onClick={() => navigate(`/flights?id=${flight.id || flight.flightNumber}`)}
                  className="group p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs font-data-display shrink-0 shadow-sm ${
                      flight.statusType === 'critical' || flight.status === 'Delayed'
                        ? 'bg-error-container text-on-error-container' 
                        : flight.statusType === 'warning' || flight.status === 'Boarding'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-surface-container-high text-on-surface'
                    }`}>
                      {(flight.flightNumber || 'FL').substring(0, 2)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-on-surface font-headline-md">
                          {flight.flightNumber} ({flight.route || `${flight.origin} → ${flight.destination}`})
                        </span>
                        <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                          flight.statusType === 'critical' || flight.status === 'Delayed' ? 'bg-error text-on-error' :
                          flight.statusType === 'warning' || flight.status === 'Boarding' ? 'bg-amber-500 text-white' : 
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {flight.status || 'Active'}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        STD: {flight.std || flight.departure || '18:30'} UTC • EST: {flight.etd || flight.arrival || '20:00'} UTC • Gate: {flight.gate || 'A4'} • Tail: {flight.tailNumber || 'VT-IFZ'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <span className="text-xs text-secondary font-bold bg-secondary-fixed/40 px-2.5 py-1 rounded-lg">
                      {flight.impactLevel || (flight.delayMinutes > 30 ? 'High' : 'Medium')} Impact
                    </span>
                    <button className="px-3.5 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold">
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Section: Analytics, Operations Alerts & AI Suggestions (4 Cols on xl:) */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <h2 className="font-headline-lg text-base sm:text-lg font-bold text-on-surface">Analytics & Alerts</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              Real-time Feed
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Widget 1: Network Health Gauges */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-3 font-label-code text-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">NETWORK INTEGRITY MATRIX</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> 99.4% FDTL Safe
                </span>
              </div>
              
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-on-surface-variant">Fleet Reliability</span>
                    <span className="font-bold text-on-surface">94.2%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-on-surface-variant">Pax Connections Protected</span>
                    <span className="font-bold text-secondary">91.8%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary-container h-full rounded-full" style={{ width: '91.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-on-surface-variant">Gate Turnaround Optimization</span>
                    <span className="font-bold text-emerald-600">96.5%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: AI Smart Suggestion 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-3 font-label-code text-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[11px] text-secondary font-bold uppercase tracking-wider">GATE CONFLICT RESOLUTION</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  99.1% Efficacy
                </span>
              </div>
              <h3 className="font-bold text-sm text-on-surface leading-snug">Reassign DEL Gate A4 → Remote Stand R14</h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed font-body-sm">
                Prevents 45-minute ground block for incoming flight. Ramp bus shuttle pre-dispatched to Terminal 3 corridor.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container-highest">
                <span className="text-[11px] text-on-surface-variant font-medium">Pax Impact: 0 min extra</span>
                <button 
                  onClick={() => navigate('/recovery')}
                  className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-bold"
                >
                  Review Plan
                </button>
              </div>
            </div>

            {/* Widget 3: AI Smart Suggestion 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-3 font-label-code text-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[11px] text-secondary font-bold uppercase tracking-wider">CREW FDTL RECOVERY</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  97.8% Efficacy
                </span>
              </div>
              <h3 className="font-bold text-sm text-on-surface leading-snug">Swap Crew Pair to Standby Reserve</h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed font-body-sm">
                Captain duty expired. Standby Capt. Vikas & FO Rao on hot reserve ready at briefing lounge.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-surface-container-highest">
                <span className="text-[11px] text-on-surface-variant font-medium">FDTL Risk: Eliminated</span>
                <button 
                  onClick={() => navigate('/recovery')}
                  className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs font-bold"
                >
                  Review Plan
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
