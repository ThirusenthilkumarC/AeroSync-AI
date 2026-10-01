import React, { useState } from 'react';
import { Plane, Building2, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { aircraftData } from '../data/aircraft';
import { gatesData } from '../data/gates';

export default function GatesAircraftPage() {
  const [activeTab, setActiveTab] = useState('aircraft');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAircraft = aircraftData.filter(ac => 
    ac.tailNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ac.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ac.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGates = gatesData.filter(g => 
    g.gate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              PHYSICAL ASSETS & INFRASTRUCTURE
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Gates & Aircraft Telemetry
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Manage tail allocations, maintenance clearances, terminal jetbridges, and stand occupancy conflicts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
          <button
            onClick={() => setActiveTab('aircraft')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'aircraft' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Aircraft Fleet ({aircraftData.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('gates')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'gates' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Gates & Stands ({gatesData.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'aircraft' ? "Search tail number (e.g. VT-EXA), type, hub..." : "Search gate (e.g. Gate A4), terminal, status..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>
      </div>

      {/* TAB 1: AIRCRAFT */}
      {activeTab === 'aircraft' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-body-sm">
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
              {filteredAircraft.map((ac) => (
                <tr key={ac.tailNumber} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="p-4 font-bold text-sm text-secondary font-data-display">
                    {ac.tailNumber}
                  </td>
                  <td className="p-4 font-bold text-on-surface">
                    {ac.type} ({ac.category})
                  </td>
                  <td className="p-4 text-on-surface">
                    {ac.location}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      ac.status.includes('Standby') ? 'bg-emerald-100 text-emerald-900' :
                      ac.status.includes('Delayed') ? 'bg-error-container text-on-error-container' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      • {ac.status}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface font-bold">
                    {ac.nextFlight}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: GATES */}
      {activeTab === 'gates' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-body-sm">
            <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
              <tr>
                <th className="p-4">Gate / Stand</th>
                <th className="p-4">Terminal & Pier</th>
                <th className="p-4">Current Occupant</th>
                <th className="p-4">Next Scheduled Flight</th>
                <th className="p-4">Occupancy Status</th>
                <th className="p-4">Conflict Resolution Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-label-code">
              {filteredGates.map((gate) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
