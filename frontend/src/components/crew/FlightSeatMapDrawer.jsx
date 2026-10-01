import React, { useState, useEffect } from 'react';
import { X, Plane, CheckCircle2, AlertTriangle, Shield, Info, ArrowRight, UserCheck } from 'lucide-react';
import { getFlightSeats } from '../../services/api';

export default function FlightSeatMapDrawer({ flightId, onClose }) {
  const [flightData, setFlightData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSeats = async () => {
      setLoading(true);
      const res = await getFlightSeats(flightId);
      if (isMounted) {
        setFlightData(res.data);
        setLoading(false);
      }
    };
    if (flightId) {
      loadSeats();
    }
    return () => { isMounted = false; };
  }, [flightId]);

  if (!flightId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-2xl h-full bg-surface-container-lowest p-6 md:p-8 shadow-2xl overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold font-data-display text-sm">
              ✈
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface font-headline-lg">
                {flightData?.flightNumber || flightId} Flight Telemetry & Seat Map
              </h3>
              <p className="text-xs text-on-surface-variant font-label-code">
                {flightData?.origin} → {flightData?.destination} • {flightData?.aircraft} ({flightData?.tailNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-label-code text-on-surface-variant animate-pulse">
            Loading live cabin inventory telemetry...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Flight Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-label-code text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Departure / Arrival</span>
                <div className="font-bold text-on-surface mt-0.5">{flightData.departure} → {flightData.arrival}</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Gate & Stand</span>
                <div className="font-bold text-on-surface mt-0.5">{flightData.gate}</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Status</span>
                <div className={`font-bold mt-0.5 ${flightData.delayMinutes > 0 ? 'text-error' : 'text-emerald-700'}`}>
                  {flightData.status}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Tail Registration</span>
                <div className="font-bold text-secondary mt-0.5">{flightData.tailNumber}</div>
              </div>
            </div>

            {/* SEAT SUMMARY BAR */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2">
              <div className="font-label-caps text-xs text-secondary font-bold uppercase">SEAT SUMMARY & CABIN INVENTORY</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center font-label-code">
                <div className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container-highest">
                  <span className="text-[10px] text-on-surface-variant font-bold">TOTAL SEATS</span>
                  <div className="font-data-display text-base font-bold text-on-surface">{flightData.totalSeats}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-[10px] text-red-800 font-bold">BOOKED</span>
                  <div className="font-data-display text-base font-bold text-red-700">{flightData.bookedSeats}</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold">AVAILABLE</span>
                  <div className="font-data-display text-base font-bold text-emerald-700">{flightData.availableSeats}</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-900 font-bold">HELD</span>
                  <div className="font-data-display text-base font-bold text-amber-800">{flightData.heldSeats}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-300">
                  <span className="text-[10px] text-slate-700 font-bold">BLOCKED</span>
                  <div className="font-data-display text-base font-bold text-slate-800">{flightData.blockedSeats}</div>
                </div>
                <div className="p-2 rounded-lg bg-secondary-fixed/50 border border-secondary-container">
                  <span className="text-[10px] text-on-secondary-fixed font-bold">LOAD</span>
                  <div className="font-data-display text-base font-bold text-secondary">{flightData.loadPercentage}</div>
                </div>
              </div>
            </div>

            {/* SEAT MAP LEGEND */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-highest font-label-code text-xs">
              <span className="font-bold text-on-surface">Cabin Map Legend:</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> 🟢 Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500"></span> 🔴 Booked</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400"></span> 🟡 Held</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700"></span> ⚫ Blocked</span>
              </div>
            </div>

            {/* SELECTED SEAT CALLOUT */}
            {selectedSeat && (
              <div className="p-4 rounded-xl bg-primary-container text-on-primary font-label-code text-xs flex items-center justify-between shadow-md">
                <div>
                  <div className="font-bold text-sm text-white">Seat: {selectedSeat.seatNumber}</div>
                  <div className="text-primary-fixed-dim mt-0.5">
                    Status: <strong className="text-white">{selectedSeat.status}</strong> • Cabin: {selectedSeat.cabin} • Type: {selectedSeat.type}
                  </div>
                </div>
                <button onClick={() => setSelectedSeat(null)} className="text-primary-fixed-dim hover:text-white">
                  Dismiss
                </button>
              </div>
            )}

            {/* REALISTIC CABIN SEAT MAP GRID */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-inner space-y-3 font-label-code">
              
              <div className="text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-widest pb-2 border-b border-surface-container-highest">
                ✈ Cockpit / Nose
              </div>

              {/* Column Labels */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-on-surface-variant py-1">
                <div>Row</div>
                <div className="flex justify-center gap-1"><span>A</span><span>B</span><span>C</span></div>
                <div>Aisle</div>
                <div className="flex justify-center gap-1"><span>D</span><span>E</span><span>F</span></div>
              </div>

              {/* Seat Rows */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
                {Array.from({ length: 30 }).map((_, rIdx) => {
                  const rowNum = rIdx + 1;
                  const rowStr = rowNum < 10 ? `0${rowNum}` : `${rowNum}`;
                  const rowSeats = flightData.seats.filter(s => s.row === rowStr);

                  return (
                    <div key={rowStr} className="grid grid-cols-7 gap-1 items-center text-center">
                      <span className="text-[10px] font-bold text-outline">{rowStr}</span>
                      
                      {/* Left Block A, B, C */}
                      <div className="flex justify-center gap-1">
                        {['A', 'B', 'C'].map(col => {
                          const seat = rowSeats.find(s => s.column === col);
                          if (!seat) return <div key={col} className="w-6 h-6"></div>;
                          const bgClass = 
                            seat.status === 'AVAILABLE' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' :
                            seat.status === 'BOOKED' ? 'bg-red-500 text-white opacity-80' :
                            seat.status === 'HELD' ? 'bg-amber-400 text-amber-950 font-bold' :
                            'bg-slate-700 text-slate-300';
                          return (
                            <button
                              key={col}
                              onClick={() => setSelectedSeat(seat)}
                              className={`w-6 h-6 rounded text-[9px] font-bold transition-transform active:scale-95 flex items-center justify-center ${bgClass}`}
                              title={`Seat ${seat.seatNumber} (${seat.status})`}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[9px] text-outline font-normal">Aisle</div>

                      {/* Right Block D, E, F */}
                      <div className="flex justify-center gap-1">
                        {['D', 'E', 'F'].map(col => {
                          const seat = rowSeats.find(s => s.column === col);
                          if (!seat) return <div key={col} className="w-6 h-6"></div>;
                          const bgClass = 
                            seat.status === 'AVAILABLE' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' :
                            seat.status === 'BOOKED' ? 'bg-red-500 text-white opacity-80' :
                            seat.status === 'HELD' ? 'bg-amber-400 text-amber-950 font-bold' :
                            'bg-slate-700 text-slate-300';
                          return (
                            <button
                              key={col}
                              onClick={() => setSelectedSeat(seat)}
                              className={`w-6 h-6 rounded text-[9px] font-bold transition-transform active:scale-95 flex items-center justify-center ${bgClass}`}
                              title={`Seat ${seat.seatNumber} (${seat.status})`}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-widest pt-2 border-t border-surface-container-highest">
                Galley / Rear Tail
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
