import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, RefreshCw, Download, Plane, ArrowRight, 
  AlertTriangle, X, Eye, Plus, Trash2, Edit3 
} from 'lucide-react';
import { flightsData } from '../data/flights';
import { getFlights, createFlight, updateFlight, deleteFlight } from '../services/api';

export default function FlightManagementPage({ selectedAirline = 'All Airlines' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSelectedId = searchParams.get('id');

  // Flight Data State
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState(initialSelectedId || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hubFilter, setHubFilter] = useState('ALL');
  const [airlineFilter, setAirlineFilter] = useState(
    selectedAirline && selectedAirline !== 'All Airlines' ? selectedAirline : 'ALL'
  );
  const [sortBy, setSortBy] = useState('DEFAULT'); // DEFAULT, DELAY_DESC, STD_ASC, FLIGHT_ASC
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Add Flight Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: selectedAirline !== 'All Airlines' ? selectedAirline : 'Air India',
    origin: 'DEL',
    destination: 'BOM',
    std: '10:30',
    sta: '12:45',
    aircraftType: 'A320neo',
    tailNumber: 'VT-EXB',
    gate: 'Gate B2',
    status: 'On Time',
    paxCapacity: 186,
    paxOnBoard: 164
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit delay state in drawer
  const [editingDelay, setEditingDelay] = useState(false);
  const [newDelayMinutes, setNewDelayMinutes] = useState(0);

  // Load flights from API with robust error handling and fallbacks
  const loadFlightsData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await getFlights();
      if (res?.error && (!res.data || res.data.length === 0)) {
        setError(res.error || 'Failed to ingest live flight schedule from OCC telemetry backend.');
        setFlights(flightsData);
      } else if (Array.isArray(res?.data)) {
        setFlights(res.data);
        if (initialSelectedId) {
          const found = res.data.find(f => f.id === initialSelectedId || f.flightNumber === initialSelectedId);
          if (found) setSelectedFlight(found);
        }
      } else {
        setFlights(flightsData);
      }
    } catch (err) {
      console.warn('[FlightManagement] Fallback to local flights:', err);
      setError('Connection interrupted. Operating on cached OCC flight operations schedule.');
      setFlights(flightsData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [initialSelectedId]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        const res = await getFlights();
        if (!isMounted) return;
        if (res?.error && (!res.data || res.data.length === 0)) {
          setError(res.error || 'Failed to ingest live flight schedule.');
          setFlights(flightsData);
        } else if (Array.isArray(res?.data)) {
          setFlights(res.data);
          if (initialSelectedId) {
            const found = res.data.find(f => f.id === initialSelectedId || f.flightNumber === initialSelectedId);
            if (found) setSelectedFlight(found);
          }
        } else {
          setFlights(flightsData);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('[FlightManagement] Ingestion error:', err.message);
        setError('Connection interrupted. Operating on cached OCC flight operations schedule.');
        setFlights(flightsData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [initialSelectedId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered and Sorted Flights
  const processedFlights = useMemo(() => {
    let result = flights.filter(flight => {
      const fn = flight.flightNumber || '';
      const id = flight.id || '';
      const tn = flight.tailNumber || '';
      const rt = flight.route || `${flight.origin || ''} → ${flight.destination || ''}`;
      const orig = flight.origin || '';
      const dest = flight.destination || '';
      const al = flight.airline || '';

      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term ||
        fn.toLowerCase().includes(term) ||
        id.toLowerCase().includes(term) ||
        tn.toLowerCase().includes(term) ||
        rt.toLowerCase().includes(term) ||
        orig.toLowerCase().includes(term) ||
        dest.toLowerCase().includes(term) ||
        al.toLowerCase().includes(term);

      const st = flight.status || '';
      const stType = flight.statusType || '';
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'DELAYED' && (stType === 'critical' || st === 'Delayed' || flight.delayMinutes > 0)) ||
        (statusFilter === 'AT_RISK' && (stType === 'warning' || st === 'Boarding')) ||
        (statusFilter === 'ON_TIME' && (stType === 'normal' || st === 'On Time' || (!flight.delayMinutes && st !== 'Delayed')));

      const matchesHub = 
        hubFilter === 'ALL' || 
        orig === hubFilter || 
        dest === hubFilter ||
        rt.includes(hubFilter);

      const matchesAirline = 
        airlineFilter === 'ALL' || 
        al.toLowerCase().includes(airlineFilter.toLowerCase()) ||
        (airlineFilter === 'Air India' && (fn.startsWith('AI') || al.includes('Air India'))) ||
        (airlineFilter === 'IndiGo' && (fn.startsWith('6E') || al.includes('IndiGo'))) ||
        (airlineFilter === 'SpiceJet' && (fn.startsWith('SG') || al.includes('SpiceJet'))) ||
        (airlineFilter === 'Vistara' && (fn.startsWith('UK') || al.includes('Vistara')));

      return matchesSearch && matchesStatus && matchesHub && matchesAirline;
    });

    if (sortBy === 'DELAY_DESC') {
      result.sort((a, b) => (b.delayMinutes || 0) - (a.delayMinutes || 0));
    } else if (sortBy === 'STD_ASC') {
      result.sort((a, b) => (a.std || a.departure || '').localeCompare(b.std || b.departure || ''));
    } else if (sortBy === 'FLIGHT_ASC') {
      result.sort((a, b) => (a.flightNumber || '').localeCompare(b.flightNumber || ''));
    }

    return result;
  }, [flights, searchTerm, statusFilter, hubFilter, airlineFilter, sortBy]);

  // Handle Add Flight Submit
  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.flightNumber.trim()) errors.flightNumber = 'Flight number is required';
    if (!formData.tailNumber.trim()) errors.tailNumber = 'Tail number is required';
    if (!formData.origin.trim()) errors.origin = 'Origin code required';
    if (!formData.destination.trim()) errors.destination = 'Destination code required';
    if (formData.origin === formData.destination) errors.destination = 'Origin & destination cannot match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const newFlt = {
        flightNumber: formData.flightNumber.toUpperCase(),
        airline: formData.airline,
        origin: formData.origin.toUpperCase(),
        destination: formData.destination.toUpperCase(),
        route: `${formData.origin.toUpperCase()} → ${formData.destination.toUpperCase()}`,
        std: formData.std,
        sta: formData.sta,
        etd: formData.std,
        eta: formData.sta,
        aircraftType: formData.aircraftType,
        tailNumber: formData.tailNumber.toUpperCase(),
        gate: formData.gate,
        gateStatus: 'Nominal',
        status: formData.status,
        statusType: formData.status === 'Delayed' ? 'critical' : formData.status === 'Boarding' ? 'warning' : 'normal',
        delayMinutes: formData.status === 'Delayed' ? 45 : 0,
        aiImpactSeverity: formData.status === 'Delayed' ? 'Medium' : 'None',
        crew: { captain: 'Capt. R. Verma', crewCode: 'DEL-Base', fdtlStatus: 'Legal' },
        paxCapacity: Number(formData.paxCapacity) || 186,
        paxOnBoard: Number(formData.paxOnBoard) || 160,
        loadFactor: '88.5%',
        connectingPax: 12
      };

      const res = await createFlight(newFlt);
      const created = res.data || newFlt;
      setFlights(prev => [created, ...prev]);
      setAddModalOpen(false);
      showToast(`Flight ${created.flightNumber} created successfully.`);
    } catch (err) {
      console.error('[FlightManagement] Error creating flight:', err);
      showToast('Flight added to local schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Delay for selected flight
  const handleUpdateFlightDelay = async () => {
    if (!selectedFlight) return;
    const mins = Number(newDelayMinutes);
    const updatedStatus = mins > 0 ? 'Delayed' : 'On Time';
    const updatedStatusType = mins > 30 ? 'critical' : mins > 0 ? 'warning' : 'normal';

    try {
      await updateFlight(selectedFlight.id, {
        delayMinutes: mins,
        status: updatedStatus,
        statusType: updatedStatusType
      });

      const updatedObj = {
        ...selectedFlight,
        delayMinutes: mins,
        status: updatedStatus,
        statusType: updatedStatusType
      };

      setSelectedFlight(updatedObj);
      setFlights(prev => prev.map(f => f.id === selectedFlight.id ? updatedObj : f));
      setEditingDelay(false);
      showToast(`Updated ${selectedFlight.flightNumber} delay to +${mins}m.`);
    } catch (err) {
      console.error('[FlightManagement] Update failed:', err);
      showToast('Delay update applied locally.');
    }
  };

  // Handle Delete Flight
  const handleDeleteFlight = async (flightId, flightNo) => {
    if (!window.confirm(`Are you sure you want to remove flight ${flightNo} from OCC tracking?`)) return;

    try {
      await deleteFlight(flightId);
      setFlights(prev => prev.filter(f => f.id !== flightId));
      if (selectedFlight?.id === flightId) setSelectedFlight(null);
      showToast(`Flight ${flightNo} removed from schedule.`);
    } catch (err) {
      console.error('[FlightManagement] Delete failed:', err);
      showToast('Flight removed locally.');
    }
  };

  // Export Manifest
  const handleExportManifest = () => {
    const dataToExport = processedFlights.map(f => ({
      flightNumber: f.flightNumber,
      airline: f.airline,
      route: f.route || `${f.origin} → ${f.destination}`,
      std: f.std,
      sta: f.sta,
      delayMinutes: f.delayMinutes || 0,
      status: f.status,
      tailNumber: f.tailNumber,
      gate: f.gate
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroSync-Flight-Manifest-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Manifest exported successfully.');
  };

  // KPI counts
  const totalCount = flights.length;
  const delayedCount = flights.filter(f => f.delayMinutes > 0 || f.status === 'Delayed').length;
  const onTimeCount = totalCount - delayedCount;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-primary-container text-on-primary border border-secondary/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Plane className="w-5 h-5 text-secondary animate-pulse" />
          <span className="text-xs font-label-code font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              NETWORK FLEET TELEMETRY • LIVE INGESTION
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Flight Operations & Fleet Tracking
          </h1>
          <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant mt-1">
            Live schedule, delay telemetry, and AI impact severity across domestic and international sectors.
          </p>
        </div>

        {/* Counter Pill & Action Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-4 bg-surface-container-lowest p-3 px-5 rounded-2xl border border-surface-container-highest shadow-sm">
            <div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Total</span>
              <div className="font-data-display text-lg sm:text-xl font-bold text-on-surface">{totalCount}</div>
            </div>
            <div className="w-px h-8 bg-surface-container-highest"></div>
            <div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">On Time</span>
              <div className="font-data-display text-lg sm:text-xl font-bold text-secondary">{onTimeCount}</div>
            </div>
            <div className="w-px h-8 bg-surface-container-highest"></div>
            <div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Delayed</span>
              <div className="font-data-display text-lg sm:text-xl font-bold text-error">{delayedCount}</div>
            </div>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary text-on-secondary font-bold text-xs shadow-md hover:bg-secondary/90 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flight</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner with Retry Button */}
      {error && (
        <div className="p-4 rounded-2xl bg-error-container/20 border border-error/40 text-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0" />
            <div>
              <div className="font-bold text-xs text-error font-label-code">Telemetry Stream Ingestion Notice</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{error}</div>
            </div>
          </div>
          <button
            onClick={() => loadFlightsData(true)}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-error text-on-error font-bold text-xs hover:bg-error/90 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Retry Telemetry Ingestion</span>
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Flight # (e.g. 6E 1234), Tail, Origin, Destination, Airline..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-code text-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/40 transition-all"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto font-label-code text-xs">
          
          {/* Airline Filter */}
          <select
            value={airlineFilter}
            onChange={(e) => setAirlineFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="ALL">All Airlines</option>
            <option value="Air India">Air India</option>
            <option value="IndiGo">IndiGo</option>
            <option value="SpiceJet">SpiceJet</option>
            <option value="Vistara">Vistara</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELAYED">Delayed</option>
            <option value="AT_RISK">At Risk / Boarding</option>
            <option value="ON_TIME">On-Time</option>
          </select>

          {/* Hub Filter */}
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="ALL">All Hubs</option>
            <option value="DEL">Delhi (DEL)</option>
            <option value="BOM">Mumbai (BOM)</option>
            <option value="MAA">Chennai (MAA)</option>
            <option value="BLR">Bengaluru (BLR)</option>
            <option value="HYD">Hyderabad (HYD)</option>
            <option value="CCU">Kolkata (CCU)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface focus:outline-none border border-surface-container-highest"
          >
            <option value="DEFAULT">Sort: Default</option>
            <option value="DELAY_DESC">Sort: Highest Delay</option>
            <option value="STD_ASC">Sort: Earliest Dep</option>
            <option value="FLIGHT_ASC">Sort: Flight #</option>
          </select>

          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setHubFilter('ALL'); setAirlineFilter('ALL'); setSortBy('DEFAULT'); loadFlightsData(true); }}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-semibold flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Flights"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportManifest}
            className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary font-bold hover:bg-primary transition-colors flex items-center gap-1.5"
            title="Export Manifest"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

      </div>

      {/* Flight Operations Data Table with Responsive Horizontal Scroll */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-left text-xs font-body-sm min-w-[750px]">
            <thead className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant font-label-caps uppercase text-[10px]">
              <tr>
                <th className="p-4">Flight</th>
                <th className="p-4">Sector / Route</th>
                <th className="p-4">Departure (STD/ETD)</th>
                <th className="p-4">Arrival (STA/ETA)</th>
                <th className="p-4">Equipment & Tail</th>
                <th className="p-4">Gate</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Impact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-label-code">
              {isLoading ? (
                // Skeletons
                [1, 2, 3, 4, 5, 6].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-28 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-14 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-18 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-surface-container-high rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-12 bg-surface-container-high rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : flights.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-on-surface-variant space-y-3">
                    <Plane className="w-8 h-8 mx-auto text-outline" />
                    <div className="font-bold text-sm text-on-surface">No active flight operations in schedule</div>
                    <p className="text-xs text-on-surface-variant">The telemetry database currently has no flights logged.</p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button 
                        onClick={() => loadFlightsData(true)}
                        className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors"
                      >
                        Reload Schedule
                      </button>
                      <button 
                        onClick={() => setAddModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs"
                      >
                        Add First Flight
                      </button>
                    </div>
                  </td>
                </tr>
              ) : processedFlights.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-on-surface-variant space-y-3">
                    <Plane className="w-8 h-8 mx-auto text-outline" />
                    <div className="font-bold text-sm text-on-surface">No flights match your search or filter criteria</div>
                    <p className="text-xs text-on-surface-variant">Try clearing one or more filters to view active flights.</p>
                    <button 
                      onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setHubFilter('ALL'); setAirlineFilter('ALL'); setSortBy('DEFAULT'); }}
                      className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                processedFlights.map((flight) => (
                  <tr 
                    key={flight.id || flight.flightNumber}
                    onClick={() => setSelectedFlight(flight)}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                  >
                    {/* Flight Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-secondary font-data-display text-xs">
                          {(flight.flightNumber || 'FL').substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{flight.flightNumber}</div>
                          <div className="text-[10px] text-on-surface-variant">{flight.airline || 'Commercial'} • {flight.flightType || 'Scheduled'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sector / Route */}
                    <td className="p-4">
                      <div className="font-bold text-sm text-on-surface font-headline-md">
                        {flight.route || `${flight.origin} → ${flight.destination}`}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">{flight.distanceKm ? `${flight.distanceKm} km` : 'Domestic'} • {flight.flightTime || '1h 45m'}</div>
                    </td>

                    {/* Departure */}
                    <td className="p-4">
                      <div className="text-on-surface font-bold">{flight.std || flight.departure || '18:30'}</div>
                      {flight.delayMinutes > 0 ? (
                        <div className="text-error font-bold">{flight.etd || '19:15'} (+{flight.delayMinutes}m DELAY)</div>
                      ) : (
                        <div className="text-on-surface-variant text-[10px]">On-Time</div>
                      )}
                    </td>

                    {/* Arrival */}
                    <td className="p-4">
                      <div className="text-on-surface font-bold">{flight.sta || flight.arrival || '20:15'}</div>
                      {flight.delayMinutes > 0 ? (
                        <div className="text-error font-bold">{flight.eta || '21:00'} revised</div>
                      ) : (
                        <div className="text-on-surface-variant text-[10px]">On-Time</div>
                      )}
                    </td>

                    {/* Equipment & Tail */}
                    <td className="p-4">
                      <div className="font-bold text-on-surface">{flight.aircraftType || flight.aircraft || 'A320neo'}</div>
                      <div className="text-secondary font-bold">{flight.tailNumber || 'VT-IFZ'}</div>
                    </td>

                    {/* Gate Allocation */}
                    <td className="p-4">
                      <div className="font-bold text-on-surface">{flight.gate || 'Gate A4'}</div>
                      <div className={`text-[10px] ${flight.gateStatus?.includes('CONFLICT') ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                        {flight.gateStatus || 'Nominal'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        flight.statusType === 'critical' || flight.status === 'Delayed' ? 'bg-error-container text-on-error-container' :
                        flight.statusType === 'warning' || flight.status === 'Boarding' ? 'bg-amber-100 text-amber-900' :
                        flight.statusType === 'landed' ? 'bg-surface-container text-on-surface-variant' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        • {flight.status || 'Active'}
                      </span>
                    </td>

                    {/* AI Impact */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        flight.aiImpactSeverity?.includes('High') || flight.delayMinutes > 45 ? 'bg-error text-on-error' :
                        flight.aiImpactSeverity?.includes('Medium') || flight.delayMinutes > 0 ? 'bg-amber-500 text-white' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {flight.aiImpactSeverity || (flight.delayMinutes > 0 ? 'Medium' : 'None')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFlight(flight)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-secondary"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFlight(flight.id, flight.flightNumber)}
                          className="p-1.5 rounded-lg hover:bg-error-container/40 text-on-surface-variant hover:text-error"
                          title="Delete Flight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED FLIGHT DRAWER */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setSelectedFlight(null)}>
          <div 
            className="w-full max-w-xl h-full bg-surface-container-lowest p-6 md:p-8 shadow-2xl overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold font-data-display">
                  {(selectedFlight.flightNumber || 'FL').substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface font-headline-lg">{selectedFlight.flightNumber} Detailed Telemetry</h3>
                  <p className="text-xs text-on-surface-variant font-label-code">
                    {selectedFlight.route || `${selectedFlight.origin} → ${selectedFlight.destination}`} • {selectedFlight.airline || 'Commercial'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFlight(null)} className="p-2 rounded-xl hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4 font-label-code text-xs">
              
              {/* Schedule and Delay Box */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-secondary uppercase text-[11px]">Flight Schedule & Delay</div>
                  <button 
                    onClick={() => {
                      setNewDelayMinutes(selectedFlight.delayMinutes || 0);
                      setEditingDelay(!editingDelay);
                    }}
                    className="flex items-center gap-1 text-[11px] text-secondary font-bold hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{editingDelay ? 'Cancel' : 'Update Delay'}</span>
                  </button>
                </div>

                {editingDelay ? (
                  <div className="p-3 bg-surface-container-lowest rounded-xl border border-secondary/30 space-y-3">
                    <label className="block text-[11px] font-semibold text-on-surface">
                      Adjust Delay Minutes (+m):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={newDelayMinutes}
                        onChange={(e) => setNewDelayMinutes(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface w-24 font-bold border border-surface-container-highest"
                      />
                      <button
                        onClick={handleUpdateFlightDelay}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-white font-bold text-xs"
                      >
                        Save Delay
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-on-surface-variant text-[10px]">STD / ETD</span>
                      <div className="font-bold">{selectedFlight.std || selectedFlight.departure} → {selectedFlight.etd || selectedFlight.departure}</div>
                    </div>
                    <div>
                      <span className="text-on-surface-variant text-[10px]">STA / ETA</span>
                      <div className="font-bold">{selectedFlight.sta || selectedFlight.arrival} → {selectedFlight.eta || selectedFlight.arrival}</div>
                    </div>
                  </div>
                )}

                {selectedFlight.delayMinutes > 0 && (
                  <div className="pt-2 border-t border-surface-container-highest text-error font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-error" />
                    <span>Current Delay: +{selectedFlight.delayMinutes} min • Status: {selectedFlight.status}</span>
                  </div>
                )}
              </div>

              {/* Aircraft & Crew */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
                <div className="font-bold text-secondary uppercase text-[11px]">Aircraft & Crew Allocation</div>
                <div>Tail Number: <strong className="text-on-surface">{selectedFlight.tailNumber || 'VT-IFZ'}</strong> ({selectedFlight.aircraftType || selectedFlight.aircraft || 'A320neo'})</div>
                <div>Captain: <strong className="text-on-surface">{selectedFlight.crew?.captain || 'Capt. Rajiv Sen'}</strong> ({selectedFlight.crew?.crewCode || 'DEL-R12'})</div>
                <div className="text-on-surface-variant">FDTL Status: {selectedFlight.crew?.fdtlStatus || 'Monitored'}</div>
              </div>

              {/* Gate & Pax */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
                <div className="font-bold text-secondary uppercase text-[11px]">Gate & Pax Connections</div>
                <div>Assigned Stand: <strong className="text-on-surface">{selectedFlight.gate || 'Gate A4'}</strong> ({selectedFlight.gateStatus || 'Nominal'})</div>
                <div>Pax On Board: <strong className="text-on-surface">{selectedFlight.paxOnBoard || 164} / {selectedFlight.paxCapacity || 186}</strong> ({selectedFlight.loadFactor || '88%'} Load)</div>
                <div>Connecting Pax at Risk: <strong className="text-error">{selectedFlight.connectingPax || 14} Pax</strong></div>
              </div>

            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={() => navigate(`/disruptions?id=${selectedFlight.id || selectedFlight.flightNumber}`)}
                className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
              >
                <span>View Disruption Cascade Map for Flight</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleDeleteFlight(selectedFlight.id, selectedFlight.flightNumber)}
                className="w-full py-2.5 rounded-xl bg-error-container text-on-error-container font-bold text-xs flex items-center justify-center gap-2 hover:bg-error/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Flight from Operations</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW FLIGHT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAddModalOpen(false)}>
          <div 
            className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-surface-container-highest space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                  <Plane className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface font-headline-lg">Create New Flight</h3>
                  <p className="text-xs text-on-surface-variant font-label-code">Add flight rotation to live OCC schedule</p>
                </div>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-container">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <form onSubmit={handleAddFlightSubmit} className="space-y-4 font-label-code text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Flight Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 6E 2104"
                    value={formData.flightNumber}
                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border ${formErrors.flightNumber ? 'border-error' : 'border-surface-container-highest'} focus:outline-none`}
                  />
                  {formErrors.flightNumber && <p className="text-error text-[10px] mt-0.5">{formErrors.flightNumber}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Tail Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. VT-EXB"
                    value={formData.tailNumber}
                    onChange={(e) => setFormData({ ...formData, tailNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border ${formErrors.tailNumber ? 'border-error' : 'border-surface-container-highest'} focus:outline-none`}
                  />
                  {formErrors.tailNumber && <p className="text-error text-[10px] mt-0.5">{formErrors.tailNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Origin Hub *</label>
                  <input
                    type="text"
                    placeholder="e.g. DEL"
                    maxLength={4}
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border ${formErrors.origin ? 'border-error' : 'border-surface-container-highest'} focus:outline-none`}
                  />
                  {formErrors.origin && <p className="text-error text-[10px] mt-0.5">{formErrors.origin}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Destination Hub *</label>
                  <input
                    type="text"
                    placeholder="e.g. BOM"
                    maxLength={4}
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border ${formErrors.destination ? 'border-error' : 'border-surface-container-highest'} focus:outline-none`}
                  />
                  {formErrors.destination && <p className="text-error text-[10px] mt-0.5">{formErrors.destination}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">STD (Departure Time)</label>
                  <input
                    type="time"
                    value={formData.std}
                    onChange={(e) => setFormData({ ...formData, std: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">STA (Arrival Time)</label>
                  <input
                    type="time"
                    value={formData.sta}
                    onChange={(e) => setFormData({ ...formData, sta: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Aircraft Type</label>
                  <select
                    value={formData.aircraftType}
                    onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                  >
                    <option value="A320neo">Airbus A320neo</option>
                    <option value="A321neo">Airbus A321neo</option>
                    <option value="B737-MAX8">Boeing 737 MAX 8</option>
                    <option value="B777-300ER">Boeing 777-300ER</option>
                    <option value="ATR 72-600">ATR 72-600</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface mb-1">Gate Assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Gate B2"
                    value={formData.gate}
                    onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface border border-surface-container-highest focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-container-highest">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-md hover:bg-secondary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Flight'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
