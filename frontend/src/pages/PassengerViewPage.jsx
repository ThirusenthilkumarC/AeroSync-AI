import React, { useState } from 'react';
import { Plane, Search, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, Bus, ShieldCheck } from 'lucide-react';
import { passengersData } from '../data/passengers';

export default function PassengerViewPage() {
  const [pnrInput, setPnrInput] = useState('AS-89412');
  const [activePax, setActivePax] = useState(passengersData[0]);
  const [searched, setSearched] = useState(true);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const found = passengersData.find(
      p => p.pnr.toLowerCase() === pnrInput.trim().toLowerCase() || p.flightNumber.replace(/\s+/g, '').toLowerCase() === pnrInput.trim().toLowerCase()
    );
    if (found) {
      setActivePax(found);
    } else {
      setActivePax(passengersData[0]);
    }
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
      
      {/* Passenger Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Plane className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <span className="font-bold text-lg text-white font-headline-lg flex items-center gap-2">
              AeroSync <span className="text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">PAX PORTAL</span>
            </span>
            <span className="text-xs text-slate-400 block">Flight Status & Real-time Connection Protection</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Live Passenger Assistant Active
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-6 my-auto">
        
        {/* PNR Lookup Box */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl space-y-4">
          <h1 className="text-2xl font-bold text-white text-center font-headline-xl">Track Your Flight & Connection</h1>
          <p className="text-xs text-slate-400 text-center">
            Enter your 6-character Booking Reference (PNR) or Flight Number below to view real-time updates.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                placeholder="e.g. AS-89412 or 6E1234"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all uppercase placeholder:normal-case"
                required
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Check Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Passenger Status Result Card */}
        {searched && activePax && (
          <div className="p-6 md:p-8 rounded-3xl bg-slate-800/90 border border-cyan-500/30 shadow-2xl space-y-6">
            
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">PNR: {activePax.pnr}</span>
                <h2 className="text-2xl font-bold text-white font-headline-lg mt-0.5">{activePax.name}</h2>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
                • {activePax.status}
              </span>
            </div>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Incoming Leg</span>
                <div className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                  <span>{activePax.flightNumber}</span>
                  <span className="text-xs text-amber-400 font-normal">(+45m Revised)</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">Route: {activePax.route}</div>
                <div className="text-xs text-cyan-400 font-mono">Arrival Stand: Gate B4</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Connecting Flight</span>
                <div className="text-lg font-bold text-white font-mono">{activePax.connectingFlight}</div>
                <div className="text-xs text-slate-300 font-mono">Transfer Window: {activePax.connectionWindow}</div>
                <div className="text-xs text-emerald-400 font-mono">Connection Risk: Protected</div>
              </div>

            </div>

            {/* Recommended Action Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/50 space-y-3">
              <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm">
                <Bus className="w-5 h-5 text-cyan-400" />
                <span>Recommended Passenger Action</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {activePax.rebookingAction}
              </p>
              <div className="pt-2 border-t border-cyan-900/60 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                <span>Baggage Auto-Transferred to Gate B4</span>
                <span>Voucher Status: Free VIP Buggy</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500 font-mono">
        © 2026 AeroSync AI Passenger Portal • Powered by AeroSync Autonomous Dispatch Mesh
      </footer>

    </div>
  );
}
