import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Play, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, DollarSign, Clock, Users, Plane, BarChart2 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { runSimulation } from '../services/api';

export default function RecoverySandboxPage() {
  const navigate = useNavigate();
  const [aircraftUnavailable, setAircraftUnavailable] = useState(true);
  const [crewUnavailable, setCrewUnavailable] = useState(false);
  const [gateUnavailable, setGateUnavailable] = useState(true);
  const [delayMins, setDelayMins] = useState(60);
  const [cancellation, setCancellation] = useState(false);
  const [paxMisconnect, setPaxMisconnect] = useState(true);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const params = {
      aircraftUnavailable,
      crewUnavailable,
      gateUnavailable,
      delayMins,
      cancellation,
      paxMisconnect
    };
    const res = await runSimulation(params);
    setIsSimulating(false);
    setSimulationResults(res.data.results);
  };

  const chartComparisonData = [
    { scenario: 'Scenario A (Baseline)', cost: 42500, delay: 340, pax: 312 },
    { scenario: 'Scenario B (Simulated)', cost: simulationResults?.costExposure || 59000, delay: simulationResults?.networkDelayMins || 410, pax: simulationResults?.passengersImpacted || 380 },
    { scenario: 'Scenario C (Conservative)', cost: 78000, delay: 520, pax: 480 }
  ];

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-code text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              What-If Recovery Engine
            </span>
            <span className="font-label-caps text-[10px] uppercase text-outline px-2 py-0.5 rounded bg-surface-container-low font-bold">
              Isolated Sandbox Mode
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Recovery Simulation Sandbox
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Allow operations controllers to test recovery scenarios and evaluate cascade parameters without impacting the live network.
          </p>
        </div>

        <button 
          onClick={() => navigate('/recovery')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs border border-surface-container-highest"
        >
          <span>Return to Live Recovery Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Controls (Left 5 Cols) + Results & Graphs (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sandbox Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
            <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
              <Cpu className="w-5 h-5 text-secondary" />
              Scenario Constraint Controls
            </h2>
            <span className="font-label-code text-[11px] text-on-surface-variant">Live Network Unaffected</span>
          </div>

          {/* Toggle Switches & Checkboxes */}
          <div className="space-y-4 text-xs font-label-code">
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <label htmlFor="acUnavail" className="font-semibold text-on-surface cursor-pointer select-none">
                Aircraft Unavailable (VT-IFZ Maintenance Hold)
              </label>
              <input
                type="checkbox"
                id="acUnavail"
                checked={aircraftUnavailable}
                onChange={(e) => setAircraftUnavailable(e.target.checked)}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <label htmlFor="crewUnavail" className="font-semibold text-on-surface cursor-pointer select-none">
                Crew Unavailable (Standby Reserve Depleted)
              </label>
              <input
                type="checkbox"
                id="crewUnavail"
                checked={crewUnavailable}
                onChange={(e) => setCrewUnavailable(e.target.checked)}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <label htmlFor="gateUnavail" className="font-semibold text-on-surface cursor-pointer select-none">
                Gate Unavailable (DEL T3 Apron Full)
              </label>
              <input
                type="checkbox"
                id="gateUnavail"
                checked={gateUnavailable}
                onChange={(e) => setGateUnavailable(e.target.checked)}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
              />
            </div>

            {/* Delay Selector Buttons */}
            <div className="space-y-2 pt-2">
              <span className="font-semibold text-on-surface">Simulated Delay Injection:</span>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDelayMins(mins)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      delayMins === mins
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    +{mins} Min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <label htmlFor="cancellation" className="font-semibold text-on-surface cursor-pointer select-none">
                Flight Cancellation Risk Trigger
              </label>
              <input
                type="checkbox"
                id="cancellation"
                checked={cancellation}
                onChange={(e) => setCancellation(e.target.checked)}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <label htmlFor="paxMisconnect" className="font-semibold text-on-surface cursor-pointer select-none">
                Passenger Connection Breakage
              </label>
              <input
                type="checkbox"
                id="paxMisconnect"
                checked={paxMisconnect}
                onChange={(e) => setPaxMisconnect(e.target.checked)}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
              />
            </div>

          </div>

          {/* Action Trigger */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all font-bold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 text-secondary-container fill-secondary-container" />
            <span>{isSimulating ? 'Running Neural Simulation...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Simulation Output & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* KPI Output Cards */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">Simulation Impact Output</h2>
              <span className="font-label-code text-xs text-secondary font-bold">
                Confidence: {simulationResults ? `${simulationResults.recoveryConfidence}%` : '96.8% Baseline'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-label-code">
              
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Affected Flights</span>
                <div className="font-data-display text-2xl font-bold text-on-surface mt-1">
                  {simulationResults ? simulationResults.affectedFlights : 6}
                </div>
                <span className="text-[10px] text-error">Cascade depth: 4</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Pax Impacted</span>
                <div className="font-data-display text-2xl font-bold text-error mt-1">
                  {simulationResults ? simulationResults.passengersImpacted : 312}
                </div>
                <span className="text-[10px] text-on-surface-variant">24 critical conx</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Estimated Cost</span>
                <div className="font-data-display text-2xl font-bold text-on-surface mt-1">
                  ${simulationResults ? simulationResults.costExposure.toLocaleString() : '42,500'}
                </div>
                <span className="text-[10px] text-secondary">Mitigatable</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Network Delay</span>
                <div className="font-data-display text-2xl font-bold text-secondary mt-1">
                  {simulationResults ? simulationResults.networkDelayMins : 340}m
                </div>
                <span className="text-[10px] text-on-surface-variant">Cumulative</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Crew Duty Breaches</span>
                <div className="font-data-display text-2xl font-bold text-amber-600 mt-1">
                  {simulationResults ? simulationResults.crewDutyBreaches : 2}
                </div>
                <span className="text-[10px] text-on-surface-variant">FDTL Lockouts</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Solver Efficacy</span>
                <div className="font-data-display text-2xl font-bold text-emerald-600 mt-1">
                  94.2%
                </div>
                <span className="text-[10px] text-emerald-700">Optimal Match</span>
              </div>

            </div>
          </div>

          {/* Scenario Comparison Chart (Recharts) */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-secondary" />
                <h2 className="font-headline-md text-base font-bold text-on-surface">Scenario Cost & Delay Comparison</h2>
              </div>
              <span className="font-label-code text-xs text-on-surface-variant">Scenario A vs B vs C</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="scenario" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="cost" name="Operational Cost ($)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delay" name="Network Delay (Mins)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
