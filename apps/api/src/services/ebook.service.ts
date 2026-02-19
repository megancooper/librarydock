import { db } from './db.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { Ebook, Tag, ReadingProgress } from '@prisma/client';

// Supported ebook formats
const SUPPORTED_FORMATS = ['epub', 'pdf', 'mobi', 'azw3', 'fb2', 'txt'];

// =====================
// Type Definitions
// =====================

export type EbookWithRelations = Ebook & {
  tags: Tag[];
  readingProgress: ReadingProgress[];
};

export type CreateEbookInput = {
  userId: string;
  filename: string;
  format: string;
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
};

export type UpdateEbookInput = {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  coverPath?: string;
  syncStatus?: string;
  lastSyncAt?: Date;
  fileHash?: string;
  tags?: string[];
};

export type ReadingProgressInput = {
  currentPage?: number;
  totalPages?: number;
  percentage?: number;
  cfi?: string;
  deviceId?: string;
};

export type ScanResult = {
  added: number;
  removed: number;
  unchanged: number;
  errors: string[];
};

// =====================
// Pure Functions
// =====================

const getFileExtension = (filename: string): string =>
  path.extname(filename).toLowerCase().slice(1);

const isEbookFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return SUPPORTED_FORMATS.includes(ext);
};

const computeFileHash = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

const extractTitleFromFilename = (filename: string): string => {
  const name = path.basename(filename, path.extname(filename));
  return name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
};

// =====================
// Library Path Helpers
// =====================

export const getLibraryPath = async (userId: string): Promise<string> => {
  const settings = await db.settings.findUnique({
    where: { userId },
  });
  return settings?.libraryPath || './library';
};

export const getEbookFilePath = async (userId: string, filename: string): Promise<string> => {
  const libraryPath = await getLibraryPath(userId);
  return path.resolve(libraryPath, filename);
};

// =====================
// Ebook Queries
// =====================

export const findAllEbooks = async (userId: string): Promise<EbookWithRelations[]> =>
  db.ebook.findMany({
    where: { userId },
    include: { tags: true, readingProgress: true },
    orderBy: { updatedAt: 'desc' },
  });

export const findEbookById = async (
  id: string,
  userId?: string
): Promise<EbookWithRelations | null> => {
  if (userId) {
    return db.ebook.findFirst({
      where: { id, userId },
      include: { tags: true, readingProgress: true },
    });
  }
  return db.ebook.findUnique({
    where: { id },
    include: { tags: true, readingProgress: true },
  });
};

export const findEbookByFilename = async (
  filename: string,
  userId: string
): Promise<EbookWithRelations | null> =>
  db.ebook.findFirst({
    where: { filename, userId },
    include: { tags: true, readingProgress: true },
  });

export const createEbook = async (input: CreateEbookInput): Promise<EbookWithRelations> => {
  const { tags, ...ebookData } = input;

  return db.ebook.create({
    data: {
      ...ebookData,
      syncStatus: 'synced',
      tags: tags
        ? {
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          }
        : undefined,
    },
    include: { tags: true, readingProgress: true },
  });
};

export const updateEbook = async (
  id: string,
  userId: string,
  input: UpdateEbookInput
): Promise<EbookWithRelations | null> => {
  // Verify ownership
  const ebook = await findEbookById(id, userId);
  if (!ebook) return null;

  const { tags, ...updateData } = input;

  return db.ebook.update({
    where: { id },
    data: {
      ...updateData,
      tags: tags
        ? {
            set: [],
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          }
        : undefined,
    },
    include: { tags: true, readingProgress: true },
  });
};

export const deleteEbook = async (id: string, userId: string): Promise<boolean> => {
  // Verify ownership
  const ebook = await findEbookById(id, userId);
  if (!ebook) return false;

  await db.ebook.delete({ where: { id } });
  return true;
};

// =====================
// Reading Progress
// =====================

export const getReadingProgress = async (
  ebookId: string,
  userId: string
): Promise<ReadingProgress | null> =>
  db.readingProgress.findUnique({
    where: {
      userId_ebookId: { userId, ebookId },
    },
  });

export const updateReadingProgress = async (
  ebookId: string,
  userId: string,
  data: ReadingProgressInput
): Promise<ReadingProgress> =>
  db.readingProgress.upsert({
    where: {
      userId_ebookId: { userId, ebookId },
    },
    create: {
      userId,
      ebookId,
      ...data,
      lastReadAt: new Date(),
    },
    update: {
      ...data,
      lastReadAt: new Date(),
    },
  });

// =====================
// Library Scanning
// =====================

export const scanLibrary = async (userId: string): Promise<ScanResult> => {
  const results: ScanResult = {
    added: 0,
    removed: 0,
    unchanged: 0,
    errors: [],
  };

  // Log scan start
  await db.syncEvent.create({
    data: {
      type: 'scan_started',
      details: JSON.stringify({ userId }),
    },
  });

  try {
    const libraryPath = await getLibraryPath(userId);

    // Ensure library directory exists
    try {
      await fs.access(libraryPath);
    } catch {
      await fs.mkdir(libraryPath, { recursive: true });
      return results;
    }

    // Get all files in library
    const files = await fs.readdir(libraryPath);
    const ebookFiles = files.filter(isEbookFile);

    // Get existing ebooks from database
    const existingEbooks = await db.ebook.findMany({
      where: { userId },
      select: { id: true, filename: true, fileHash: true },
    });
    const existingFilenames = new Set(existingEbooks.map((e) => e.filename));

    // Process each file in the library
    for (const filename of ebookFiles) {
      try {
        const filePath = path.join(libraryPath, filename);
        const stats = await fs.stat(filePath);

        if (existingFilenames.has(filename)) {
          // File exists in DB - check if it changed
          const existing = existingEbooks.find((e) => e.filename === filename);
          if (existing?.fileHash) {
            const currentHash = await computeFileHash(filePath);
            if (currentHash !== existing.fileHash) {
              // File changed - update hash
              await db.ebook.update({
                where: { id: existing.id },
                data: {
                  fileHash: currentHash,
                  fileSize: stats.size,
                  syncStatus: 'synced',
                  lastSyncAt: new Date(),
                },
              });
            }
          }
          results.unchanged++;
        } else {
          // New file - add to database
          const format = getFileExtension(filename);
          const title = extractTitleFromFilename(filename);
          const fileHash = await computeFileHash(filePath);

          await createEbook({
            userId,
            filename,
            format,
            fileSize: stats.size,
            fileHash,
            title,
          });

          results.added++;

          await db.syncEvent.create({
            data: {
              type: 'file_added',
              details: JSON.stringify({ filename, userId }),
            },
          });
        }
      } catch (error) {
        results.errors.push(`Error processing ${filename}: ${error}`);
      }
    }

    // Remove entries for files that no longer exist
    for (const ebook of existingEbooks) {
      if (!ebookFiles.includes(ebook.filename)) {
        await db.ebook.delete({ where: { id: ebook.id } });
        results.removed++;

        await db.syncEvent.create({
          data: {
            type: 'file_removed',
            details: JSON.stringify({ filename: ebook.filename, userId }),
          },
        });
      }
    }

    // Log scan completion
    await db.syncEvent.create({
      data: {
        type: 'scan_completed',
        details: JSON.stringify({ ...results, userId }),
      },
    });
  } catch (error) {
    results.errors.push(`Library scan error: ${error}`);

    await db.syncEvent.create({
      data: {
        type: 'sync_error',
        details: JSON.stringify({ error: String(error), userId }),
      },
    });
  }

  return results;
};

// =====================
// Tags
// =====================

export const addTagToEbook = async (
  ebookId: string,
  userId: string,
  tagName: string,
  tagColor?: string
): Promise<EbookWithRelations | null> => {
  // Verify ownership
  const ebook = await findEbookById(ebookId, userId);
  if (!ebook) return null;

  // Find or create tag
  const tag = await db.tag.upsert({
    where: { name: tagName },
    create: { name: tagName, color: tagColor },
    update: tagColor ? { color: tagColor } : {},
  });

  // Connect tag to ebook
  return db.ebook.update({
    where: { id: ebookId },
    data: {
      tags: { connect: { id: tag.id } },
    },
    include: { tags: true, readingProgress: true },
  });
};

export const removeTagFromEbook = async (
  ebookId: string,
  userId: string,
  tagId: string
): Promise<EbookWithRelations | null> => {
  // Verify ownership
  const ebook = await findEbookById(ebookId, userId);
  if (!ebook) return null;

  return db.ebook.update({
    where: { id: ebookId },
    data: {
      tags: { disconnect: { id: tagId } },
    },
    include: { tags: true, readingProgress: true },
  });
};

export const findAllTags = async (): Promise<(Tag & { _count: { ebooks: number } })[]> =>
  db.tag.findMany({
    include: { _count: { select: { ebooks: true } } },
    orderBy: { name: 'asc' },
  });
