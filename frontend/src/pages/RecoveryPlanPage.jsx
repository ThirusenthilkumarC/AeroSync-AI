import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Clock, 
  HelpCircle, RefreshCw, X, FileText, Check, Cpu, Layers, DollarSign, Fuel, Activity, Play
} from 'lucide-react';
import { recoveryPlans, constraintValidations } from '../data/recoveryPlans';
import { approveRecoveryPlan, rejectRecoveryPlan } from '../services/api';

export default function RecoveryPlanPage({ autoReplanEnabled, setAutoReplanEnabled }) {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState('plan-a');
  const [selectedVersion, setSelectedVersion] = useState('V1');
  const [explainDrawerAction, setExplainDrawerAction] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoReplanMessage, setAutoReplanMessage] = useState(null);

  const activePlan = recoveryPlans.find(p => p.id === selectedPlanId) || recoveryPlans[0];

  // Auto-replanning simulation effect
  useEffect(() => {
    if (autoReplanEnabled) {
      const timer = setTimeout(() => {
        setSelectedPlanId('plan-b');
        setSelectedVersion('V2');
        setAutoReplanMessage('⚡ Live Event: Crew R-12 FDTL lockout detected! AI solver automatically replanned to V2.');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoReplanEnabled]);

  const handleApprovePlan = async () => {
    setIsProcessing(true);
    const res = await approveRecoveryPlan(activePlan.version);
    setIsProcessing(false);
    setApprovalResult(res.data);
    setApprovalModalOpen(true);
  };

  const handleRejectPlan = async () => {
    setIsProcessing(true);
    await rejectRecoveryPlan(activePlan.version, 'Operator requested scenario simulation');
    setIsProcessing(false);
    navigate('/recovery-sandbox');
  };

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header & Plan Telemetry Strip */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              Multi-Agent Synthesis Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-code text-xs">
              REC-9042
            </span>
            <span className="text-on-surface-variant text-xs flex items-center gap-1 font-body-sm">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Validated by Aero-LLM v4.2
            </span>
          </div>

          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            AI Recommended Recovery Plan
          </h1>
          <p className="font-body-lg text-sm text-on-surface-variant mt-1">
            Synthesized multi-agent resolution for <strong className="text-on-surface font-label-code">Flight 6E 1234</strong> disruption. Minimized delay impact by <strong className="text-secondary font-bold">72%</strong> across downstream sectors.
          </p>
        </div>

        {/* Quick Metrics Hero Badge */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-highest">
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">AI Confidence</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-data-display text-2xl font-bold text-on-surface">{activePlan.confidence}</span>
            </div>
            <span className="text-[10px] text-secondary font-semibold font-label-code flex items-center gap-1">
              ⚡ {activePlan.determinism}
            </span>
          </div>

          <div className="w-px h-10 bg-surface-container-highest hidden sm:block"></div>

          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Est. Ops Savings</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-data-display text-2xl font-bold text-on-surface">{activePlan.estimatedSavings}</span>
            </div>
            <span className="text-[10px] text-secondary-container font-semibold font-label-code">Direct + EU261 Buffer</span>
          </div>

          <div className="w-px h-10 bg-surface-container-highest hidden sm:block"></div>

          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Net Delay Recovery</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-data-display text-2xl font-bold text-secondary">{activePlan.netDelayRecovery}</span>
            </div>
            <span className="text-[10px] text-on-surface-variant font-label-code">Turnaround stabilized</span>
          </div>
        </div>
      </div>

      {/* Auto-Replanning Live Notification Alert */}
      {autoReplanMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between font-label-code text-xs">
          <span>{autoReplanMessage}</span>
          <button onClick={() => setAutoReplanMessage(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Live Auto-Replanning & Versioning Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Version Switcher */}
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-xs text-on-surface-variant uppercase font-bold">Plan Versions:</span>
          <div className="flex items-center gap-2">
            {recoveryPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setSelectedVersion(plan.version);
                }}
                className={`px-3 py-1.5 rounded-xl font-label-code text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedPlanId === plan.id 
                    ? 'bg-primary-container text-on-primary shadow-sm' 
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{plan.version}</span>
                <span className="text-[10px] opacity-75 font-normal">({plan.confidence})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Auto-Replanning Toggle */}
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl border border-surface-container-highest">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-secondary ${autoReplanEnabled ? 'animate-spin' : ''}`} />
            <span className="font-label-code text-xs font-bold text-on-surface">Live Auto-Replanning:</span>
          </div>
          <button
            onClick={() => setAutoReplanEnabled(!autoReplanEnabled)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              autoReplanEnabled ? 'bg-emerald-500 text-white' : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {autoReplanEnabled ? 'AUTO-REPLAN: ON' : 'AUTO-REPLAN: OFF'}
          </button>
        </div>

      </div>

      {/* Plan Selector Cards (Plan A vs Plan B vs Plan C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recoveryPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => {
              setSelectedPlanId(plan.id);
              setSelectedVersion(plan.version);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              selectedPlanId === plan.id 
                ? 'bg-surface-container-lowest border-secondary shadow-lg ring-2 ring-secondary/20' 
                : 'bg-surface-container-lowest/70 border-surface-container-highest hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-code text-xs font-bold">
                  {plan.version}
                </span>
                <span className="font-label-code text-xs font-bold text-secondary">{plan.confidence} Conf.</span>
              </div>
              <h3 className="font-bold text-base text-on-surface font-headline-md">{plan.name}</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-body-sm">{plan.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-surface-container-highest text-xs font-label-code">
              <div>
                <span className="text-on-surface-variant text-[10px]">Ops Savings</span>
                <div className="font-bold text-on-surface">{plan.estimatedSavings}</div>
              </div>
              <div>
                <span className="text-on-surface-variant text-[10px]">Net Delay</span>
                <div className="font-bold text-secondary">{plan.netDelayRecovery}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lifecycle Progression Timeline */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-highest shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            <h2 className="font-headline-md text-base font-bold text-on-surface">Lifecycle Progression Timeline</h2>
          </div>
          <span className="font-label-code text-xs text-on-surface-variant">Live Dispatch Delta: <strong>+90m to -25m Target</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Phase 01</span>
            <div className="font-semibold text-xs text-on-surface mt-1">Original Schedule</div>
            <div className="font-label-code text-[11px] text-on-surface-variant">STD: 18:30 UTC</div>
          </div>

          <div className="p-3 rounded-xl bg-error-container/40 border border-error/30">
            <span className="font-label-caps text-[10px] text-error uppercase font-bold">Phase 02 • Impact</span>
            <div className="font-semibold text-xs text-on-surface mt-1">Disruption Detected</div>
            <div className="font-label-code text-[11px] text-error font-semibold">+90m Hydraulic Valve</div>
          </div>

          <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-container/40">
            <span className="font-label-caps text-[10px] text-secondary uppercase font-bold">Phase 03</span>
            <div className="font-semibold text-xs text-on-surface mt-1">AI Analysis</div>
            <div className="font-label-code text-[11px] text-on-surface-variant">4 Ripple Vectors Solved</div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high border border-surface-container-highest">
            <span className="font-label-caps text-[10px] text-secondary uppercase font-bold">Phase 04</span>
            <div className="font-semibold text-xs text-on-surface mt-1">Plan Generated</div>
            <div className="font-label-code text-[11px] text-on-surface-variant">{activePlan.version} Ready</div>
          </div>

          <div className="p-3 rounded-xl bg-primary-container text-on-primary shadow-md">
            <span className="font-label-caps text-[10px] text-primary-fixed uppercase font-bold">Phase 05 • Active Gate</span>
            <div className="font-semibold text-xs text-white mt-1">Staff Approval</div>
            <div className="font-label-code text-[11px] text-primary-fixed-dim">Pending Authorization</div>
          </div>

        </div>
      </div>

      {/* Main Split: Action Recommendations (Left 8 Cols) + Governance Protocol Sidebar (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Concrete Action Recommendations */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-lg text-lg font-bold text-on-surface">Concrete Action Recommendations</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-code text-xs font-bold">
              {activePlan.actions.length} OF {activePlan.actions.length} STAGED
            </span>
          </div>

          <div className="space-y-4">
            {activePlan.actions.map((act) => (
              <div 
                key={act.id}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-code text-[10px] font-bold">
                          {act.category}
                        </span>
                        <h3 className="font-bold text-base text-on-surface font-headline-md">{act.title}</h3>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{act.description}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-label-code text-xs font-bold shrink-0">
                    {act.impactBadge}
                  </span>
                </div>

                <div className="pt-3 border-t border-surface-container-highest flex flex-wrap items-center justify-between gap-3 text-xs font-label-code">
                  <div className="flex items-center gap-4 text-on-surface-variant">
                    <span>Recovery: <strong className="text-secondary">{act.recoveryDelta}</strong></span>
                    <span>Confidence: <strong>{act.confidence}</strong></span>
                  </div>

                  {/* Explainable AI "Why this plan?" Button */}
                  <button
                    onClick={() => setExplainDrawerAction(act)}
                    className="px-3 py-1.5 rounded-lg bg-secondary-fixed/50 hover:bg-secondary-fixed text-on-secondary-fixed transition-colors font-bold flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <HelpCircle className="w-4 h-4 text-secondary" />
                    <span>Why this action?</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Operational Constraint Validation Section */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <h2 className="font-headline-md text-base font-bold text-on-surface">Operational Constraint Validation</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-label-code text-xs font-bold">
                All Systems Validated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {constraintValidations.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-1">
                  <div className="flex items-center justify-between text-xs font-label-code">
                    <span className="font-semibold text-on-surface">{item.title}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OCC Governance Protocol & Action Drawer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-md space-y-4">
            
            <div className="p-4 rounded-xl bg-secondary-fixed/30 border border-secondary-container/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary font-label-code">
                <Cpu className="w-4 h-4" />
                <span>OCC Governance Protocol</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                The AI provides synthetic decision recommendations only. Human staff controller authorization is strictly required to execute downstream operational changes.
              </p>
            </div>

            <button
              onClick={handleApprovePlan}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all font-bold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-secondary-container" />
              <span>{isProcessing ? 'Dispatching...' : 'Approve Recovery Plan'}</span>
            </button>

            <button
              onClick={() => navigate('/recovery-sandbox')}
              className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-on-surface-variant" />
              <span>Review Manually & Customize (Sandbox)</span>
            </button>

            <button
              onClick={handleRejectPlan}
              className="w-full py-2.5 rounded-xl bg-error-container/40 text-on-error-container hover:bg-error-container transition-colors font-semibold text-xs"
            >
              Reject Plan & Request Simulation
            </button>

            <div className="pt-4 border-t border-surface-container-highest space-y-2 text-[11px] font-label-code text-on-surface-variant">
              <div className="flex justify-between">
                <span>SOLVER RUN ID:</span>
                <span className="font-bold text-on-surface">SYNTH-8812-V</span>
              </div>
              <div className="flex justify-between">
                <span>CONTROLLER ON DUTY:</span>
                <span className="font-bold text-on-surface">Capt. Neha Sharma [ID: 4409]</span>
              </div>
              <div className="flex justify-between">
                <span>REGULATORY AUDIT KEY:</span>
                <span className="font-bold text-secondary">AIR-DGCA-REC-9042</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* EXPLAINABLE AI DRAWER ("Why this action?") */}
      {explainDrawerAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExplainDrawerAction(null)}>
          <div 
            className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 border border-secondary-container/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed/60 flex items-center justify-center text-secondary">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface font-headline-lg">WHY THIS ACTION? (AI EXPLAINABILITY PANEL)</h3>
                  <p className="text-xs text-on-surface-variant font-label-code">{explainDrawerAction.title}</p>
                </div>
              </div>
              <button onClick={() => setExplainDrawerAction(null)} className="p-2 rounded-xl hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider font-label-caps text-emerald-800">
                  Validated Action Reasons:
                </div>
                <ul className="space-y-1.5 text-xs font-label-code">
                  {explainDrawerAction.reasons?.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {explainDrawerAction.rejectedAlternatives?.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider font-label-caps text-red-800">
                    Rejected Alternatives & Conflicts:
                  </div>
                  <ul className="space-y-1.5 text-xs font-label-code">
                    {explainDrawerAction.rejectedAlternatives.map((alt, idx) => (
                      <li key={idx}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between text-xs font-label-code">
              <span className="text-on-surface-variant">Validated against DGCA CAR Section 3 Series M</span>
              <button 
                onClick={() => setExplainDrawerAction(null)}
                className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-bold"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN APPROVAL SUCCESS MODAL */}
      {approvalModalOpen && approvalResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-center border border-emerald-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-headline-lg text-xl font-bold text-on-surface">Recovery Plan Authorized!</h3>
              <p className="text-xs text-on-surface-variant font-label-code mt-2 leading-relaxed">
                {approvalResult.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low text-xs font-label-code text-left space-y-2">
              <div className="flex justify-between">
                <span>AUDIT KEY:</span>
                <span className="font-bold text-secondary">{approvalResult.auditKey}</span>
              </div>
              <div className="flex justify-between">
                <span>TIMESTAMP:</span>
                <span>{approvalResult.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setApprovalModalOpen(false)}
              className="w-full py-3 rounded-xl bg-primary-container text-on-primary font-bold text-xs"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
