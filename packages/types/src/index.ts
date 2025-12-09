export interface Ebook {
  id: string;
  title: string;
  author: string;
  format: 'epub' | 'pdf' | 'mobi' | 'azw3' | 'txt';
  filePath: string;
  fileSize: number;
  coverImage?: string;
  description?: string;
  addedAt: Date;
  lastModified: Date;
  tags?: string[];
  series?: string;
  seriesIndex?: number;
  publisher?: string;
  publishedDate?: Date;
  isbn?: string;
  language?: string;
}

export interface SyncStatus {
  deviceId: string;
  deviceName: string;
  lastSyncTime: Date;
  status: 'syncing' | 'synced' | 'error' | 'pending';
  error?: string;
}

export interface UploadProgress {
  ebookId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface SyncConfig {
  syncthingUrl: string;
  deviceId: string;
  folderId: string;
  apiKey: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'desktop';
  lastSeen: Date;
  isOnline: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  ebookIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  ebookId: string;
  deviceId: string;
  progress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  lastReadAt: Date;
}
