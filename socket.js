// socket/index.js
import { Server } from 'socket.io';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // You can handle shared events here if needed
  });

  return io;
}

export function getSocket() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}


