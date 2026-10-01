import React, { useState } from 'react';
import { UserCheck, AlertTriangle, ShieldCheck, Bus, Hotel, Search, ArrowRight } from 'lucide-react';
import { passengersData, passengerImpactSummary } from '../data/passengers';

export default function PassengerImpactPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPassengers = passengersData.filter(pax => 
    pax.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pax.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              PASSENGER CARE & CONNECTION PROTECTION
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Passenger Impact & Protection Matrix
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Automated misconnection prevention, airside priority buggy dispatch, and dynamic re-accommodation.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm font-label-code">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Protected Rate</span>
            <div className="font-data-display text-xl font-bold text-secondary">{passengerImpactSummary.paxProtectedRate}</div>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div>
            <span className="font-label-caps text-[10px] text-error uppercase font-bold">At Risk Conx</span>
            <div className="font-data-display text-xl font-bold text-error">{passengerImpactSummary.criticalConnectionsAtRisk} Pax</div>
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
          <div className="font-data-display text-2xl font-bold text-on-surface">{passengerImpactSummary.totalImpacted} Pax</div>
          <div className="text-[11px] text-on-surface-variant font-label-code">Across 4 sector delays</div>
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

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PNR (e.g. AS-89412), Passenger Name, Route..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>
      </div>

      {/* Passenger PNR Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs font-body-sm">
          <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
            <tr>
              <th className="p-4">PNR Record</th>
              <th className="p-4">Passenger Name & Tier</th>
              <th className="p-4">Flight Itinerary</th>
              <th className="p-4">Connecting Leg</th>
              <th className="p-4">Connection Window</th>
              <th className="p-4">Risk Level</th>
              <th className="p-4">Automated Protection Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest font-label-code">
            {filteredPassengers.map((pax) => (
              <tr key={pax.pnr} className="hover:bg-surface-container-low/60 transition-colors">
                
                <td className="p-4 font-bold text-sm text-secondary font-data-display">
                  {pax.pnr}
                </td>

                <td className="p-4 font-bold text-on-surface">
                  <div>{pax.name}</div>
                  <div className="text-[10px] text-on-surface-variant font-normal">{pax.priority} ({pax.passengerCount} Pax)</div>
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
                    pax.risk.includes('Critical') ? 'bg-error text-on-error' :
                    pax.risk.includes('High') ? 'bg-amber-500 text-white' :
                    'bg-emerald-100 text-emerald-900'
                  }`}>
                    • {pax.risk}
                  </span>
                </td>

                <td className="p-4 text-on-surface font-semibold">
                  {pax.rebookingAction}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
