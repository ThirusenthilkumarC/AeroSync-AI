const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'LoginPage.jsx');
let content = fs.readFileSync(loginPath, 'utf8');

// Replace import statement
const oldImports = `import { 
  Plane, Radar, Network, Route, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, 
  BadgeCheck, Building2, Zap, Radio, CheckCircle2, AlertTriangle, RefreshCw, 
  UserCheck, X, ShieldAlert, Sparkles
} from 'lucide-react';`;

const newImports = `import { 
  Plane, Radar, Network, Route, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, 
  BadgeCheck, Zap, Radio, CheckCircle2, AlertTriangle, RefreshCw, 
  UserCheck, X
} from 'lucide-react';`;

content = content.replace(oldImports, newImports);

// Replace state and effect
const oldStateEffect = `  const [activeSessionUser, setActiveSessionUser] = useState(null);

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

  // Check for existing authenticated session
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      setActiveSessionUser(user);
    }
  }, []);`;

const newStateEffect = `  const [activeSessionUser] = useState(() => {
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
  const [regResult, setRegResult] = useState(null);`;

content = content.replace(oldStateEffect, newStateEffect);

fs.writeFileSync(loginPath, content, 'utf8');
console.log('Cleaned up LoginPage.jsx imports and state initialization.');
