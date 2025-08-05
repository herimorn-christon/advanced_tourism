import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import hotelsRoutes from './routes/hotels.js';
import roomsRoutes from './routes/rooms.js';
import bookingsRoutes from './routes/bookings.js';
import royalToursRoutes from './routes/royalTours.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import countriesRoutes from './routes/countries.js';
import toursRoutes from './routes/tours.js';
import destinationsRoutes from './routes/destinations.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow VR content
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve media files with proper routing
app.get('/api/media/serve/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folder, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

app.get('/api/media/serve/:folder/:subfolder/:filename', (req, res) => {
  const { folder, subfolder, filename } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folder, subfolder, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/royal-tours', royalToursRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/destinations', destinationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tourism VR Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
});

export default app;