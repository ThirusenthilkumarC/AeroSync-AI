const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PassengerBookingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Clean imports
const oldImports = `import { 
  Plane, Search, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  Ticket, User, Mail, Phone, ShieldCheck, Download, RefreshCw, Printer, 
  MapPin, Clock, Calendar, Check, X, Shield, Sparkles
} from 'lucide-react';`;

const newImports = `import { 
  Plane, Search, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  Ticket, RefreshCw, Printer, X
} from 'lucide-react';`;

content = content.replace(oldImports, newImports);

// 2. Fix handleSelectFlight hoisting and unused error parameter
content = content.replace("const [isLoadingFlights, setIsLoadingFlights] = useState(false);", "const [, setIsLoadingFlights] = useState(false);");
content = content.replace("} catch (err) {", "} catch {");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned up PassengerBookingPage.jsx');
