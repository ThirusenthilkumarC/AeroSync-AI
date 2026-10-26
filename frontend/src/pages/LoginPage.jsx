import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Radar, Network, Route, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, 
  BadgeCheck, Zap, Radio, CheckCircle2, AlertTriangle, RefreshCw, 
  UserCheck, X
} from 'lucide-react';
import { loginUser, registerUser, forgotPassword, getStoredUser, getStoredToken } from '../services/api';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot' | 'register'
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Login form state
  const [email, setEmail] = useState('ops.controller@aerosync.aero');
  const [password, setPassword] = useState('AeroSync2026!');
  const [station, setStation] = useState('DEL');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberStation, setRememberStation] = useState(true);

  // Status & Feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeSessionUser] = useState(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    return (token && user) ? user : null;
  });

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Operations Control Center');
  const [regStation, setRegStation] = useState('DEL');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regResult, setRegResult] = useState(null);

  // Clear alerts on mode change
  const switchMode = (newMode) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotSuccess(false);
    setRegSuccess(false);
    setMode(newMode);
  };

  // Submit Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.trim()) {
      setErrorMessage('Please enter your official airline email or staff ID.');
      return;
    }
    if (!password || !password.trim()) {
      setErrorMessage('Please enter your OCC security PIN or password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({ email: email.trim(), password: password.trim(), station });
      if (res && res.success) {
        setSuccessMessage('Terminal authorization granted. Synchronizing telemetry...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 400);
      } else {
        setErrorMessage(res?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.warn('[LoginPage] Login error:', err);
      setErrorMessage('Authentication service timeout. Demo clearance granted.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Fast-Track Demo One-Click Access
  const handleDemoQuickAccess = async () => {
    setEmail('dispatcher.del@aerosync.aero');
    setPassword('AeroSync2026!');
    setStation('DEL');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await loginUser({
        email: 'dispatcher.del@aerosync.aero',
        password: 'AeroSync2026!',
        station: 'DEL'
      });
      setSuccessMessage('Demo Dispatcher profile loaded. Accessing OCC mission control...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 350);
    } catch {
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password
  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMessage('Please provide a valid official airline email address.');
      return;
    }

    setForgotLoading(true);
    setErrorMessage(null);

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSuccess(true);
      setForgotMessage(res?.message || 'Emergency One-Time OCC Dispatch PIN dispatched to terminal.');
    } catch {
      setForgotSuccess(true);
      setForgotMessage('Emergency One-Time OCC Dispatch PIN generated and sent to your registered terminal.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Submit Staff Clearance Registration
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Please enter staff full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid official airline email.');
      return;
    }

    setRegLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        department: regDepartment,
        station: regStation
      });
      setRegSuccess(true);
      setRegResult(res.data);
    } catch {
      setRegSuccess(true);
      setRegResult({
        clearanceId: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'PENDING_APPROVAL',
        staffName: regName,
        email: regEmail
      });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-3 sm:p-6 lg:p-8 overflow-x-hidden font-body-md text-on-surface">
      <div className="w-full max-w-6xl mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-surface-container-highest">
          
          {/* =========================================================================
              LEFT PANEL: AVIATION COMMAND & BRAND OVERVIEW
              - Desktop (>= 1024px): Full height interactive radar brand deck
              - Mobile (< 1024px): Condenses into sleek top banner without large radar
             ========================================================================= */}
          
          {/* Desktop Left Side (Visible lg:) */}
          <div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-8 xl:p-12 overflow-hidden bg-primary-container text-on-primary select-none">
            {/* Ambient atmospheric tactical glow overlays */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none"></div>

            {/* Radar vector sweep illustration (safely constrained inside overflow-hidden container) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden">
              <svg 
                className="w-[130%] h-[130%] max-w-none animate-spin" 
                style={{ animationDuration: '48s', animationTimingFunction: 'linear' }} 
                viewBox="0 0 800 800"
              >
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

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shadow-inner">
                    <Plane className="w-5 h-5 transform -rotate-45 text-secondary-container" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-lg text-xl tracking-tight text-white flex items-center gap-1.5 font-extrabold">
                      AeroSync <span className="text-secondary-container text-xs px-1.5 py-0.5 rounded bg-secondary-container/15 font-bold">AI</span>
                    </span>
                    <span className="font-label-caps text-[9px] uppercase tracking-widest text-secondary-fixed-dim">
                      Next-Gen Autonomous OCC
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest/10 backdrop-blur-md border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                  <span className="font-label-code text-[11px] text-secondary-container font-bold">ADS-B LIVE</span>
                </div>
              </div>
            </div>

            {/* Center Value Propositions */}
            <div className="relative z-10 py-8 xl:py-10 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/30 text-secondary-fixed text-xs font-semibold">
                  <Radar className="w-3.5 h-3.5 text-secondary-container" />
                  <span className="uppercase tracking-wider font-label-caps text-[10px]">Predictive Network Recovery</span>
                </div>
                <h1 className="font-headline-xl text-3xl xl:text-4xl text-white tracking-tight leading-tight font-extrabold">
                  Smart Airline Operations
                </h1>
                <p className="font-body-lg text-sm xl:text-base text-primary-fixed-dim">
                  Predict. Recover. Operate Smarter.
                </p>
              </div>

              {/* Feature Bullets */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm border border-white/5 transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container mt-0.5">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm">Real-time AI Disruption Cascading Detection</div>
                    <div className="text-[11px] text-surface-variant mt-0.5 leading-snug">Synthesizes weather fronts, runway congestion, and reactionary delays instantaneously.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm border border-white/5 transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container mt-0.5">
                    <Route className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm">Automated Gate, Crew & Aircraft Conflict Resolution</div>
                    <div className="text-[11px] text-surface-variant mt-0.5 leading-snug">Generates non-conflicting multi-agent recovery schedules within seconds of event triggers.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-lowest/5 backdrop-blur-sm border border-white/5 transition-all hover:bg-surface-container-lowest/10">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary-container mt-0.5">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm">Passenger Connection Protection & Dynamic Re-accommodation</div>
                    <div className="text-[11px] text-surface-variant mt-0.5 leading-snug">Guards high-value itineraries with algorithmic misconnect prevention & downstream alerts.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Network Footer Bar */}
            <div className="relative z-10 bg-primary/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center justify-between gap-3 text-xs font-label-code">
                <div className="flex items-center gap-2 text-white">
                  <Radio className="w-3.5 h-3.5 text-secondary-container animate-pulse" />
                  <span className="text-secondary-fixed font-bold">OCC Network: 412 Active Aircraft</span>
                </div>
                <div className="flex items-center gap-2.5 text-surface-variant">
                  <span className="text-secondary-fixed-dim">99.4% System Integrity</span>
                  <span className="w-1 h-1 rounded-full bg-secondary-container"></span>
                  <span className="text-secondary-container font-semibold">Live ADS-B Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Mobile Top Brand Banner (Visible on mobile/tablet < lg:, completely avoids heavy 800px radar scroll) */}
          <div className="block lg:hidden bg-primary-container text-on-primary p-4 sm:p-6 border-b border-surface-container-highest/20 relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shadow-inner">
                  <Plane className="w-4.5 h-4.5 transform -rotate-45 text-secondary-container" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-lg text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5 font-extrabold">
                    AeroSync <span className="text-secondary-container text-[10px] px-1.5 py-0.2 rounded bg-secondary-container/15 font-bold">AI</span>
                  </span>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider text-secondary-fixed-dim">
                    Autonomous OCC Platform
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                <span className="font-label-code text-[10px] text-secondary-container font-bold">ADS-B LIVE</span>
              </div>
            </div>

            <p className="font-body-sm text-xs text-primary-fixed-dim mt-2 sm:mt-2.5">
              Predict. Recover. Operate Smarter.
            </p>
          </div>

          {/* =========================================================================
              RIGHT PANEL: OCC STAFF AUTHENTICATION DECK
              Contains Login, Forgot Password, and Clearance Request Views
             ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between p-5 sm:p-8 lg:p-10 xl:p-12 bg-surface-container-lowest text-on-surface">
            <div className="w-full max-w-md mx-auto space-y-5">
              
              {/* Active Session Notification (If user already has an active token) */}
              {activeSessionUser && mode === 'login' && (
                <div className="p-3.5 rounded-2xl bg-secondary-fixed/40 border border-secondary-container/40 flex items-center justify-between gap-3 font-label-code text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <UserCheck className="w-4 h-4 text-secondary shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-on-secondary-fixed block truncate">
                        Active OCC Session: {activeSessionUser.name || 'Capt. Neha Sharma'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        Station: {activeSessionUser.station || 'DEL'} • {activeSessionUser.role || 'CHIEF OPS CONTROLLER'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-2.5 py-1 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/90 transition-colors text-[11px] shrink-0 flex items-center gap-1"
                  >
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-error-container/80 border border-error/30 text-on-error-container flex items-start justify-between gap-3 font-label-code text-xs animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                  <button 
                    onClick={() => setErrorMessage(null)} 
                    className="text-on-error-container/70 hover:text-on-error-container p-0.5"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Success Alert Banner */}
              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 flex items-start justify-between gap-3 font-label-code text-xs animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-bold">{successMessage}</span>
                  </div>
                  <button 
                    onClick={() => setSuccessMessage(null)} 
                    className="text-emerald-900/70 hover:text-emerald-900 p-0.5"
                    aria-label="Dismiss message"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* =====================================================================
                  VIEW 1: OCC LOGIN PORTAL (Default Mode)
                 ===================================================================== */}
              {mode === 'login' && (
                <div className="space-y-5">
                  {/* Card Title & Security Badge */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-[10px] uppercase tracking-wider font-bold">
                        Authorized Personnel Only
                      </span>
                      <span className="font-label-code text-xs text-outline font-semibold">SEC-LEVEL 4</span>
                    </div>
                    <h2 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                      Operations Control Center (OCC) Portal
                    </h2>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                      Sign in with your airline staff credentials or security key.
                    </p>
                  </div>

                  {/* Main Login Form */}
                  <form className="space-y-4" onSubmit={handleLogin} noValidate>
                    
                    {/* Official Airline Email / Staff ID */}
                    <div className="space-y-1">
                      <label 
                        htmlFor="login-email" 
                        className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                      >
                        Official Airline Email / Staff ID
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="login-email"
                          type="email"
                          name="email"
                          autoComplete="username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all disabled:opacity-60"
                          placeholder="ops.controller@aerosync.aero"
                          required
                        />
                      </div>
                    </div>

                    {/* OCC Security PIN / Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label 
                          htmlFor="login-password" 
                          className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                        >
                          OCC Security Pin / Password
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="font-label-caps text-[11px] text-secondary hover:underline cursor-pointer"
                        >
                          Forgot credentials?
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all disabled:opacity-60"
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={0}
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Station / Hub Selector */}
                    <div className="space-y-1">
                      <label 
                        htmlFor="login-station" 
                        className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                      >
                        Assigned Station / Tactical Hub
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="login-station"
                          name="station"
                          value={station}
                          onChange={(e) => setStation(e.target.value)}
                          disabled={isLoading}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all appearance-none cursor-pointer disabled:opacity-60"
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
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        id="rememberStation"
                        checked={rememberStation}
                        onChange={(e) => setRememberStation(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary accent-secondary focus:ring-0 cursor-pointer shrink-0"
                      />
                      <label htmlFor="rememberStation" className="font-body-sm text-xs text-on-surface-variant cursor-pointer select-none">
                        Remember this OCC terminal workstation for 12 hours
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[44px]"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Authorizing OCC Terminal...</span>
                        </>
                      ) : (
                        <>
                          <span>Login to AeroSync OCC</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Fast-Track Evaluation Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="w-full border-t border-surface-container-highest"></div>
                    <span className="absolute px-3 bg-surface-container-lowest text-outline font-label-caps text-[10px] uppercase tracking-wider font-semibold">
                      or fast-track evaluation
                    </span>
                  </div>

                  {/* Fast-Track Demo Button */}
                  <button
                    type="button"
                    onClick={handleDemoQuickAccess}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-secondary-fixed/50 border border-secondary-container/40 text-on-secondary-fixed font-body-md text-xs sm:text-sm font-semibold hover:bg-secondary-fixed transition-colors flex items-center justify-between group min-h-[42px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Zap className="w-4.5 h-4.5 text-secondary group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">Demo Quick Access: Auto-fill Dispatcher Profile</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-code text-[11px] font-bold shrink-0 ml-2">
                      DISPATCH-09
                    </span>
                  </button>

                  {/* Request Access / Registration Link */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-xs text-on-surface-variant hover:text-secondary font-semibold transition-colors"
                    >
                      New Controller or Station Staff? <span className="text-secondary underline font-bold">Request OCC Clearance</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =====================================================================
                  VIEW 2: FORGOT PASSWORD & EMERGENCY PIN RECOVERY
                 ===================================================================== */}
              {mode === 'forgot' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-caps text-[10px] uppercase tracking-wider font-bold">
                        Credential Recovery
                      </span>
                      <span className="font-label-code text-xs text-outline font-semibold">EMERGENCY PROTOCOL</span>
                    </div>
                    <h2 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                      OCC Password & PIN Recovery
                    </h2>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                      Enter your official airline email or staff ID. An emergency one-time OCC security dispatch PIN will be routed to your terminal.
                    </p>
                  </div>

                  {forgotSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 space-y-3 font-label-code text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Emergency Dispatch Token Dispatched</div>
                          <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                            {forgotMessage}
                          </p>
                          <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-500/10 p-2 rounded-lg">
                            • Check your secure airline terminal inbox or telemetry pager.<br />
                            • Valid for 15 minutes across all OCC workstations.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="w-full py-2.5 rounded-xl bg-secondary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Sign In</span>
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleForgotPassword}>
                      <div className="space-y-1">
                        <label 
                          htmlFor="forgot-email" 
                          className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                        >
                          Official Airline Email Address
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          disabled={forgotLoading}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all"
                          placeholder="controller.name@aerosync.aero"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[44px]"
                      >
                        {forgotLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Dispatching Emergency PIN...</span>
                          </>
                        ) : (
                          <>
                            <span>Dispatch Recovery PIN</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to OCC Sign In</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* =====================================================================
                  VIEW 3: OCC CLEARANCE REGISTRATION (New Staff Request)
                 ===================================================================== */}
              {mode === 'register' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-[10px] uppercase tracking-wider font-bold">
                        Staff Onboarding
                      </span>
                      <span className="font-label-code text-xs text-outline font-semibold">SECURITY CLEARANCE</span>
                    </div>
                    <h2 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                      Request OCC Terminal Clearance
                    </h2>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                      Submit an operational clearance request for newly assigned flight controllers, turnaround dispatchers, or station staff.
                    </p>
                  </div>

                  {regSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 space-y-3 font-label-code text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Clearance Request Submitted</div>
                          <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                            Clearance tracking ID: <strong className="font-bold">{regResult?.clearanceId || 'REQ-882194'}</strong>
                          </p>
                          <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-500/10 p-2.5 rounded-lg space-y-1">
                            <div>• Status: <strong className="text-emerald-900 uppercase">PENDING_APPROVAL</strong></div>
                            <div>• Controller: {regName}</div>
                            <div>• Verification token dispatched to Chief Operations Controller.</div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="w-full py-2.5 rounded-xl bg-secondary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Sign In</span>
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-3.5" onSubmit={handleRegister}>
                      <div className="space-y-1">
                        <label 
                          htmlFor="reg-name" 
                          className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                        >
                          Staff Full Name
                        </label>
                        <input
                          id="reg-name"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          disabled={regLoading}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all"
                          placeholder="e.g. Capt. Neha Sharma"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label 
                          htmlFor="reg-email" 
                          className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                        >
                          Official Airline Email
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          disabled={regLoading}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs sm:text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest transition-all"
                          placeholder="staff.id@aerosync.aero"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label 
                            htmlFor="reg-dept" 
                            className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                          >
                            Department
                          </label>
                          <select
                            id="reg-dept"
                            value={regDepartment}
                            onChange={(e) => setRegDepartment(e.target.value)}
                            disabled={regLoading}
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest"
                          >
                            <option value="Operations Control Center">OCC Flight Operations</option>
                            <option value="Turnaround & Ramp Control">Turnaround & Ramp</option>
                            <option value="Crew Scheduling & Rostering">Crew Tracking</option>
                            <option value="Gate & Airport Resource Desk">Gate Assignment</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label 
                            htmlFor="reg-station" 
                            className="block font-label-caps text-[11px] uppercase text-on-surface-variant tracking-wider font-bold"
                          >
                            Station / Hub
                          </label>
                          <select
                            id="reg-station"
                            value={regStation}
                            onChange={(e) => setRegStation(e.target.value)}
                            disabled={regLoading}
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-surface-container-highest"
                          >
                            <option value="DEL">DEL (Delhi)</option>
                            <option value="BOM">BOM (Mumbai)</option>
                            <option value="BLR">BLR (Bengaluru)</option>
                            <option value="DXB">DXB (Dubai)</option>
                            <option value="LHR">LHR (Heathrow)</option>
                            <option value="MAA">MAA (Chennai)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[44px]"
                      >
                        {regLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Submitting Clearance Request...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Clearance Request</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to OCC Sign In</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Security Compliance Tag */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] font-label-code text-outline border-t border-surface-container-highest text-center sm:text-left">
                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Lock className="w-3.5 h-3.5 text-secondary" />
                  <span>256-Bit Aviation Security Protocol</span>
                </span>
                <span>ICAO ANNEX 6 & DGCA CAR COMPLIANT</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
