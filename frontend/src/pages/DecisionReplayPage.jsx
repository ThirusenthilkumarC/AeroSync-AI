import React, { useState } from 'react';
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, Cpu, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { decisionEvents } from '../data/decisionReplay';

export default function DecisionReplayPage() {
  const [selectedEvent, setSelectedEvent] = useState(decisionEvents[0]);

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              AUDIT TRAIL & AI DECISION LOGS
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Operational Decision Replay
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Time-based event timeline recording initial telemetry triggers, AI plan generations, controller manual overrides, and regulatory authorizations.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm font-label-code text-xs">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          <div>
            <span className="font-bold text-on-surface">Immutable Audit Log</span>
            <div className="text-[10px] text-on-surface-variant">AIR-DGCA-SPEC-4 Verified</div>
          </div>
        </div>
      </div>

      {/* Main Split: Timeline (Left 7 Cols) + Snapshot Details (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
              <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-secondary" />
                Chronological Event Progression (24 Oct)
              </h2>
              <span className="font-label-code text-xs text-on-surface-variant">Click event to inspect snapshot</span>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
              {decisionEvents.map((evt) => (
                <div 
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    selectedEvent.id === evt.id 
                      ? 'bg-surface-container-lowest border-secondary shadow-md ring-2 ring-secondary/20' 
                      : 'bg-surface-container-low/60 border-surface-container-highest hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`absolute -left-8 top-4 w-4 h-4 rounded-full border-2 border-white ${
                    evt.severity === 'critical' ? 'bg-error' :
                    evt.severity === 'warning' ? 'bg-amber-500' :
                    evt.severity === 'success' ? 'bg-emerald-500' : 'bg-secondary'
                  }`}></div>

                  <div className="flex items-center justify-between font-label-code text-xs">
                    <span className="font-bold text-secondary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {evt.timestamp}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase">
                      {evt.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-on-surface font-headline-md">{evt.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{evt.description}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Selected Event Snapshot Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
              <span className="font-label-caps text-xs text-secondary font-bold uppercase">EVENT SNAPSHOT TELEMETRY</span>
              <span className="font-label-code text-xs text-on-surface-variant">{selectedEvent.timestamp}</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-base text-on-surface font-headline-lg">{selectedEvent.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{selectedEvent.description}</p>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2 font-label-code text-xs">
                <div className="font-semibold text-secondary">Captured System Metadata:</div>
                <pre className="text-[11px] text-on-surface font-mono overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
