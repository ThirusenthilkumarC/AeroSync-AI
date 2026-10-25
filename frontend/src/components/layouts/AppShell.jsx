import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, AlertTriangle, 
  Activity, RefreshCw, Plane, Users, Building2, UserCheck, PlayCircle, Eye, Cpu,
  Radio
} from 'lucide-react';
import { airlinesList } from '../../data/airlines';
import { isRouteActive } from '../../utils/routeUtils';
import AICopilotPanel from '../copilot/AICopilotPanel';

export default function AppShell({ children, selectedAirline, setSelectedAirline }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header and chrome on login page
  const isLoginPage = location.pathname === '/login';

  const currentAirlineObj = airlinesList.find(a => a.id === selectedAirline) || airlinesList[0];

  // The 7 primary navigation items aligned in the center of the top navigation bar
  const primaryNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Disruption Center', path: '/disruptions', icon: AlertTriangle, badge: '1' },
    { label: 'Recovery Plan', path: '/recovery', icon: RefreshCw, badge: 'V2' },
    { label: 'Sandbox', path: '/recovery-sandbox', icon: Cpu },
    { label: 'Flights', path: '/flights', icon: Plane },
    { label: 'Crew', path: '/crew', icon: Users },
    { label: 'Gates & Aircraft', path: '/resources', icon: Building2 },
  ];

  // Extended navigation items for mobile drawer
  const mobileDrawerNavItems = [
    ...primaryNavItems,
    { label: 'Passenger Impact', path: '/passenger-impact', icon: UserCheck },
    { label: 'Passenger View', path: '/passenger-view', icon: Eye },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { label: 'Decision Replay', path: '/decision-replay', icon: PlayCircle }
  ];

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased overflow-x-hidden">
      
      {/* =========================================================================
          TOP NAVIGATION BAR (Primary Navigation System)
         ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-highest shadow-[0_1px_8px_rgba(0,0,0,0.03)] h-16">
        <div className="h-full w-full max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* LEFT ZONE: Logo & Live Telemetry Indicator */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Mobile / Tablet Drawer Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-on-surface" />
            </button>

            {/* Brand Logo & Title */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
              title="AeroSync AI Mission Control"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Plane className="w-4.5 h-4.5 transform -rotate-45 text-secondary-container" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-sm sm:text-base font-extrabold tracking-tight text-on-surface leading-tight flex items-center gap-1.5">
                  AeroSync <span className="text-secondary font-bold text-[10px] tracking-wider uppercase px-1.5 py-0.2 rounded bg-secondary/10">AI</span>
                </span>
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-semibold leading-tight hidden sm:inline">
                  Mission Control
                </span>
              </div>
            </div>

            {/* Live Telemetry Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container-low border border-surface-container-highest font-label-code text-[11px] shadow-sm shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-on-surface">AIR-OPT OCC</span>
              <span className="text-emerald-600 font-extrabold text-[10px] tracking-wider hidden md:inline">● LIVE</span>
            </div>
          </div>

          {/* CENTER ZONE: Primary 7 Navigation Items (Single Row, Centered, Vertically Aligned) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 2xl:gap-2 flex-1 max-w-fit mx-auto">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(location.pathname, item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold font-body-md transition-all duration-150 whitespace-nowrap h-9 ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-bold shadow-sm ring-1 ring-primary/40'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {/* Glowing Bottom Line Active Indicator */}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-2.5 right-2.5 h-0.5 rounded-full bg-secondary-container shadow-[0_0_8px_#5bb8fe]"></span>
                  )}

                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-secondary-container' : 'text-on-surface-variant group-hover:text-on-surface'
                  }`} />

                  <span className="tracking-tight">{item.label}</span>

                  {/* Notification Badge */}
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                      item.badge === '1' || item.badge === '3' 
                        ? 'bg-error text-on-error animate-pulse' 
                        : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT ZONE: ADS-B Status Indicator, Airline Selector, Notifications Bell */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            
            {/* ADS-B LIVE Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-highest font-label-code text-[11px] text-on-surface-variant shadow-sm shrink-0">
              <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span className="font-bold text-on-surface hidden sm:inline">ADS-B LIVE</span>
            </div>

            {/* Airline Selector Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low px-2 sm:px-3 py-1.5 rounded-xl border border-surface-container-highest shadow-sm shrink-0">
              <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant hidden xl:inline">Airline:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-secondary text-white font-bold font-data-display text-[10px] flex items-center justify-center shrink-0">
                  {currentAirlineObj.badge}
                </span>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="bg-transparent font-label-code text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1 max-w-[90px] sm:max-w-[130px] md:max-w-none truncate"
                  title="Select Airline to Monitor"
                >
                  {airlinesList.map((al) => (
                    <option key={al.id} value={al.id}>
                      {al.name} ({al.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
              title="System Alerts & Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
            </button>

          </div>

        </div>
      </header>

      {/* =========================================================================
          MOBILE / TABLET SLIDE-OUT NAVIGATION DRAWER
         ========================================================================= */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200" 
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div 
            className="w-72 max-w-[85vw] h-full bg-surface-container-lowest p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header with Close Button */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container-highest">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-sm">
                    <Plane className="w-4.5 h-4.5 transform -rotate-45 text-secondary-container" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-on-surface font-headline-md block">
                      AeroSync <span className="text-secondary font-bold text-xs uppercase px-1 rounded bg-secondary/10">AI</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-label-caps uppercase">Navigation</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <nav className="flex flex-col gap-1">
                {mobileDrawerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(location.pathname, item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2.5 rounded-xl font-body-md text-xs font-semibold flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-primary-container text-on-primary font-bold shadow-sm ring-1 ring-primary/40'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-secondary-container' : 'text-on-surface-variant'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badge === '1' || item.badge === '3' 
                            ? 'bg-error text-on-error animate-pulse' 
                            : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Metadata */}
            <div className="pt-4 border-t border-surface-container-highest text-[11px] text-on-surface-variant font-label-code space-y-1">
              <div>Airline: <strong className="text-on-surface">{selectedAirline}</strong></div>
              <div>System Integrity: <strong className="text-emerald-600">99.4%</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN CONTENT AREA (Single navigation system, full width, clean spacing)
         ========================================================================= */}
      <main className="w-full pt-16 pb-10 bg-surface min-h-[calc(100vh-4rem)] flex flex-col">
        {children}
      </main>

      {/* =========================================================================
          AIR-OPT AI COPILOT OPERATIONAL DECISION SUPPORT
         ========================================================================= */}
      <AICopilotPanel selectedAirline={selectedAirline} />

    </div>
  );
}
