import { Hono } from 'hono';
import type { SyncStatus, SyncConfig } from '@librarydock/types';

const syncRouter = new Hono();

// Mock sync status
// In production, this would connect to Syncthing API
let currentSyncStatus: SyncStatus = {
  deviceId: 'device-001',
  deviceName: 'Main Device',
  lastSyncTime: new Date(),
  status: 'synced',
};

// Get sync status
syncRouter.get('/status', (c) => {
  return c.json(currentSyncStatus);
});

// Trigger sync
syncRouter.post('/trigger', async (c) => {
  try {
    // Update status to syncing
    currentSyncStatus = {
      ...currentSyncStatus,
      status: 'syncing',
    };

    // In production, this would trigger a Syncthing sync
    // For demo, simulate a sync operation
    setTimeout(() => {
      currentSyncStatus = {
        ...currentSyncStatus,
        status: 'synced',
        lastSyncTime: new Date(),
      };
    }, 3000);

    return c.json({ message: 'Sync triggered successfully' });
  } catch (error) {
    currentSyncStatus = {
      ...currentSyncStatus,
      status: 'error',
      error: String(error),
    };
    return c.json({ error: 'Sync failed' }, 500);
  }
});

// Get Syncthing config
syncRouter.get('/config', (c) => {
  const config: Partial<SyncConfig> = {
    syncthingUrl: process.env.SYNCTHING_URL || 'http://localhost:8384',
    deviceId: process.env.SYNCTHING_DEVICE_ID || 'device-001',
    folderId: process.env.SYNCTHING_FOLDER_ID || 'librarydock',
  };

  return c.json(config);
});

// Update Syncthing config
syncRouter.post('/config', async (c) => {
  try {
    const config: SyncConfig = await c.req.json();

    // In production, validate and save config to database
    // For now, just acknowledge receipt
    return c.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    return c.json({ error: 'Invalid configuration' }, 400);
  }
});

// Get sync devices
syncRouter.get('/devices', (c) => {
  // In production, fetch from Syncthing API
  const devices = [
    {
      id: 'device-001',
      name: 'Main Device',
      type: 'web' as const,
      lastSeen: new Date(),
      isOnline: true,
    },
  ];

  return c.json(devices);
});

// Syncthing webhook endpoint
syncRouter.post('/webhook', async (c) => {
  try {
    const event = await c.req.json();

    console.log('Received Syncthing event:', event);

    // Handle different Syncthing events
    // In production, process sync events and update status
    return c.json({ message: 'Webhook received' });
  } catch (error) {
    return c.json({ error: 'Invalid webhook payload' }, 400);
  }
});

export default syncRouter;
