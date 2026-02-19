// Syncthing API types (external API response shapes)

export type SyncStatus = {
  connected: boolean;
  deviceId: string | null;
  lastSync: string | null;
  activeConnections: number;
};

export type SyncDevice = {
  deviceID: string;
  name: string;
  addresses: string[];
  autoAcceptFolders: boolean;
};

export type SyncFolder = {
  id: string;
  label: string;
  path: string;
  devices: Array<{ deviceID: string }>;
  type: 'sendreceive' | 'sendonly' | 'receiveonly';
};

export type AddDeviceInput = {
  deviceId: string;
  name: string;
  addresses?: string[];
  autoAcceptFolders?: boolean;
};

export type AddFolderInput = {
  id: string;
  label: string;
  path: string;
  devices?: Array<{ deviceID: string }>;
  type?: 'sendreceive' | 'sendonly' | 'receiveonly';
};

// Re-export Prisma types for convenience
export type { User, Settings, Ebook, Tag, SyncEvent } from '../../generated/prisma';
