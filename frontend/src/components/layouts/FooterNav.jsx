import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, AlertTriangle, RefreshCw, Cpu, Plane, Users, Building2, Radio
} from 'lucide-react';

export default function FooterNav({ selectedAirline }) {
  const location = useLocation();

  // Footer navigation items in exact required order & labels
  const footerNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Disruption Center', path: '/disruptions', icon: AlertTriangle, badge: 'LIVE' },
    { label: 'Recovery Plan', path: '/recovery', icon: RefreshCw },
    { label: 'Sandbox', path: '/recovery-sandbox', icon: Cpu },
    { label: 'Flights', path: '/flights', icon: Plane },
    { label: 'Crew', path: '/crew', icon: Users },
    { label: 'Gates & Aircraft', path: '/resources', icon: Building2 }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-surface-container-highest/90 shadow-[0_-4px_24px_rgba(0,0,0,0.18)]">
      <div className="w-full max-w-[1750px] mx-auto px-2 sm:px-4 lg:px-8 py-2 min-h-[3.5rem] flex flex-wrap md:flex-nowrap items-center justify-between gap-2 lg:gap-4">
        
        {/* Left Side: AIR-OPT OCC Status Badge (Desktop/Laptop) */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 font-label-code text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-container-low border border-surface-container-highest shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-on-surface">AIR-OPT OCC</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-semibold">● Live Telemetry</span>
          </div>
        </div>

        {/* Center: All 7 Navigation Items Guaranteed Visible */}
        <nav className="w-full md:w-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-1 sm:gap-1.5 lg:gap-2.5 py-0.5">
          {footerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) => {
                  const active = linkActive || isActive;
                  return `group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl text-xs lg:text-sm font-label-code font-bold transition-all duration-150 whitespace-nowrap active:scale-95 shrink-0 ${
                    active
                      ? 'bg-primary-container text-on-primary shadow-sm ring-1 ring-primary/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/80 border border-transparent'
                  }`;
                }}
              >
                {({ isActive: linkActive }) => {
                  const active = linkActive || isActive;
                  return (
                    <>
                      {/* Active Indicator Top Glow Line */}
                      {active && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-secondary shadow-[0_0_8px_#38bdf8]"></span>
                      )}

                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${
                        active ? 'text-secondary-container' : 'text-on-surface-variant group-hover:text-on-surface'
                      }`} />

                      <span className="tracking-tight">{item.label}</span>

                      {/* Live Badge */}
                      {item.badge && !active && (
                        <span className="px-1.5 py-0.2 rounded bg-error/90 text-on-error text-[9px] font-bold tracking-wider animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Side: System Telemetry (Desktop/Laptop) */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 font-label-code text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-low border border-surface-container-highest shadow-sm">
            <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span>ADS-B: Nominal</span>
          </span>
        </div>

      </div>
    </footer>
  );
}
