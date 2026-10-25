import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, AlertTriangle, 
  Activity, RefreshCw, Plane, Users, Building2, UserCheck, PlayCircle, Eye, Cpu,
  ChevronLeft, ChevronRight, Radio
} from 'lucide-react';
import { airlinesList } from '../../data/airlines';
import { isRouteActive } from '../../utils/routeUtils';
import FooterNav from './FooterNav';
import AICopilotPanel from '../copilot/AICopilotPanel';

export default function AppShell({ children, autoReplanEnabled, setAutoReplanEnabled, selectedAirline, setSelectedAirline }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('aerosync_sidebar_collapsed') === 'true';
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Hide header and chrome on login page
  const isLoginPage = location.pathname === '/login';

  const currentAirlineObj = airlinesList.find(a => a.id === selectedAirline) || airlinesList[0];

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Disruption Center', path: '/disruptions', icon: AlertTriangle, badge: '1' },
    { label: 'Recovery Plan', path: '/recovery', icon: RefreshCw, badge: 'V2' },
    { label: 'What-If Sandbox', path: '/recovery-sandbox', icon: Cpu },
    { label: 'Flights', path: '/flights', icon: Plane },
    { label: 'Crew', path: '/crew', icon: Users },
    { label: 'Gates & Aircraft', path: '/resources', icon: Building2 },
    { label: 'Passenger Impact', path: '/passenger-impact', icon: UserCheck },
    { label: 'Passenger View', path: '/passenger-view', icon: Eye },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { label: 'Decision Replay', path: '/decision-replay', icon: PlayCircle }
  ];

  // Derive current page title from active route
  const getCurrentPageTitle = () => {
    const found = navItems.find(item => isRouteActive(location.pathname, item.path));
    return found ? found.label : 'Mission Control';
  };

  // Toggle desktop sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('aerosync_sidebar_collapsed', String(next));
      return next;
    });
  };

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
          1. PERSISTENT LEFT SIDEBAR (Desktop & Laptop - lg: screens and up)
         ========================================================================= */}
      <aside 
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-r border-surface-container-highest shadow-[2px_0_12px_rgba(0,0,0,0.03)] flex-col justify-between transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-surface-container-highest/80">
            <div 
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-3 cursor-pointer group overflow-hidden ${sidebarCollapsed ? 'justify-center w-full' : ''}`}
              title="AeroSync Mission Control"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Plane className="w-5 h-5 transform -rotate-45 text-secondary-container" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col whitespace-nowrap overflow-hidden">
                  <span className="font-headline-md text-base font-extrabold tracking-tight text-on-surface">
                    AeroSync <span className="text-secondary font-bold text-xs uppercase px-1.5 py-0.2 rounded bg-secondary/10">AI</span>
                  </span>
                  <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-semibold">
                    Mission Control
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(location.pathname, item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-body-md transition-all duration-150 ${
                    sidebarCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-bold shadow-sm ring-1 ring-primary/40'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {/* Active Indicator Left Glow Line */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-secondary-container shadow-[0_0_8px_#5bb8fe]"></span>
                  )}

                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-secondary-container' : 'text-on-surface-variant group-hover:text-on-surface'
                  }`} />

                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Notification Badge */}
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                      sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                    } ${
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

        {/* Bottom Sidebar Status & Collapse Control */}
        <div className="p-3 border-t border-surface-container-highest/80 space-y-2">
          {/* Monitored Airline Status Pill */}
          {!sidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest text-xs font-label-code space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-on-surface-variant font-medium">Telemetry Stream</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE
                </span>
              </div>
              <div className="font-bold text-on-surface truncate flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-secondary text-white font-bold text-[9px] flex items-center justify-center">
                  {currentAirlineObj.badge}
                </span>
                <span>{selectedAirline}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`Monitored: ${selectedAirline}`}>
              <span className="w-7 h-7 rounded-lg bg-secondary text-white font-bold text-[10px] flex items-center justify-center">
                {currentAirlineObj.badge}
              </span>
            </div>
          )}

          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-semibold"
            title={sidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            aria-label={sidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4.5 h-4.5 text-on-surface" />
            ) : (
              <>
                <ChevronLeft className="w-4.5 h-4.5" />
                <span className="text-[11px] font-label-code">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. TOP HEADER (Responsive: Mobile Compact / Desktop Placed Beside Sidebar)
         ========================================================================= */}
      <header 
        className={`fixed top-0 right-0 z-30 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest shadow-[0_1px_6px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
        } left-0`}
      >
        <div className="h-16 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left Side: Mobile Hamburger & Page Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Hamburger Button (Mobile / Tablet only) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-on-surface" />
            </button>

            {/* Mobile Branding / Page Title */}
            <div className="flex items-center gap-2">
              <div className="lg:hidden w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-secondary-container shadow-sm shrink-0">
                <Plane className="w-4 h-4 transform -rotate-45 text-secondary-container" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-headline-md text-sm sm:text-base font-extrabold tracking-tight text-on-surface line-clamp-1">
                  {getCurrentPageTitle()}
                </h1>
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider hidden sm:inline">
                  AeroSync OCC • Sector 04
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Airline Selector & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* AIRLINE SELECTOR DROPDOWN */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low px-2 sm:px-3 py-1.5 rounded-xl border border-surface-container-highest shadow-sm">
              <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant hidden md:inline">Airline:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md bg-secondary text-white font-bold font-data-display text-[9px] sm:text-[10px] flex items-center justify-center">
                  {currentAirlineObj.badge}
                </span>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="bg-transparent font-label-code text-[11px] sm:text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1 max-w-[90px] sm:max-w-[130px] md:max-w-none truncate"
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

            {/* Notifications Bell Button */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              title="System Alerts & Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
            </button>

            {/* ADS-B Live Telemetry Indicator (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container-low border border-surface-container-highest font-label-code text-[10px] text-on-surface-variant">
              <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>ADS-B LIVE</span>
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          3. SLIDE-OUT MOBILE NAVIGATION DRAWER (Mobile & Tablet)
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
                    <span className="text-[10px] text-on-surface-variant font-label-caps uppercase">Navigation Drawer</span>
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

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(location.pathname, item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-3 rounded-xl font-body-md text-xs font-semibold flex items-center justify-between transition-colors ${
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
          4. MAIN CONTENT AREA (Adaptive Left Padding on Desktop)
         ========================================================================= */}
      <main 
        className={`w-full pt-16 pb-20 md:pb-24 bg-surface min-h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {children}
      </main>

      {/* =========================================================================
          5. AIR-OPT AI COPILOT OPERATIONAL DECISION SUPPORT
         ========================================================================= */}
      <AICopilotPanel selectedAirline={selectedAirline} />

      {/* =========================================================================
          6. PERSISTENT FOOTER NAVIGATION BAR
         ========================================================================= */}
      <FooterNav selectedAirline={selectedAirline} />
    </div>
  );
}
