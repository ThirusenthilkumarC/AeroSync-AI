import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  AlertTriangle, ArrowRight, Activity, Clock, ShieldAlert, Cpu, Users, Building2, 
  CheckCircle2, ChevronRight, Sparkles, X, Info, TrendingUp, BarChart2, Layers 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { activeDisruptions } from '../data/disruptions';
import { networkRippleForecast } from '../data/forecast';

// Custom React Flow Node Component
const CustomCascadeNode = ({ data }) => {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-error-container text-on-error-container border-error/40';
      case 'warning':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'ai':
        return 'bg-secondary-fixed text-on-secondary-fixed border-secondary-container';
      case 'predicted':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div 
      onClick={() => data.onNodeClick(data)}
      className={`p-4 rounded-2xl bg-surface-container-lowest border shadow-md hover:shadow-xl transition-all w-64 cursor-pointer relative ${
        data.badgeType === 'critical' ? 'border-error/50 ring-2 ring-error/20' : 'border-surface-container-highest'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-secondary" />
      
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold">
          {data.stage} • {data.title}
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-label-code font-bold border ${getBadgeStyle(data.badgeType)}`}>
          {data.badge}
        </span>
      </div>

      <div className="font-headline-md text-base font-bold text-on-surface">
        {data.subtitle}
      </div>

      <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
        {data.description}
      </p>

      <div className="mt-3 pt-2 border-t border-surface-container-highest flex items-center justify-between text-[11px] font-label-code text-secondary">
        <span>Click for details</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-secondary" />
    </div>
  );
};

const nodeTypes = {
  cascadeNode: CustomCascadeNode
};

export default function DisruptionCenterPage() {
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState('ALL');
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const activeIncident = activeDisruptions[0];

  const handleNodeClick = useCallback((nodeData) => {
    setSelectedNodeData(nodeData);
  }, []);

  // React Flow initial nodes representing the Cascade map
  const initialNodes = [
    {
      id: '1',
      type: 'cascadeNode',
      position: { x: 50, y: 150 },
      data: {
        stage: '01',
        title: 'ROOT FLIGHT',
        subtitle: 'Flight 6E 1234',
        badge: 'IMPACT: +90m',
        badgeType: 'critical',
        description: 'MAA runway queue delay due to radar corridor weather congestion.',
        details: 'Route: MAA → DEL | Tail: VT-IFZ | Scheduled Dep: 18:30 UTC | Est Dep: 20:00 UTC | Delay: 90 mins',
        onNodeClick: handleNodeClick
      }
    },
    {
      id: '2',
      type: 'cascadeNode',
      position: { x: 340, y: 50 },
      data: {
        stage: '02',
        title: 'AIRCRAFT',
        subtitle: 'Tail VT-IFZ',
        badge: 'TAIL AT RISK',
        badgeType: 'warning',
        description: 'Airbus A320neo turnaround cycle compressed below safety tolerance.',
        details: 'Type: A320neo | Location: MAA Bay 14R | Maintenance: Hydraulic Valve Check Required',
        onNodeClick: handleNodeClick
      }
    },
    {
      id: '3',
      type: 'cascadeNode',
      position: { x: 340, y: 250 },
      data: {
        stage: '03',
        title: 'CREW ROSTER',
        subtitle: 'Capt. Rajiv R-12',
        badge: 'FDTL BREACH',
        badgeType: 'critical',
        description: 'Breaches mandatory DGCA Flight Duty Time Limitation (+22m).',
        details: 'Crew Pair: Capt. Rajiv Sen & FO A. Menon | Duty: 11h 20m | FDTL Lockout: 103.8%',
        onNodeClick: handleNodeClick
      }
    },
    {
      id: '4',
      type: 'cascadeNode',
      position: { x: 630, y: 50 },
      data: {
        stage: '04',
        title: 'GATE OCCUPANCY',
        subtitle: 'DEL Gate A4',
        badge: 'DUAL OCCUPANCY',
        badgeType: 'critical',
        description: 'Collision with incoming flight 6E 2108 arriving at 21:30 UTC.',
        details: 'Terminal 3 Gate A4 | Scheduled Overlap: 21:30 - 22:50 | Recommended Stand: Gate B4',
        onNodeClick: handleNodeClick
      }
    },
    {
      id: '5',
      type: 'cascadeNode',
      position: { x: 630, y: 250 },
      data: {
        stage: '05',
        title: 'PAX CONNECTIONS',
        subtitle: '24 Connectors',
        badge: 'MISCONNECT RISK',
        badgeType: 'warning',
        description: '14 Pax for 6E 502 (DEL→LHR) & 10 Pax for 6E 204 (DEL→DXB).',
        details: 'High yield itineraries at risk | Action: Pre-dispatch Express Airside Buggy',
        onNodeClick: handleNodeClick
      }
    },
    {
      id: '6',
      type: 'cascadeNode',
      position: { x: 920, y: 150 },
      data: {
        stage: '06',
        title: 'DOWNSTREAM',
        subtitle: 'Flight 6E 1892',
        badge: 'PREDICTED RIPPLE',
        badgeType: 'predicted',
        description: '2 onward flights affected with cumulative knock-on propagation.',
        details: 'DEL → BOM Leg | Downstream Delay: +45m | Financial Exposure: $18,400',
        onNodeClick: handleNodeClick
      }
    }
  ];

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
  ];

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-code text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              Predictive Telemetry Engine
            </span>
            <span className="h-2 w-2 rounded-full bg-error animate-ping"></span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            AI Disruption Center
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Deep contextual analysis of active operational bottlenecks with multi-tier domino effect prediction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-highest shadow-sm text-xs font-semibold font-label-code">
            <Activity className="w-4 h-4 text-secondary" />
            <span>Triage Radar: Auto-Assessing</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-all">
            <Clock className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Hub Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <button 
          onClick={() => setSelectedHub('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            selectedHub === 'ALL' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-lowest'
          }`}
        >
          <span>All Hubs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">4 Hubs Active</span>
        </button>

        <button 
          onClick={() => setSelectedHub('DEL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            selectedHub === 'DEL' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-error"></span>
          <span>Delhi (DEL)</span>
          <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-bold">2 Disruptions</span>
        </button>

        <button 
          onClick={() => setSelectedHub('BOM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            selectedHub === 'BOM' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-lowest'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>Mumbai (BOM)</span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">Normal</span>
        </button>

        <button 
          onClick={() => setSelectedHub('MAA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            selectedHub === 'MAA' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-error"></span>
          <span>Chennai (MAA)</span>
          <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-bold">1 Disruption</span>
        </button>
      </div>

      {/* Disrupted Flight Spotlight Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-highest overflow-hidden">
        
        {/* Incident Alert Banner */}
        <div className="w-full bg-gradient-to-r from-error/90 via-error to-error/95 text-on-error px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-label-code text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>Active Critical Disruption • Incident #DIS-2024-8841</span>
          </div>
          <div className="flex items-center gap-4 font-label-code text-xs">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">PRIORITY ALPHA-1</span>
            <span>Time Elapsed: 00:18:42</span>
          </div>
        </div>

        {/* Flight Matrix Header */}
        <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center text-on-surface shrink-0 shadow-inner">
                <Activity className="w-7 h-7 text-secondary" />
                <span className="font-label-caps text-[9px] font-bold text-on-surface-variant">A320neo</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-data-display text-2xl font-bold text-on-surface">6E 1234</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-label-caps text-[11px] font-bold uppercase shadow-sm">
                    Delayed by 90 minutes
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-lg font-bold text-on-surface font-headline-md">
                  <span>Chennai (MAA)</span>
                  <ArrowRight className="w-5 h-5 text-secondary" />
                  <span>Delhi (DEL)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-surface-container-highest sm:pl-6">
              <div>
                <div className="text-[10px] text-on-surface-variant font-label-caps uppercase font-bold">Scheduled Dep</div>
                <div className="line-through text-outline font-data-display text-sm">18:30</div>
                <div className="font-label-code text-xs text-error font-bold">Est 20:00</div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant font-label-caps uppercase font-bold">Scheduled Arr</div>
                <div className="line-through text-outline font-data-display text-sm">21:20</div>
                <div className="font-label-code text-xs text-error font-bold">Est 22:50</div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant font-label-caps uppercase font-bold">Tail Number</div>
                <div className="font-data-display text-sm font-bold text-on-surface">VT-IFZ</div>
                <div className="text-xs text-on-surface-variant font-label-code">Bay 14R (MAA)</div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant font-label-caps uppercase font-bold">Pax On Board</div>
                <div className="font-data-display text-sm font-bold text-on-surface">174 / 186</div>
                <div className="text-xs text-secondary font-semibold font-label-code">93.5% Load</div>
              </div>
            </div>

          </div>

          {/* Root Cause Card */}
          <div className="xl:max-w-xs w-full bg-surface-container rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-label-caps uppercase text-on-surface-variant font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                Root Cause
              </span>
              <span className="font-label-code px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-semibold text-[11px]">
                Dual Anomaly
              </span>
            </div>
            <p className="text-xs text-on-surface font-medium leading-relaxed">
              Inbound aircraft technical inspection & ATC En-route weather restriction.
            </p>
          </div>
        </div>

      </div>

      {/* DISRUPTION CASCADE MAP (React Flow) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-secondary text-xs font-bold uppercase">
                Domino Waveform v3.8
              </span>
              <span className="font-label-code text-xs text-on-surface-variant">Neural propagation depth: 4 tiers</span>
            </div>
            <h2 className="font-headline-lg text-xl font-bold text-on-surface">
              Disruption Cascade Map (Multi-Stage Impact Flow)
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-error-container/60 text-on-error-container text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>AI detected 4 potential cascading impacts across airline operations</span>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="w-full h-[400px] bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-inner relative overflow-hidden">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls className="!bg-white !border-slate-200 !shadow-md" />
          </ReactFlow>
        </div>
      </div>

      {/* Selected Node Details Drawer / Modal */}
      {selectedNodeData && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-secondary-container/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface font-headline-md">
                  Node Details: {selectedNodeData.subtitle}
                </h3>
                <p className="text-xs text-on-surface-variant font-label-code">{selectedNodeData.title} • {selectedNodeData.stage}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNodeData(null)}
              className="p-1 rounded-lg hover:bg-surface-container"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low text-xs font-label-code text-on-surface space-y-2">
            <div className="font-semibold text-secondary">Operational Telemetry Data:</div>
            <div>{selectedNodeData.details}</div>
            <div className="pt-2 border-t border-surface-container-highest text-on-surface-variant">
              Full disruption cascade propagation vector isolated. Autonomous recommendation available.
            </div>
          </div>
        </div>
      )}

      {/* FUTURE RIPPLE FORECAST (Recharts) */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-secondary" />
              <h2 className="font-headline-lg text-lg font-bold text-on-surface">Network Ripple Forecast</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Predictive escalation curve if no mitigation action is executed over the next 120 minutes.
            </p>
          </div>

          <div className="flex items-center gap-3 font-label-code text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Forecast Confidence: 94.8%
            </span>
          </div>
        </div>

        {/* Forecast Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {networkRippleForecast.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs font-bold text-secondary uppercase">{item.timeLabel}</span>
                <span className="font-label-code text-[11px] text-on-surface-variant">{item.confidence}% Conf.</span>
              </div>
              <div className="my-2">
                <div className="font-data-display text-2xl font-bold text-on-surface">{item.affectedFlights} Flights</div>
                <div className="text-xs text-error font-semibold font-label-code mt-0.5">{item.passengersAtRisk} Passengers at Risk</div>
              </div>
              <div className="text-[11px] text-on-surface-variant font-label-code pt-2 border-t border-surface-container-highest">
                Cumulative Delays: +{item.downstreamDelaysMin} mins
              </div>
            </div>
          ))}
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkRippleForecast}>
              <defs>
                <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFlights" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="passengersAtRisk" name="Passengers at Risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorPax)" />
              <Area type="monotone" dataKey="affectedFlights" name="Affected Flights" stroke="#0284c7" fillOpacity={1} fill="url(#colorFlights)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Synthesis Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-container via-primary-container to-slate-900 text-on-primary shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shrink-0">
            <Sparkles className="w-7 h-7 text-secondary-container" />
          </div>
          <div>
            <div className="font-headline-lg text-lg font-bold text-white">
              AI has synthesized a 5-point holistic Recovery Plan
            </div>
            <p className="text-xs text-primary-fixed-dim mt-0.5">
              Resolves aircraft swap (VT-IFZ → VT-EXA), reallocates Delhi Gate B4, calls in Reserve Crew #DEL-44, and dispatches tarmac VIP buggy transfers.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/recovery')}
          className="px-6 py-3 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors font-bold text-sm shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Proceed to AI Recovery Plan (5 Solutions)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
