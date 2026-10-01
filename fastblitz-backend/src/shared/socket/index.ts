// src/shared/socket/index.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { verifyAccessToken } from '../../modules/auth/service';
import { eventEmitter } from '../../shared/events';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '../../config';

export async function setupSocketIO(app: FastifyInstance) {
  const pubClient = await getRedisClient();
  const subClient = pubClient.duplicate();

  const io = new SocketIOServer(app.server, { 
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }, 
    transports: ['websocket', 'polling']
  });

  // Attach adapter by setting it on the Server instance
  // Since v4 of socket.io, it is attached via io.adapter()
  (io as any).adapter(createAdapter(pubClient, subClient));

  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication required'));
    try { 
      const payload = verifyAccessToken(token as string); 
      socket.data.user = payload; 
      next(); 
    } catch { 
      next(new Error('Invalid token')); 
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, workspaceId } = socket.data.user;
    socket.join(`user:${userId}`);
    socket.join(`workspace:${workspaceId}`);
    
    socket.on('campaign:subscribe', (campaignId: string) => socket.join(`campaign:${campaignId}`));
    socket.on('workspace:subscribe', (workspaceId: string) => socket.join(`workspace:${workspaceId}`));
    socket.on('schedule:subscribe', (workspaceId: string) => socket.join(`schedule:${workspaceId}`));
    socket.on('blitz:swipe', async (data: { candidateId: string; action: 'approve' | 'reject'; reason?: string }) => {
      try { 
        // Will implement when scheduling module is ready
        console.log('Swipe action:', data);
      } catch (error: any) { 
        socket.emit('error', { message: error.message }); 
      }
    });
    socket.on('disconnect', (reason) => console.log(`Socket disconnected: user=${socket.data.user?.userId}, reason=${reason}`));
  });

  eventEmitter.on('campaign:progress', (data: any) => io.to(`campaign:${data.campaignId}`).emit('campaign:progress', data));
  eventEmitter.on('blitz:cards-ready', (data: any) => io.to(`workspace:${data.workspaceId}`).emit('blitz:cards-ready', data));
  eventEmitter.on('blitz:card-update', (data: any) => io.to(`workspace:${data.workspaceId}`).emit('blitz:card-update', data));
  eventEmitter.on('schedule:update', (data: any) => io.to(`workspace:${data.workspaceId}`).emit('schedule:update', data));
  eventEmitter.on('analytics:update', (data: any) => io.to(`workspace:${data.workspaceId}`).emit('analytics:update', data));
  eventEmitter.on('notification', (data: any) => { io.to(`user:${data.userId}`).emit('notification', data); io.to(`workspace:${data.workspaceId}`).emit('notification', data); });

  app.decorate('io', io);
  return io;
}