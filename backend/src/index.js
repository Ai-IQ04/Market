/**
 * Discord Auction Aggregator - Backend Server
 * Express + Socket.io + Discord.js
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const auctionRoutes = require('./routes/auctions');
const { startBot, setSocketIO } = require('./bot');
const store = require('./store');

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Express app
const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET'],
}));
app.use(express.json());

// API routes
app.use('/auctions', auctionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', items: store.size, uptime: process.uptime() });
});

// HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Pass Socket.io to bot
setSocketIO(io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Send current data on connect
  socket.emit('auction:update', store.getAll());

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Periodic broadcast (every 5 seconds) to keep status updated
setInterval(() => {
  io.emit('auction:update', store.getAll());
}, 5000);

// Start server
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] API: http://localhost:${PORT}/auctions`);
  console.log(`[Server] Frontend URL: ${FRONTEND_URL}`);
});

// Start Discord bot
startBot();
