import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

import postsRoutes from './routes/postsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRequestRoutes from './routes/adminRequestRoutes.js';
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js';
import seedCategories from "./utils/seedCategories.js";

// Load environment variables
dotenv.config();

//  connect db
connectDB();

await seedCategories()
const app = express();
const httpServer = createServer(app);

// 1. Initialize Socket.io for Real-time News

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
  }
});




io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

// 2. Security & Logging Middleware
app.use(helmet()); // Protects headers
// Allows React to talk to Node
app.use(morgan('dev')); // Logs requests in terminal
app.use(express.json()); // Parses JSON bodies



app.use('/api/analytics', analyticsRoutes);


// 4. Attach Socket to Request (So controllers can use it)
app.use((req, res, next) => {
  req.io = io;
  next();
});



// 5. Basic Route for testing
app.get('/', (req, res) => res.send('Faculty Press API is Live 🚀'));




// 
// --- API ROUTES ---
app.use('/api/posts', postsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin-requests', adminRequestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

// 6. Start the Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`📡 Server heartbeat at http://localhost:${PORT}`);
});