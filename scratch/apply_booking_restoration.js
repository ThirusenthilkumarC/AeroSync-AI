const fs = require('fs');
const path = require('path');

// 1. Update frontend/src/App.jsx
const appPath = path.join(__dirname, '..', 'frontend', 'src', 'App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

if (!appContent.includes('PassengerBookingPage')) {
  appContent = appContent.replace(
    "import PassengerViewPage from './pages/PassengerViewPage';",
    "import PassengerViewPage from './pages/PassengerViewPage';\nimport PassengerBookingPage from './pages/PassengerBookingPage';"
  );
  appContent = appContent.replace(
    "<Route path=\"/passenger-view\" element={<PassengerViewPage selectedAirline={selectedAirline} />} />",
    `<Route path="/passenger-view" element={<PassengerViewPage selectedAirline={selectedAirline} />} />\n          <Route path="/booking" element={<PassengerBookingPage selectedAirline={selectedAirline} />} />\n          <Route path="/passenger-booking" element={<Navigate to="/booking" replace />} />\n          <Route path="/ticket-booking" element={<Navigate to="/booking" replace />} />`
  );
  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log('App.jsx updated with /booking routes.');
}

// 2. Update frontend/src/components/layouts/AppShell.jsx
const appShellPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'layouts', 'AppShell.jsx');
let shellContent = fs.readFileSync(appShellPath, 'utf8');

// Add Ticket to lucide-react imports if missing
if (!shellContent.includes('Ticket')) {
  shellContent = shellContent.replace(
    /import \{\s*([\s\S]*?)\s*\} from 'lucide-react';/,
    (match, p1) => `import {\n  ${p1.trim()},\n  Ticket\n} from 'lucide-react';`
  );
}

// Add Ticket Booking to primaryNavItems
const targetPrimaryNav = `    { label: 'Gates & Aircraft', path: '/resources', icon: Building2 },
  ];`;
const replacementPrimaryNav = `    { label: 'Gates & Aircraft', path: '/resources', icon: Building2 },
    { label: 'Ticket Booking', path: '/booking', icon: Ticket, badge: 'SEATS' },
  ];`;

if (shellContent.includes("path: '/resources', icon: Building2 },\n  ];")) {
  shellContent = shellContent.replace("path: '/resources', icon: Building2 },\n  ];", "path: '/resources', icon: Building2 },\n    { label: 'Ticket Booking', path: '/booking', icon: Ticket, badge: 'SEATS' },\n  ];");
}

fs.writeFileSync(appShellPath, shellContent, 'utf8');
console.log('AppShell.jsx updated with Ticket Booking navigation item.');

// 3. Update frontend/src/components/crew/FlightSeatMapDrawer.jsx
const drawerPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'crew', 'FlightSeatMapDrawer.jsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

if (!drawerContent.includes('useNavigate')) {
  drawerContent = drawerContent.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
  drawerContent = drawerContent.replace(
    "export default function FlightSeatMapDrawer({ flightId, onClose }) {",
    "export default function FlightSeatMapDrawer({ flightId, onClose }) {\n  const navigate = useNavigate();"
  );
}

// Add booking button in selected seat callout
const oldCallout = `<button onClick={() => setSelectedSeat(null)} className="text-primary-fixed-dim hover:text-white">
                  Dismiss
                </button>`;

const newCallout = `<div className="flex items-center gap-2">
                  {selectedSeat.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate(\`/booking?flightId=\${flightData.id || flightId}&seat=\${selectedSeat.seatNumber}\`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/90 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Book Seat \${selectedSeat.seatNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setSelectedSeat(null)} className="text-primary-fixed-dim hover:text-white text-xs px-2 py-1">
                    Dismiss
                  </button>
                </div>`;

if (drawerContent.includes(oldCallout)) {
  drawerContent = drawerContent.replace(oldCallout, newCallout);
  fs.writeFileSync(drawerPath, drawerContent, 'utf8');
  console.log('FlightSeatMapDrawer.jsx updated with Book Seat action button.');
}

// 4. Update frontend/src/pages/PassengerViewPage.jsx
const paxViewPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PassengerViewPage.jsx');
let paxViewContent = fs.readFileSync(paxViewPath, 'utf8');

if (!paxViewContent.includes('useNavigate') || !paxViewContent.includes('useSearchParams')) {
  paxViewContent = paxViewContent.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate, useSearchParams } from 'react-router-dom';"
  );
  paxViewContent = paxViewContent.replace(
    "export default function PassengerViewPage() {",
    "export default function PassengerViewPage() {\n  const navigate = useNavigate();\n  const [searchParams] = useSearchParams();"
  );
}

if (!paxViewContent.includes('searchParams.get')) {
  const oldState = "const [pnrInput, setPnrInput] = useState('AS-89412');";
  const newState = `const [pnrInput, setPnrInput] = useState(() => searchParams.get('pnr') || 'AS-89412');

  useEffect(() => {
    const queryPnr = searchParams.get('pnr');
    if (queryPnr) {
      setPnrInput(queryPnr);
      const found = passengersData.find(
        p => p.pnr.toLowerCase() === queryPnr.trim().toLowerCase()
      );
      if (found) setActivePax(found);
    }
  }, [searchParams]);`;
  paxViewContent = paxViewContent.replace(oldState, newState);
}

// Add quick booking link banner above main content
const searchBoxTarget = `{/* PNR Lookup Box */}`;
const bookingBanner = `{/* Direct Ticket Booking Quick Access Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/90 border border-cyan-500/30 text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              ✈
            </div>
            <div>
              <span className="text-white font-bold block">Need to book a flight ticket or select seats?</span>
              <span className="text-slate-400 text-[11px]">Instant seat reservation & electronic boarding pass generation.</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/booking')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Book Flight Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PNR Lookup Box */}`;

if (paxViewContent.includes(searchBoxTarget) && !paxViewContent.includes('Need to book a flight ticket')) {
  paxViewContent = paxViewContent.replace(searchBoxTarget, bookingBanner);
  fs.writeFileSync(paxViewPath, paxViewContent, 'utf8');
  console.log('PassengerViewPage.jsx updated with auto-PNR query loading and booking banner.');
}

// 5. Update frontend/src/pages/CrewManagementPage.jsx
const crewPagePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'CrewManagementPage.jsx');
let crewContent = fs.readFileSync(crewPagePath, 'utf8');

if (!crewContent.includes('useNavigate')) {
  crewContent = crewContent.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
  crewContent = crewContent.replace(
    "export default function CrewManagementPage({ selectedAirline }) {",
    "export default function CrewManagementPage({ selectedAirline }) {\n  const navigate = useNavigate();"
  );
}

// Add Book Flight button in available flights table
const targetAvailableRow = `<button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors">
                      View Seat Map
                    </button>`;

const replacementAvailableRow = `<div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedDrawerFlightId(flight.id); }}
                        className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors whitespace-nowrap"
                      >
                        Seat Map
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/booking?flightId=' + flight.id); }}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-colors whitespace-nowrap"
                      >
                        Book Ticket
                      </button>
                    </div>`;

if (crewContent.includes(targetAvailableRow)) {
  crewContent = crewContent.replace(targetAvailableRow, replacementAvailableRow);
  fs.writeFileSync(crewPagePath, crewContent, 'utf8');
  console.log('CrewManagementPage.jsx updated with direct Book Ticket action.');
}
