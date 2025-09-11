const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientPortalRoutes = require('./routes/client-portal');
const employeePortalRoutes = require('./routes/employee-portal');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');
const mobileApiRoutes = require('./routes/mobile-api');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/client-portal', clientPortalRoutes);
app.use('/api/employee-portal', employeePortalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/mobile', mobileApiRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room based on user type
  socket.on('join_room', (data) => {
    const { userType, userId } = data;
    socket.join(`${userType}_${userId}`);
  });
  
  // Handle field tech location updates
  socket.on('location_update', (data) => {
    socket.broadcast.emit('tech_location_update', data);
  });
  
  // Handle job status updates
  socket.on('job_status_update', (data) => {
    io.emit('job_update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Scoop Unit API Server running on port ${PORT}`);
  console.log(`📱 Client Portal: http://localhost:${PORT}/api/client-portal`);
  console.log(`👥 Employee Portal: http://localhost:${PORT}/api/employee-portal`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/api/admin`);
});

module.exports = { app, io };