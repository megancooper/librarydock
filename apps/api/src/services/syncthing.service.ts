import type { SyncStatus, SyncDevice, SyncFolder, AddDeviceInput, AddFolderInput } from '../types';

// Config - can be overridden per request or from user settings
type SyncthingConfig = {
  baseUrl: string;
  apiKey: string;
};

const getDefaultConfig = (): SyncthingConfig => ({
  baseUrl: process.env.SYNCTHING_URL || 'http://localhost:8385',
  apiKey: process.env.SYNCTHING_API_KEY || '',
});

// Generic request helper
const syncthingRequest = async <T>(
  endpoint: string,
  config: SyncthingConfig = getDefaultConfig(),
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': config.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Syncthing API error: ${response.statusText} - ${errorText}`);
  }

  return response.json() as Promise<T>;
};

export const getSyncStatus = async (config?: SyncthingConfig): Promise<SyncStatus> => {
  try {
    const cfg = config || getDefaultConfig();
    const [system, connections] = await Promise.all([
      syncthingRequest<{ myID: string }>('/rest/system/status', cfg),
      syncthingRequest<{ connections: Record<string, unknown> }>('/rest/system/connections', cfg),
    ]);

    return {
      connected: true,
      deviceId: system.myID,
      lastSync: new Date().toISOString(),
      activeConnections: Object.keys(connections.connections).length,
    };
  } catch {
    return {
      connected: false,
      deviceId: null,
      lastSync: null,
      activeConnections: 0,
    };
  }
};

export const getSyncDevices = async (config?: SyncthingConfig): Promise<SyncDevice[]> => {
  try {
    const result = await syncthingRequest<{ devices: SyncDevice[] }>(
      '/rest/config',
      config || getDefaultConfig()
    );
    return result.devices;
  } catch {
    return [];
  }
};

export const addSyncDevice = async (
  input: AddDeviceInput,
  config?: SyncthingConfig
): Promise<SyncDevice> => {
  const cfg = config || getDefaultConfig();
  const currentConfig = await syncthingRequest<{ devices: SyncDevice[] }>('/rest/config', cfg);

  const newDevice: SyncDevice = {
    deviceID: input.deviceId,
    name: input.name,
    addresses: input.addresses || ['dynamic'],
    autoAcceptFolders: input.autoAcceptFolders ?? false,
  };

  currentConfig.devices.push(newDevice);

  await syncthingRequest('/rest/config', cfg, {
    method: 'PUT',
    body: JSON.stringify(currentConfig),
  });

  return newDevice;
};

export const getSyncFolders = async (config?: SyncthingConfig): Promise<SyncFolder[]> => {
  try {
    const result = await syncthingRequest<{ folders: SyncFolder[] }>(
      '/rest/config',
      config || getDefaultConfig()
    );
    return result.folders;
  } catch {
    return [];
  }
};

export const addSyncFolder = async (
  input: AddFolderInput,
  config?: SyncthingConfig
): Promise<SyncFolder> => {
  const cfg = config || getDefaultConfig();
  const currentConfig = await syncthingRequest<{ folders: SyncFolder[] }>('/rest/config', cfg);

  const newFolder: SyncFolder = {
    id: input.id,
    label: input.label,
    path: input.path,
    devices: input.devices || [],
    type: input.type || 'sendreceive',
  };

  currentConfig.folders.push(newFolder);

  await syncthingRequest('/rest/config', cfg, {
    method: 'PUT',
    body: JSON.stringify(currentConfig),
  });

  return newFolder;
};

export const triggerSync = async (config?: SyncthingConfig): Promise<void> => {
  const cfg = config || getDefaultConfig();
  const folders = await getSyncFolders(cfg);

  await Promise.all(
    folders.map((folder) =>
      syncthingRequest(`/rest/db/scan?folder=${folder.id}`, cfg, { method: 'POST' })
    )
  );
};
