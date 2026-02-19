export interface SyncStatus {
  connected: boolean;
  deviceId: string | null;
  lastSync: string | null;
  activeConnections: number;
}

export interface SyncDevice {
  deviceID: string;
  name: string;
  addresses: string[];
  autoAcceptFolders: boolean;
}

export interface SyncFolder {
  id: string;
  label: string;
  path: string;
  devices: Array<{ deviceID: string }>;
  type: 'sendreceive' | 'sendonly' | 'receiveonly';
}

export interface AddDeviceInput {
  deviceId: string;
  name: string;
  addresses?: string[];
  autoAcceptFolders?: boolean;
}

export interface AddFolderInput {
  id: string;
  label: string;
  path: string;
  devices?: Array<{ deviceID: string }>;
  type?: 'sendreceive' | 'sendonly' | 'receiveonly';
}

export interface SyncEvent {
  id: string;
  type:
    | 'sync_started'
    | 'sync_completed'
    | 'sync_error'
    | 'device_connected'
    | 'device_disconnected';
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SyncConfig {
  syncthingUrl: string;
  apiKey: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  libraryPath: string;
}
