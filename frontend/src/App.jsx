import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layouts/AppShell';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DisruptionCenterPage from './pages/DisruptionCenterPage';
import RecoveryPlanPage from './pages/RecoveryPlanPage';
import RecoverySandboxPage from './pages/RecoverySandboxPage';
import FlightManagementPage from './pages/FlightManagementPage';
import CrewManagementPage from './pages/CrewManagementPage';
import GatesAircraftPage from './pages/GatesAircraftPage';
import PassengerImpactPage from './pages/PassengerImpactPage';
import PassengerViewPage from './pages/PassengerViewPage';
import NotificationsPage from './pages/NotificationsPage';
import DecisionReplayPage from './pages/DecisionReplayPage';

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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="/recovery-sandbox" element={<RecoverySandboxPage selectedAirline={selectedAirline} />} />
          <Route path="/flights" element={<FlightManagementPage selectedAirline={selectedAirline} />} />
          <Route path="/crew" element={<CrewManagementPage selectedAirline={selectedAirline} />} />
          <Route path="/resources" element={<GatesAircraftPage selectedAirline={selectedAirline} />} />
          <Route path="/passenger-impact" element={<PassengerImpactPage selectedAirline={selectedAirline} />} />
          <Route path="/passenger-view" element={<PassengerViewPage selectedAirline={selectedAirline} />} />
          <Route path="/notifications" element={<NotificationsPage selectedAirline={selectedAirline} />} />
          <Route path="/decision-replay" element={<DecisionReplayPage selectedAirline={selectedAirline} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
