const fs = require('fs');
const path = require('path');

const crewPagePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'CrewManagementPage.jsx');
let content = fs.readFileSync(crewPagePath, 'utf8');

if (!content.includes('useNavigate')) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
  content = content.replace(
    "export default function CrewManagementPage({ selectedAirline }) {",
    "export default function CrewManagementPage({ selectedAirline }) {\n  const navigate = useNavigate();"
  );
}

content = content.replace(
  /<button className="px-3 py-1\.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors">\s*View Seat Map\s*<\/button>/,
  `<div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDrawerFlightId(flight.id); }}
                        className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs hover:bg-primary transition-colors whitespace-nowrap"
                      >
                        Seat Map
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate('/booking?flightId=' + flight.id); }}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-colors whitespace-nowrap"
                      >
                        Book Ticket
                      </button>
                    </div>`
);

fs.writeFileSync(crewPagePath, content, 'utf8');
console.log('CrewManagementPage.jsx successfully updated with Book Ticket action.');
