import { Hono } from 'hono';
import { findSettingsByUserId, updateSettings, getSyncConfig } from '../services/settings.service';

const settingsRoutes = new Hono();

// GET /api/settings/:userId - Get settings for a user
settingsRoutes.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const settings = await findSettingsByUserId(userId);
    if (!settings) {
      return c.json({ error: 'Settings not found' }, 404);
    }
    return c.json({ data: settings });
  } catch (error) {
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// PUT /api/settings/:userId - Update settings for a user
settingsRoutes.put('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const settings = await updateSettings(userId, body);
    if (!settings) {
      return c.json({ error: 'Failed to update settings' }, 500);
    }
    return c.json({ data: settings });
  } catch (error) {
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// GET /api/settings/:userId/sync-config - Get sync configuration
settingsRoutes.get('/:userId/sync-config', async (c) => {
  try {
    const userId = c.req.param('userId');
    const config = await getSyncConfig(userId);
    if (!config) {
      return c.json({ error: 'Settings not found' }, 404);
    }
    return c.json({ data: config });
  } catch (error) {
    return c.json({ error: 'Failed to fetch sync config' }, 500);
  }
});

export { settingsRoutes };
