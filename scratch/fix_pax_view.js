const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PassengerViewPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `  const [pnrInput, setPnrInput] = useState(() => searchParams.get('pnr') || 'AS-89412');

  useEffect(() => {
    const queryPnr = searchParams.get('pnr');
    if (queryPnr) {
      setPnrInput(queryPnr);
      const found = passengersData.find(
        p => p.pnr.toLowerCase() === queryPnr.trim().toLowerCase()
      );
      if (found) setActivePax(found);
    }
  }, [searchParams]);
  const [activePax, setActivePax] = useState(passengersData[0]);`;

const replacement = `  const initialPnr = searchParams.get('pnr') || 'AS-89412';
  const initialPax = passengersData.find(p => p.pnr.toLowerCase() === initialPnr.toLowerCase()) || passengersData[0];
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [activePax, setActivePax] = useState(initialPax);

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

content = content.replace(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed PassengerViewPage.jsx state order.');
