const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PassengerBookingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetSection = `  // Handle preselected flightId from query params
  useEffect(() => {
    if (preselectedFlightId && flights.length > 0) {
      const found = flights.find(f => f.id === preselectedFlightId || f.flightNumber.replace(/\\s+/g, '') === preselectedFlightId.replace(/\\s+/g, ''));
      if (found) {
        handleSelectFlight(found);
      }
    }
  }, [preselectedFlightId, flights]);

  // Filtered flights
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      const matchesOrigin = originFilter === 'ALL' || flight.origin === originFilter;
      const matchesDest = destinationFilter === 'ALL' || flight.destination === destinationFilter;
      const matchesAirline = airlineFilter === 'ALL' || flight.airline.toLowerCase().includes(airlineFilter.toLowerCase());
      const matchesQuery = !searchQuery.trim() || 
        flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flight.route && flight.route.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesOrigin && matchesDest && matchesAirline && matchesQuery;
    });
  }, [flights, originFilter, destinationFilter, airlineFilter, searchQuery]);

  // Select flight and load cabin seats
  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null);
    setIsLoadingSeats(true);
    setCurrentStep(2);

    try {
      const res = await getFlightSeats(flight.id);
      if (res?.data) {
        setFlightSeatsData(res.data);
      } else {
        const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
        const summary = getSeatSummary(seats);
        setFlightSeatsData({
          ...flight,
          ...summary,
          seats
        });
      }
    } catch {
      const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
      const summary = getSeatSummary(seats);
      setFlightSeatsData({
        ...flight,
        ...summary,
        seats
      });
    } finally {
      setIsLoadingSeats(false);
    }
  };`;

const reorderedSection = `  // Select flight and load cabin seats
  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null);
    setIsLoadingSeats(true);
    setCurrentStep(2);

    try {
      const res = await getFlightSeats(flight.id);
      if (res?.data) {
        setFlightSeatsData(res.data);
      } else {
        const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
        const summary = getSeatSummary(seats);
        setFlightSeatsData({
          ...flight,
          ...summary,
          seats
        });
      }
    } catch {
      const seats = generateFlightSeats(flight.id, flight.totalRows || 30);
      const summary = getSeatSummary(seats);
      setFlightSeatsData({
        ...flight,
        ...summary,
        seats
      });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // Handle preselected flightId from query params
  useEffect(() => {
    if (preselectedFlightId && flights.length > 0) {
      const found = flights.find(f => f.id === preselectedFlightId || f.flightNumber.replace(/\\s+/g, '') === preselectedFlightId.replace(/\\s+/g, ''));
      if (found) {
        handleSelectFlight(found);
      }
    }
  }, [preselectedFlightId, flights]);

  // Filtered flights
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      const matchesOrigin = originFilter === 'ALL' || flight.origin === originFilter;
      const matchesDest = destinationFilter === 'ALL' || flight.destination === destinationFilter;
      const matchesAirline = airlineFilter === 'ALL' || flight.airline.toLowerCase().includes(airlineFilter.toLowerCase());
      const matchesQuery = !searchQuery.trim() || 
        flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flight.route && flight.route.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesOrigin && matchesDest && matchesAirline && matchesQuery;
    });
  }, [flights, originFilter, destinationFilter, airlineFilter, searchQuery]);`;

content = content.replace(targetSection, reorderedSection);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Reordered handleSelectFlight above useEffect.');
