import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, AlertTriangle, 
  Activity, RefreshCw, Plane, Users, Building2, UserCheck, PlayCircle, Eye, Cpu 
} from 'lucide-react';
import { airlinesList } from '../../data/airlines';
import FooterNav from './FooterNav';
import AICopilotPanel from '../copilot/AICopilotPanel';

export default function AppShell({ children, autoReplanEnabled, setAutoReplanEnabled, selectedAirline, setSelectedAirline }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header on login page
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

  if (isLoginPage) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-highest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-18 w-full max-w-[1750px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-6 lg:gap-8">
          
          {/* Left Side: Logo & Airline Selector */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md group-hover:scale-105 transition-transform">
                <Plane className="w-5.5 h-5.5 transform -rotate-45 text-secondary-container" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-base font-extrabold tracking-tight text-on-surface">
                  AeroSync
                </span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                  Mission Control
                </span>
              </div>
            </div>

            {/* AIRLINE SELECTOR DROPDOWN */}
            <div className="flex items-center gap-2.5 bg-surface-container-low px-4 py-2 rounded-xl border border-surface-container-highest shrink-0 shadow-sm">
              <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant hidden sm:inline">Airline:</span>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-secondary text-white font-bold font-data-display text-[10px] flex items-center justify-center">
                  {currentAirlineObj.badge}
                </span>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="bg-transparent font-label-code text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
                >
                  {airlinesList.map((al) => (
                    <option key={al.id} value={al.id}>
                      {al.name} ({al.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Side: Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1.5 overflow-x-auto py-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl font-body-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                {item.label}
                {item.badge && (
                  <span className="flex h-4 min-w-[1rem] px-1.5 items-center justify-center rounded-full bg-error text-on-error text-[10px] font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-72 max-w-[80vw] h-full bg-surface-container-lowest p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container-highest">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-on-surface font-headline-md">AeroSync Navigation</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-surface-container">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl font-body-md text-body-md flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-primary-container text-on-primary font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-surface-container-highest text-xs text-on-surface-variant font-label-code">
              <div>Monitored Airline: {selectedAirline}</div>
              <div>System Integrity: 99.4%</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full pt-16 pb-20 md:pb-24 bg-surface min-h-[calc(100vh-4rem)] flex flex-col">
        {children}
      </main>

      {/* AIR-OPT AI Copilot Operational Decision Support Panel */}
      <AICopilotPanel selectedAirline={selectedAirline} />

      {/* Persistent Sticky/Fixed Enterprise Footer Navigation */}
      <FooterNav selectedAirline={selectedAirline} />
    </div>
  );
}
