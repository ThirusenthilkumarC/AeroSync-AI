const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'layouts', 'AppShell.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add LogOut to lucide-react imports if not present
if (!content.includes('LogOut')) {
  content = content.replace(
    /import \{\s*([\s\S]*?)\s*\} from 'lucide-react';/,
    (match, p1) => `import {\n  ${p1.trim()},\n  LogOut\n} from 'lucide-react';`
  );
}

// 2. Add logoutUser and getStoredUser import from api.js if not present
if (!content.includes('logoutUser')) {
  content = content.replace(
    "import AICopilotPanel from '../copilot/AICopilotPanel';",
    "import AICopilotPanel from '../copilot/AICopilotPanel';\nimport { logoutUser, getStoredUser } from '../../services/api';"
  );
}

// 3. Add handleLogout function inside AppShell component
const handleLogoutCode = `  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };`;

if (!content.includes('const handleLogout = () =>')) {
  content = content.replace(
    "const currentAirlineObj = airlinesList.find(a => a.id === selectedAirline) || airlinesList[0];",
    `const currentAirlineObj = airlinesList.find(a => a.id === selectedAirline) || airlinesList[0];\n\n${handleLogoutCode}`
  );
}

// 4. Update the RIGHT ZONE to add User Profile & Logout button
const targetHeaderRight = `            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
              title="System Alerts & Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
            </button>

          </div>`;

const replacementHeaderRight = `            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
              title="System Alerts & Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
            </button>

            {/* Authenticated OCC Controller Profile & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-surface-container-highest shrink-0">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none"
                title={\`Authenticated OCC Controller: \${currentUser?.name || 'Capt. Neha Sharma'}\`}
              >
                <div className="w-8 h-8 rounded-xl bg-secondary-fixed/60 text-on-secondary-fixed flex items-center justify-center font-bold font-data-display text-xs border border-secondary/20 shadow-sm shrink-0">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NS'}
                </div>
                <div className="hidden 2xl:flex flex-col">
                  <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[120px]">
                    {currentUser?.name || 'Capt. Neha Sharma'}
                  </span>
                  <span className="text-[9px] font-label-caps text-on-surface-variant uppercase font-semibold">
                    {currentUser?.role || 'CHIEF OPS CONTROLLER'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:bg-error-container/60 hover:text-on-error-container transition-colors shrink-0"
                title="Log out of AeroSync OCC"
                aria-label="Log out of OCC"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>`;

if (content.includes('{/* Notifications Bell */}')) {
  content = content.replace(targetHeaderRight, replacementHeaderRight);
}

// 5. Update mobile drawer bottom to include profile & logout
const targetDrawerBottom = `            {/* Drawer Bottom Metadata */}
            <div className="pt-4 border-t border-surface-container-highest text-[11px] text-on-surface-variant font-label-code space-y-1">
              <div>Airline: <strong className="text-on-surface">{selectedAirline}</strong></div>
              <div>System Integrity: <strong className="text-emerald-600">99.4%</strong></div>
            </div>`;

const replacementDrawerBottom = `            {/* Drawer Bottom Metadata & Logout */}
            <div className="pt-4 border-t border-surface-container-highest text-[11px] text-on-surface-variant font-label-code space-y-3">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest">
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold font-data-display text-xs shrink-0">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NS'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-on-surface truncate">
                    {currentUser?.name || 'Capt. Neha Sharma'}
                  </span>
                  <span className="text-[9px] font-label-caps text-on-surface-variant uppercase truncate">
                    {currentUser?.role || 'CHIEF OPS CONTROLLER'} • {currentUser?.station || 'DEL'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div>Airline: <strong className="text-on-surface">{selectedAirline}</strong></div>
                <div>System Integrity: <strong className="text-emerald-600">99.4%</strong></div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-error-container/50 hover:bg-error-container text-on-error-container font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-error/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of AeroSync OCC</span>
              </button>
            </div>`;

if (content.includes('{/* Drawer Bottom Metadata */}')) {
  content = content.replace(targetDrawerBottom, replacementDrawerBottom);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('AppShell.jsx successfully updated with user profile and logout.');
