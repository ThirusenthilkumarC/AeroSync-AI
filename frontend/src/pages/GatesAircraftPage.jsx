import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Building2, AlertTriangle, CheckCircle2, Search, RefreshCw, Download, ShieldCheck } from 'lucide-react';
import { aircraftData } from '../data/aircraft';
import { gatesData } from '../data/gates';
import { getAircraft, getGates } from '../services/api';

export default function GatesAircraftPage() {
  const [activeTab, setActiveTab] = useState('aircraft');
  const [searchTerm, setSearchTerm] = useState('');
  const [aircraftList, setAircraftList] = useState([]);
  const [gatesList, setGatesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [acRes, gRes] = await Promise.all([
        getAircraft(),
        getGates()
      ]);

      setAircraftList(Array.isArray(acRes?.data) && acRes.data.length > 0 ? acRes.data : aircraftData);
      setGatesList(Array.isArray(gRes?.data) && gRes.data.length > 0 ? gRes.data : gatesData);
    } catch (err) {
      console.warn('[GatesAircraft] Fallback to local data:', err);
      setAircraftList(aircraftData);
      setGatesList(gatesData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveConflict = (gateName) => {
    setGatesList(prev => prev.map(g => {
      if (g.gate === gateName) {
        return {
          ...g,
          status: 'Clear / Vacant',
          conflictDetails: 'Resolved by OCC Dispatcher • Stand allocated'
        };
      }
      return g;
    }));
    showToast(`Conflict at ${gateName} resolved. Auto-rerouted incoming aircraft.`);
  };

  const filteredAircraft = aircraftList.filter(ac => {
    const matchesSearch = 
      (ac.tailNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ac.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ac.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && (ac.status || '').includes('Standby')) ||
      (statusFilter === 'MAINTENANCE' && (ac.status || '').includes('Maintenance')) ||
      (statusFilter === 'DELAYED' && (ac.status || '').includes('Delayed'));

    return matchesSearch && matchesStatus;
  });

  const filteredGates = gatesList.filter(g => {
    const matchesSearch = 
      (g.gate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.terminal || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.status || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'CONFLICT' && (g.status || '').includes('Conflict')) ||
      (statusFilter === 'AVAILABLE' && (g.status || '').includes('Clear'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-primary-container text-on-primary border border-secondary/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-label-code font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              PHYSICAL ASSETS & AIRSIDE INFRASTRUCTURE
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
            Gates & Aircraft Telemetry
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl mt-1">
            Manage tail allocations, maintenance clearances, terminal jetbridges, and stand occupancy conflicts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
          <button
            onClick={() => { setActiveTab('aircraft'); setStatusFilter('ALL'); }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'aircraft' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Aircraft ({aircraftList.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('gates'); setStatusFilter('ALL'); }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'gates' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Gates ({gatesList.length})</span>
          </button>
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
            placeholder={activeTab === 'aircraft' ? "Search tail number (e.g. VT-EXA), type, hub..." : "Search gate (e.g. Gate A4), terminal, status..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'aircraft' ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
            >
              <option value="ALL">All Aircraft Statuses</option>
              <option value="AVAILABLE">Standby / Available</option>
              <option value="DELAYED">Delayed / Affected</option>
              <option value="MAINTENANCE">Maintenance Hold</option>
            </select>
          ) : (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
            >
              <option value="ALL">All Gate Statuses</option>
              <option value="CONFLICT">Active Conflicts</option>
              <option value="AVAILABLE">Clear / Vacant</option>
            </select>
          )}

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-bold flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Assets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AIRCRAFT TABLE */}
      {activeTab === 'aircraft' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full no-scrollbar">
            <table className="w-full text-left text-xs font-body-sm min-w-[700px]">
              <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
                <tr>
                  <th className="p-4">Tail Number</th>
                  <th className="p-4">Aircraft Type</th>
                  <th className="p-4">Current Location</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4">Next Flight</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Maintenance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-label-code">
                {isLoading ? (
                  [1, 2, 3, 4].map(n => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-24 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-28 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-24 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    </tr>
                  ))
                ) : filteredAircraft.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-on-surface-variant">
                      No aircraft match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAircraft.map((ac) => (
                    <tr key={ac.tailNumber} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="p-4 font-bold text-sm text-secondary font-data-display">
                        {ac.tailNumber}
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        {ac.type} ({ac.category || 'Jet'})
                      </td>
                      <td className="p-4 text-on-surface">
                        {ac.location}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ac.status.includes('Standby') || ac.status.includes('Available') ? 'bg-emerald-100 text-emerald-900' :
                          ac.status.includes('Delayed') ? 'bg-error-container text-on-error-container' :
                          ac.status.includes('Maintenance') ? 'bg-amber-100 text-amber-900' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          • {ac.status}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface font-bold">
                        {ac.nextFlight || 'Unassigned'}
                      </td>
                      <td className="p-4 text-on-surface">
                        {ac.availability}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${ac.maintenanceStatus === 'Cleared' ? 'text-emerald-700' : 'text-error'}`}>
                          {ac.maintenanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GATES TABLE */}
      {activeTab === 'gates' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full no-scrollbar">
            <table className="w-full text-left text-xs font-body-sm min-w-[700px]">
              <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
                <tr>
                  <th className="p-4">Gate / Stand</th>
                  <th className="p-4">Terminal & Pier</th>
                  <th className="p-4">Current Occupant</th>
                  <th className="p-4">Next Scheduled Flight</th>
                  <th className="p-4">Occupancy Status</th>
                  <th className="p-4">Conflict Resolution Details</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-label-code">
                {isLoading ? (
                  [1, 2, 3, 4].map(n => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-24 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-24 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-36 bg-surface-container-high rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredGates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-on-surface-variant">
                      No gates match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGates.map((gate) => (
                    <tr key={gate.gate} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="p-4 font-bold text-sm text-on-surface font-data-display">
                        {gate.gate}
                      </td>
                      <td className="p-4 text-on-surface">
                        {gate.terminal}
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        {gate.currentFlight}
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        {gate.nextFlight}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          gate.status === 'Conflict' ? 'bg-error text-on-error' :
                          gate.status.includes('Clear') ? 'bg-emerald-100 text-emerald-900' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          • {gate.status}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {gate.conflictDetails}
                      </td>
                      <td className="p-4 text-right">
                        {gate.status === 'Conflict' ? (
                          <button
                            onClick={() => handleResolveConflict(gate.gate)}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-white font-bold text-[11px] hover:bg-secondary/90 transition-colors shadow-sm"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Nominal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
