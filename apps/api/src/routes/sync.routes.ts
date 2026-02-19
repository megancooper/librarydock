import { Hono } from 'hono';
import {
  getSyncStatus,
  getSyncDevices,
  addSyncDevice,
  getSyncFolders,
  addSyncFolder,
  triggerSync,
} from '../services/syncthing.service';

const syncRoutes = new Hono();

// GET /api/sync/status - Get Syncthing connection status
syncRoutes.get('/status', async (c) => {
  try {
    const status = await getSyncStatus();
    return c.json({ data: status });
  } catch (error) {
    return c.json({ error: 'Failed to get sync status' }, 500);
  }
});

// GET /api/sync/devices - List connected devices
syncRoutes.get('/devices', async (c) => {
  try {
    const devices = await getSyncDevices();
    return c.json({ data: devices });
  } catch (error) {
    return c.json({ error: 'Failed to get devices' }, 500);
  }
});

// POST /api/sync/devices - Add a new device
syncRoutes.post('/devices', async (c) => {
  try {
    const body = await c.req.json();
    const device = await addSyncDevice(body);
    return c.json({ data: device }, 201);
  } catch (error) {
    console.log(error);
    return c.json({ error: 'Failed to add device' }, 500);
  }
});

// GET /api/sync/folders - List synced folders
syncRoutes.get('/folders', async (c) => {
  try {
    const folders = await getSyncFolders();
    return c.json({ data: folders });
  } catch (error) {
    console.log(error);
    return c.json({ error: 'Failed to get folders' }, 500);
  }
});

// POST /api/sync/folders - Add a folder to sync
syncRoutes.post('/folders', async (c) => {
  try {
    const body = await c.req.json();
    const folder = await addSyncFolder(body);
    return c.json({ data: folder }, 201);
  } catch (error) {
    console.log(error);
    return c.json({ error: 'Failed to add folder' }, 500);
  }
});

// POST /api/sync/trigger - Trigger manual sync
syncRoutes.post('/trigger', async (c) => {
  try {
    await triggerSync();
    return c.json({ message: 'Sync triggered successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to trigger sync' }, 500);
  }
});

export { syncRoutes };
