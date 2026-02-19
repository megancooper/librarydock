export type EbookFormat = 'epub' | 'pdf' | 'mobi' | 'azw3' | 'fb2' | 'txt';

export type SyncState = 'synced' | 'pending' | 'syncing' | 'error';

// Ebook metadata - actual files live in the library folder
export interface Ebook {
  id: string;
  userId: string;

  // File reference (filename only, not full path)
  filename: string;
  format: EbookFormat;
  fileSize: number;
  fileHash?: string;

  // Metadata
  title: string;
  author?: string;
  description?: string;
  coverPath?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;

  // Relations
  tags: Tag[];
  readingProgress?: ReadingProgress;

  // Sync
  syncStatus: SyncState;
  lastSyncAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  ebookId: string;
  currentPage?: number;
  totalPages?: number;
  percentage: number;
  cfi?: string; // EPUB CFI location for precise positioning
  lastReadAt: string;
  deviceId?: string;
}

export interface CreateEbookInput {
  userId: string;
  filename: string;
  format: EbookFormat;
  fileSize: number;
  fileHash?: string;
  title: string;
  author?: string;
  description?: string;
  coverPath?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  tags?: string[];
}

export interface UpdateEbookInput {
  title?: string;
  author?: string;
  description?: string;
  coverPath?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  tags?: string[];
}

export interface UpdateReadingProgressInput {
  currentPage?: number;
  totalPages?: number;
  percentage?: number;
  cfi?: string;
  deviceId?: string;
}

export interface ScanLibraryResult {
  added: number;
  removed: number;
  unchanged: number;
  errors: string[];
}

export interface EbookFilter {
  search?: string;
  format?: EbookFormat[];
  tags?: string[];
  author?: string;
  syncStatus?: SyncState;
}

export interface EbookListResponse {
  data: Ebook[];
  total: number;
  page: number;
  pageSize: number;
}
