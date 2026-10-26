import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layouts/AppShell';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DisruptionCenterPage from './pages/DisruptionCenterPage';
import RecoveryPlanPage from './pages/RecoveryPlanPage';
import RecoverySandboxPage from './pages/RecoverySandboxPage';
import FlightManagementPage from './pages/FlightManagementPage';
import LiveMapPage from './pages/LiveMapPage';
import CrewManagementPage from './pages/CrewManagementPage';
import GatesAircraftPage from './pages/GatesAircraftPage';
import PassengerImpactPage from './pages/PassengerImpactPage';
import PassengerViewPage from './pages/PassengerViewPage';
import PassengerBookingPage from './pages/PassengerBookingPage';
import NotificationsPage from './pages/NotificationsPage';
import DecisionReplayPage from './pages/DecisionReplayPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [autoReplanEnabled, setAutoReplanEnabled] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState('Air India');

  return (
    <BrowserRouter>
      <AppShell 
        autoReplanEnabled={autoReplanEnabled} 
        setAutoReplanEnabled={setAutoReplanEnabled}
        selectedAirline={selectedAirline}
        setSelectedAirline={setSelectedAirline}
      >
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/register" element={<LoginPage initialMode="register" />} />
          <Route path="/forgot-password" element={<LoginPage initialMode="forgot" />} />

          {/* Primary OCC Operational Pages */}
          <Route path="/dashboard" element={<DashboardPage selectedAirline={selectedAirline} />} />
          <Route path="/disruptions" element={<DisruptionCenterPage selectedAirline={selectedAirline} />} />
          <Route 
            path="/recovery" 
            element={
              <RecoveryPlanPage 
                autoReplanEnabled={autoReplanEnabled} 
                setAutoReplanEnabled={setAutoReplanEnabled} 
                selectedAirline={selectedAirline}
              />
            } 
          />
          <Route path="/recovery-plan" element={<Navigate to="/recovery" replace />} />
          <Route path="/recovery-sandbox" element={<RecoverySandboxPage selectedAirline={selectedAirline} />} />
          <Route path="/sandbox" element={<Navigate to="/recovery-sandbox" replace />} />
          <Route path="/what-if" element={<Navigate to="/recovery-sandbox" replace />} />

          {/* Flights, Map & Scheduling */}
          <Route path="/flights" element={<FlightManagementPage selectedAirline={selectedAirline} />} />
          <Route path="/map" element={<LiveMapPage selectedAirline={selectedAirline} />} />
          <Route path="/live-map" element={<Navigate to="/map" replace />} />
          <Route path="/network-map" element={<Navigate to="/map" replace />} />

          {/* Crew & Resources */}
          <Route path="/crew" element={<CrewManagementPage selectedAirline={selectedAirline} />} />
          <Route path="/resources" element={<GatesAircraftPage selectedAirline={selectedAirline} />} />
          <Route path="/gates-aircraft" element={<Navigate to="/resources" replace />} />
          <Route path="/aircraft" element={<Navigate to="/resources" replace />} />
          <Route path="/gates" element={<Navigate to="/resources" replace />} />

          {/* Passengers & Re-accommodation */}
          <Route path="/passenger-impact" element={<PassengerImpactPage selectedAirline={selectedAirline} />} />
          <Route path="/passenger-view" element={<PassengerViewPage selectedAirline={selectedAirline} />} />

          {/* Ticket Booking & Seat Selection */}
          <Route path="/booking" element={<PassengerBookingPage selectedAirline={selectedAirline} />} />
          <Route path="/passenger-booking" element={<Navigate to="/booking" replace />} />
          <Route path="/ticket-booking" element={<Navigate to="/booking" replace />} />
          <Route path="/rebooking" element={<Navigate to="/booking" replace />} />
          <Route path="/passenger-rebooking" element={<Navigate to="/booking" replace />} />

          {/* Alerts & Auditing */}
          <Route path="/notifications" element={<NotificationsPage selectedAirline={selectedAirline} />} />
          <Route path="/decision-replay" element={<DecisionReplayPage selectedAirline={selectedAirline} />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
