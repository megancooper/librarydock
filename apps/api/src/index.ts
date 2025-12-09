import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ebooksRouter from './routes/ebooks';
import syncRouter from './routes/sync';

const app = new Hono();

// Middleware
app.use('*', cors());

// Routes
app.route('/api/ebooks', ebooksRouter);
app.route('/api/sync', syncRouter);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (c) => {
  return c.json({
    name: 'LibraryDock API',
    version: '0.1.0',
    description: 'Backend API for LibraryDock ebook management and sync',
  });
});

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 LibraryDock API Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
