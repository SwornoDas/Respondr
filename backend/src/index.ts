import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
// Import Supabase if needed
// import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

// Mock Supabase Database interaction for now
// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Simple in-memory incidents for MVP
const incidents: any[] = [];

// API Route: Create Incident
app.post('/api/incidents', (req, res) => {
  const { type, room, description } = req.body;
  
  if (!type || !room) {
    return res.status(400).json({ error: 'Type and room are required' });
  }

  const newIncident = {
    id: `inc_${Date.now()}`,
    type,
    room,
    description: description || '',
    status: 'REPORTED',
    timestamp: new Date().toISOString()
  };

  // 1. Save to DB (mocked here)
  incidents.push(newIncident);

  // 2. Emit real-time event to all connected admins
  io.emit('new_incident', newIncident);

  console.log(`[Alert] New ${type} incident reported in room ${room}`);

  return res.status(201).json(newIncident);
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // They can also emit new_incident directly via socket if they prefer
  socket.on('new_incident', (data) => {
    console.log('Socket received new incident:', data);
    io.emit('new_incident', data); // broadcast to all admins
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check
app.get('/', (req, res) => res.send('CrisisSync API is running'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
