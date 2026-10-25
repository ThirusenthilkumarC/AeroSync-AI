import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, AlertTriangle, ShieldCheck, Bus, Hotel, Search, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { passengersData, passengerImpactSummary } from '../data/passengers';
import { getPassengers } from '../services/api';

export default function PassengerImpactPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [passengersList, setPassengersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const loadPassengers = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getPassengers();
      setPassengersList(Array.isArray(res?.data) && res.data.length > 0 ? res.data : passengersData);
    } catch (err) {
      console.warn('[PassengerImpact] Fallback to local passengers:', err);
      setPassengersList(passengersData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProtectPassenger = (pnr, name) => {
    setPassengersList(prev => prev.map(p => {
      if (p.pnr === pnr) {
        return {
          ...p,
          risk: 'Protected (Safe)',
          rebookingAction: '✓ Priority Buggy Confirmed & Baggage Fast-Tracked'
        };
      }
      return p;
    }));
    showToast(`Protected connection for ${name} (${pnr}). Buggy dispatched.`);
  };

  const filteredPassengers = passengersList.filter(pax => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (pax.pnr || '').toLowerCase().includes(term) ||
      (pax.name || '').toLowerCase().includes(term) ||
      (pax.route || '').toLowerCase().includes(term) ||
      (pax.connectingFlight || '').toLowerCase().includes(term);

    const r = (pax.risk || '').toLowerCase();
    const matchesRisk = 
      riskFilter === 'ALL' ||
      (riskFilter === 'CRITICAL' && r.includes('critical')) ||
      (riskFilter === 'HIGH' && r.includes('high')) ||
      (riskFilter === 'PROTECTED' && r.includes('protected'));

    return matchesSearch && matchesRisk;
  });

  const totalPax = passengersList.reduce((sum, p) => sum + (p.passengerCount || 1), 0) || 47;
  const criticalPax = passengersList.filter(p => (p.risk || '').includes('Critical')).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-primary-container text-on-primary border border-secondary/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-label-code font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              PASSENGER CARE & CONNECTION PROTECTION
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
            Passenger Impact & Protection Matrix
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl mt-1">
            Automated misconnection prevention, airside priority buggy dispatch, and dynamic re-accommodation.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm font-label-code">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Protected Rate</span>
            <div className="font-data-display text-lg sm:text-xl font-bold text-secondary">
              {passengerImpactSummary.paxProtectedRate || '91.8%'}
            </div>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-caps text-[10px] text-error uppercase font-bold">At Risk Conx</span>
            <div className="font-data-display text-lg sm:text-xl font-bold text-error">
              {criticalPax || passengerImpactSummary.criticalConnectionsAtRisk} Pax
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-caps font-bold">
            <span>TOTAL IMPACTED PAX</span>
            <UserCheck className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-data-display text-2xl font-bold text-on-surface">{totalPax} Pax</div>
          <div className="text-[11px] text-on-surface-variant font-label-code">Across monitored sectors</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-caps font-bold">
            <span>BUGGY TRANSFERS DISPATCHED</span>
            <Bus className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-data-display text-2xl font-bold text-secondary">{passengerImpactSummary.buggyTransfersDispatched} Buggies</div>
          <div className="text-[11px] text-emerald-700 font-label-code font-bold">Pre-positioned at Gate B4</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-caps font-bold">
            <span>AUTO-REBOOKED CODESHARE</span>
            <ShieldCheck className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-data-display text-2xl font-bold text-on-surface">{passengerImpactSummary.autoRebooked} Pax</div>
          <div className="text-[11px] text-on-surface-variant font-label-code">Seamless PNR Sync</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-caps font-bold">
            <span>HOTEL VOUCHER EXPOSURE</span>
            <Hotel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-data-display text-2xl font-bold text-emerald-700">$0 Net Cost</div>
          <div className="text-[11px] text-on-surface-variant font-label-code">Recovered via Buggy protection</div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 font-label-code text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PNR (e.g. AS-89412), Passenger Name, Route, Connecting Leg..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="PROTECTED">Protected (Safe)</option>
          </select>

          <button
            onClick={() => loadPassengers(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-bold flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Passengers"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Passenger PNR Table with Responsive Horizontal Scroll */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-left text-xs font-body-sm min-w-[750px]">
            <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
              <tr>
                <th className="p-4">PNR Record</th>
                <th className="p-4">Passenger Name & Tier</th>
                <th className="p-4">Flight Itinerary</th>
                <th className="p-4">Connecting Leg</th>
                <th className="p-4">Connection Window</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Automated Protection Action</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-label-code">
              {isLoading ? (
                [1, 2, 3, 4].map(n => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-28 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-24 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-32 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-on-surface-variant">
                    No passengers match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((pax) => (
                  <tr key={pax.pnr} className="hover:bg-surface-container-low/60 transition-colors">
                    
                    <td className="p-4 font-bold text-sm text-secondary font-data-display">
                      {pax.pnr}
                    </td>

                    <td className="p-4 font-bold text-on-surface">
                      <div>{pax.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-normal">{pax.priority || 'Standard'} ({pax.passengerCount || 1} Pax)</div>
                    </td>

                    <td className="p-4 font-bold text-on-surface">
                      {pax.route}
                    </td>

                    <td className="p-4 font-bold text-on-surface">
                      {pax.connectingFlight}
                    </td>

                    <td className="p-4 font-bold text-on-surface-variant">
                      {pax.connectionWindow}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        (pax.risk || '').includes('Critical') ? 'bg-error text-on-error' :
                        (pax.risk || '').includes('High') ? 'bg-amber-500 text-white' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        • {pax.risk}
                      </span>
                    </td>

                    <td className="p-4 text-on-surface font-semibold">
                      {pax.rebookingAction}
                    </td>

                    <td className="p-4 text-right">
                      {!(pax.risk || '').includes('Protected') && (
                        <button
                          onClick={() => handleProtectPassenger(pax.pnr, pax.name)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-white font-bold text-[11px] hover:bg-secondary/90 transition-colors shadow-sm whitespace-nowrap"
                        >
                          Protect Conx
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
