import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ebookRoutes } from './routes/ebook.routes';
import { syncRoutes } from './routes/sync.routes';
import { userRoutes } from './routes/user.routes';
import { settingsRoutes } from './routes/settings.routes';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.route('/api/ebooks', ebookRoutes);
app.route('/api/sync', syncRoutes);
app.route('/api/users', userRoutes);
app.route('/api/settings', settingsRoutes);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5656;

console.log(`🚀 LibraryDock API server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
