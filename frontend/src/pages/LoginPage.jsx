import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Radar, Network, Route, ArrowRight, Lock, Eye, EyeOff, BadgeCheck, Building2, Zap, Radio } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('ops.controller@aerosync.aero');
  const [password, setPassword] = useState('••••••••••••');
  const [station, setStation] = useState('DEL');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberStation, setRememberStation] = useState(true);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    navigate('/dashboard');
  };

  const handleDemoQuickAccess = () => {
    setEmail('dispatcher.del@aerosync.aero');
    setPassword('AeroSync2026!');
    setStation('DEL');
    setTimeout(() => {
      navigate('/dashboard');
    }, 300);
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-4 md:p-8">
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-surface-container-highest">
          
          {/* Left Side: Aviation Command & AI Ops Visual Brand */}
          <div className="lg:col-span-6 relative flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-primary-container text-on-primary">
            {/* Ambient atmospheric tactical glow overlays */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none"></div>

            {/* Radar vector sweep illustration */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
              <svg className="w-[140%] h-[140%] max-w-none animate-spin" style={{ animationDuration: '48s', animationTimingFunction: 'linear' }} viewBox="0 0 800 800">
                <circle cx="400" cy="400" r="380" stroke="#5bb8fe" strokeDasharray="6 6" strokeWidth="1.5"></circle>
                <circle cx="400" cy="400" r="280" stroke="#5bb8fe" strokeDasharray="4 4" strokeWidth="1.2"></circle>
                <circle cx="400" cy="400" r="180" stroke="#5bb8fe" strokeWidth="1.2"></circle>
                <circle cx="400" cy="400" r="80" stroke="#5bb8fe" strokeWidth="1"></circle>
                <line x1="400" y1="20" x2="400" y2="780" stroke="#5bb8fe" strokeDasharray="8 8" strokeWidth="1"></line>
                <line x1="20" y1="400" x2="780" y2="400" stroke="#5bb8fe" strokeDasharray="8 8" strokeWidth="1"></line>
                <path d="M400 400 L760 300 A380 380 0 0 0 400 20 Z" fill="url(#radarGradient)" opacity="0.45"></path>
                <defs>
                  <linearGradient id="radarGradient" x1="400" y1="400" x2="700" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5bb8fe" stopOpacity="0"></stop>
                    <stop offset="100%" stopColor="#5bb8fe" stopOpacity="0.8"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Top Header & Brand Identity */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shadow-inner">
                    <Plane className="w-6 h-6 transform -rotate-45 text-secondary-container" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-lg text-headline-md tracking-tight text-white flex items-center gap-1.5">
                      AeroSync <span className="text-secondary-container">AI</span>
                    </span>
                    <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed-dim">
                      Next-Gen Autonomous OCC
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest/10 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                  <span className="font-label-code text-label-code text-secondary-container">ADS-B LIVE</span>
                </div>
              </div>
            </div>

            {/* Center Aviation Value Props */}
            <div className="relative z-10 py-10 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/30 text-secondary-fixed text-xs font-semibold">
                  <Radar className="w-4 h-4 text-secondary-container" />
                  <span className="uppercase tracking-wider">Predictive Network Recovery</span>
                </div>
                <h1 className="font-headline-xl text-4xl text-white tracking-tight leading-tight font-extrabold">
                  Smart Airline Operations
                </h1>
                <p className="font-body-lg text-lg text-primary-fixed-dim">
                  Predict. Recover. Operate Smarter.
                </p>
              </div>

              {/* Feature Bullets */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Real-time AI Disruption Cascading Detection</div>
                    <div className="text-xs text-surface-variant mt-0.5">Synthesizes weather fronts, runway congestion, and reactionary delays instantaneously.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container">
                    <Route className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Automated Gate, Crew & Aircraft Conflict Resolution</div>
                    <div className="text-xs text-surface-variant mt-0.5">Generates non-conflicting multi-agent recovery schedules within seconds of event triggers.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Passenger Connection Protection & Dynamic Re-accommodation</div>
                    <div className="text-xs text-surface-variant mt-0.5">Guards high-value itineraries with algorithmic misconnect prevention & downstream alerts.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Network Footer Bar */}
            <div className="relative z-10 pt-4 bg-primary/20 backdrop-blur-md rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-label-code">
                <div className="flex items-center gap-2 text-white">
                  <Radio className="w-4 h-4 text-secondary-container" />
                  <span className="text-secondary-fixed">OCC Network: 412 Active Aircraft</span>
                </div>
                <div className="flex items-center gap-3 text-surface-variant">
                  <span className="text-secondary-fixed-dim">99.4% System Integrity</span>
                  <span className="w-1 h-1 rounded-full bg-outline"></span>
                  <span className="text-secondary-container">Live ADS-B Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: OCC Staff Authentication Deck */}
          <div className="lg:col-span-6 flex flex-col justify-between p-8 md:p-12 bg-surface-container-lowest text-on-surface">
            <div className="w-full max-w-md mx-auto space-y-6">
              
              {/* Card Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-[10px] uppercase tracking-wider font-bold">
                    Authorized Personnel Only
                  </span>
                  <span className="font-label-code text-xs text-outline font-semibold">SEC-LEVEL 4</span>
                </div>
                <h2 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
                  Operations Control Center (OCC) Portal
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant">
                  Sign in with your airline staff credentials or security key.
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-4" onSubmit={handleLogin}>
                
                {/* Official Airline Email */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-xs uppercase text-on-surface-variant tracking-wider font-bold">
                    Official Airline Email / Staff ID
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 transition-all"
                      placeholder="ops.controller@aerosync.aero"
                      required
                    />
                  </div>
                </div>

                {/* OCC Security PIN / Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-caps text-xs uppercase text-on-surface-variant tracking-wider font-bold">
                      OCC Security Pin / Password
                    </label>
                    <a href="#forgot" className="font-label-caps text-xs text-secondary hover:underline">Forgot credentials?</a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 transition-all"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Hub / Station Selector */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-xs uppercase text-on-surface-variant tracking-wider font-bold">
                    Assigned Station / Tactical Hub
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 transition-all appearance-none"
                    >
                      <option value="DEL">DEL / Indira Gandhi Intl (Primary Hub)</option>
                      <option value="BOM">BOM / Chhatrapati Shivaji Maharaj Intl</option>
                      <option value="BLR">BLR / Kempegowda Intl Hub</option>
                      <option value="DXB">DXB / Dubai International Gateway</option>
                      <option value="LHR">LHR / London Heathrow Terminal 4</option>
                      <option value="MAA">MAA / Chennai International Desk</option>
                    </select>
                  </div>
                </div>

                {/* Remember Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberStation"
                    checked={rememberStation}
                    onChange={(e) => setRememberStation(e.target.checked)}
                    className="w-4 h-4 rounded text-secondary accent-secondary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="rememberStation" className="font-body-sm text-xs text-on-surface-variant cursor-pointer select-none">
                    Remember this OCC terminal workstation for 12 hours
                  </label>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-semibold shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Login to AeroSync OCC</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Fast-Track Evaluation Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-surface-container-highest"></div>
                <span className="absolute px-3 bg-surface-container-lowest text-outline font-label-caps text-xs uppercase tracking-wider font-semibold">
                  or fast-track evaluation
                </span>
              </div>

              {/* Fast-Track Demo Button */}
              <button
                type="button"
                onClick={handleDemoQuickAccess}
                className="w-full py-3 px-4 rounded-xl bg-secondary-fixed/50 border border-secondary-container/40 text-on-secondary-fixed font-body-md text-sm font-semibold hover:bg-secondary-fixed transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                  <span>Demo Quick Access: Auto-fill Dispatcher Profile</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-code text-xs font-bold">
                  DISPATCH-09
                </span>
              </button>

              {/* Bottom Security Compliance Tag */}
              <div className="pt-4 flex items-center justify-between text-[11px] font-label-code text-outline border-t border-surface-container-highest">
                <span>🔒 256-Bit Aviation Security Protocol</span>
                <span>ICAO ANNEX 6 & DGCA CAR COMPLIANT</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
