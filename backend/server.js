import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import dashboardRoutes from './routes/dashboard.routes.js';
import flightsRoutes from './routes/flights.routes.js';
import disruptionsRoutes from './routes/disruptions.routes.js';
import recoveryRoutes from './routes/recovery.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import crewRoutes from './routes/crew.routes.js';
import aircraftRoutes from './routes/aircraft.routes.js';
import gatesRoutes from './routes/gates.routes.js';
import passengersRoutes from './routes/passengers.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());

// CORS Configuration (Allow Localhost & Vercel Production Deployment)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

const corsOrigins = Array.from(new Set([...defaultOrigins, ...allowedOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or listed origins
    if (!origin || corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS Error: Origin ${origin} not allowed by policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AeroSync AI backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Route Mounts
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/disruptions', disruptionsRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/gates', gatesRoutes);
app.use('/api/passengers', passengersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`✈ AeroSync AI Backend Server Running on Port ${PORT}`);
  console.log(`  Health Check : http://localhost:${PORT}/api/health`);
  console.log(`  Environment  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});
