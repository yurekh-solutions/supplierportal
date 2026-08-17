/**
 * Supplier Portal Socket.IO Client
 *
 * Connects to the backend WebSocket server using the supplier's JWT token.
 * Surfaces a tiny event bus for components to subscribe without owning the connection.
 *
 * Events surfaced:
 *  - `lead:new`             -- a new lead was just created for this supplier
 *  - `connected` / `disconnected` / `connect_error` -- connection lifecycle
 *
 * Usage:
 *   import { socket } from '@/lib/socketClient';
 *   socket.on('lead:new', (payload) => { ... });
 *   // No need to call .connect() manually -- it self-initialises on first use.
 */

import { io, Socket } from 'socket.io-client';

type Listener = (payload: any) => void;

const SOCKET_URL = (() => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
  if (host.includes('vercel.app') || host === 'ritzyard.com' || host === 'www.ritzyard.com') {
    return 'https://backendmatrix-9q18.onrender.com';
  }
  return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
})();

let socket: Socket | null = null;
let currentToken: string | null = null;
const listeners: Record<string, Set<Listener>> = {
  'lead:new': new Set(),
  'connected': new Set(),
  'disconnected': new Set(),
  'connect_error': new Set(),
};

function ensureSocket(token: string): Socket {
  if (socket && currentToken === token) return socket;

  // Disconnect old socket if token changed (re-login)
  if (socket && currentToken !== token) {
    try { socket.disconnect(); } catch { /* noop */ }
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    listeners['connected'].forEach(fn => fn({ id: socket?.id }));
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
    listeners['disconnected'].forEach(fn => fn({ reason }));
  });

  socket.on('connect_error', (err) => {
    console.warn('🔌 Socket connect_error:', err.message);
    listeners['connect_error'].forEach(fn => fn({ message: err.message }));
  });

  socket.on('lead:new', (payload) => {
    console.log('🆕 lead:new event:', payload);
    listeners['lead:new'].forEach(fn => fn(payload));
  });

  return socket;
}

export const socketClient = {
  /**
   * Initialise (or re-use) the socket for the given supplier token.
   * Safe to call multiple times.
   */
  connect(token: string): void {
    ensureSocket(token);
  },

  /**
   * Disconnect the current socket (e.g. on logout).
   */
  disconnect(): void {
    if (socket) {
      try { socket.disconnect(); } catch { /* noop */ }
      socket = null;
      currentToken = null;
    }
  },

  /**
   * Subscribe to a socket event. Returns an unsubscribe function.
   */
  on(event: 'lead:new' | 'connected' | 'disconnected' | 'connect_error', fn: Listener): () => void {
    listeners[event]?.add(fn);
    // Make sure socket is connected if we have a token
    if (event === 'lead:new' && currentToken && socket) {
      // No-op; already connected
    }
    return () => {
      listeners[event]?.delete(fn);
    };
  },

  /**
   * Connection status helpers.
   */
  isConnected(): boolean {
    return !!socket?.connected;
  },
};

export default socketClient;
