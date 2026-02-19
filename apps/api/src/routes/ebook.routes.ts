import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { createReadStream, promises as fs } from 'fs';
import * as path from 'path';
import {
  findAllEbooks,
  findEbookById,
  findEbookByFilename,
  createEbook,
  updateEbook,
  deleteEbook,
  scanLibrary,
  getEbookFilePath,
  getReadingProgress,
  updateReadingProgress,
  addTagToEbook,
  removeTagFromEbook,
  findAllTags,
} from '../services/ebook.service';

const ebookRoutes = new Hono();

// =====================
// Library Scanning
// =====================

// POST /api/ebooks/scan - Scan library folder and sync with database
ebookRoutes.post('/scan', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const result = await scanLibrary(body.userId);
    return c.json({
      data: result,
      message: `Scan complete: ${result.added} added, ${result.removed} removed, ${result.unchanged} unchanged`,
    });
  } catch (error) {
    return c.json({ error: 'Failed to scan library' }, 500);
  }
});

// =====================
// Tags
// =====================

// GET /api/ebooks/tags - List all tags
ebookRoutes.get('/tags', async (c) => {
  try {
    const tags = await findAllTags();
    return c.json({ data: tags });
  } catch (error) {
    return c.json({ error: 'Failed to fetch tags' }, 500);
  }
});

// =====================
// Ebook CRUD
// =====================

// GET /api/ebooks - List all ebooks for a user
ebookRoutes.get('/', async (c) => {
  try {
    const userId = c.req.query('userId');
    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }
    const ebooks = await findAllEbooks(userId);
    return c.json({ data: ebooks });
  } catch (error) {
    return c.json({ error: 'Failed to fetch ebooks' }, 500);
  }
});

// GET /api/ebooks/:id - Get single ebook
ebookRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.query('userId');
    const ebook = await findEbookById(id, userId || undefined);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }
    return c.json({ data: ebook });
  } catch (error) {
    return c.json({ error: 'Failed to fetch ebook' }, 500);
  }
});

// GET /api/ebooks/:id/download - Download the actual ebook file
ebookRoutes.get('/:id/download', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    const ebook = await findEbookById(id, userId);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }

    const filePath = await getEbookFilePath(userId, ebook.filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return c.json({ error: 'File not found on disk' }, 404);
    }

    const stats = await fs.stat(filePath);
    const mimeTypes: Record<string, string> = {
      epub: 'application/epub+zip',
      pdf: 'application/pdf',
      mobi: 'application/x-mobipocket-ebook',
      azw3: 'application/vnd.amazon.ebook',
      fb2: 'application/x-fictionbook+xml',
      txt: 'text/plain',
    };

    c.header('Content-Type', mimeTypes[ebook.format] || 'application/octet-stream');
    c.header('Content-Disposition', `attachment; filename="${ebook.filename}"`);
    c.header('Content-Length', stats.size.toString());

    // Stream the file
    return stream(c, async (stream) => {
      const fileStream = createReadStream(filePath);
      for await (const chunk of fileStream) {
        await stream.write(chunk);
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to download ebook' }, 500);
  }
});

// POST /api/ebooks - Create ebook metadata (typically called after scan, or manual add)
ebookRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    if (!body.filename) {
      return c.json({ error: 'filename is required' }, 400);
    }
    if (!body.title) {
      return c.json({ error: 'title is required' }, 400);
    }
    if (!body.format) {
      return c.json({ error: 'format is required' }, 400);
    }

    // Check if already exists
    const existing = await findEbookByFilename(body.filename, body.userId);
    if (existing) {
      return c.json({ error: 'Ebook with this filename already exists' }, 409);
    }

    const ebook = await createEbook(body);
    return c.json({ data: ebook }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create ebook' }, 500);
  }
});

// PUT /api/ebooks/:id - Update ebook metadata
ebookRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const ebook = await updateEbook(id, body.userId, body);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }
    return c.json({ data: ebook });
  } catch (error) {
    return c.json({ error: 'Failed to update ebook' }, 500);
  }
});

// DELETE /api/ebooks/:id - Delete ebook metadata (file stays on disk)
ebookRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    const success = await deleteEbook(id, userId);
    if (!success) {
      return c.json({ error: 'Ebook not found' }, 404);
    }
    return c.json({ message: 'Ebook metadata deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete ebook' }, 500);
  }
});

// =====================
// Reading Progress
// =====================

// GET /api/ebooks/:id/progress - Get reading progress for an ebook
ebookRoutes.get('/:id/progress', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    // Verify ebook exists and belongs to user
    const ebook = await findEbookById(id, userId);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }

    const progress = await getReadingProgress(id, userId);
    return c.json({ data: progress || { percentage: 0 } });
  } catch (error) {
    return c.json({ error: 'Failed to fetch reading progress' }, 500);
  }
});

// PUT /api/ebooks/:id/progress - Update reading progress
ebookRoutes.put('/:id/progress', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    // Verify ebook exists and belongs to user
    const ebook = await findEbookById(id, body.userId);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }

    const progress = await updateReadingProgress(id, body.userId, {
      currentPage: body.currentPage,
      totalPages: body.totalPages,
      percentage: body.percentage,
      cfi: body.cfi,
      deviceId: body.deviceId,
    });

    return c.json({ data: progress });
  } catch (error) {
    return c.json({ error: 'Failed to update reading progress' }, 500);
  }
});

// =====================
// Tag Management
// =====================

// POST /api/ebooks/:id/tags - Add tag to ebook
ebookRoutes.post('/:id/tags', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    if (!body.tagName) {
      return c.json({ error: 'tagName is required' }, 400);
    }

    const ebook = await addTagToEbook(id, body.userId, body.tagName, body.tagColor);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }
    return c.json({ data: ebook });
  } catch (error) {
    return c.json({ error: 'Failed to add tag' }, 500);
  }
});

// DELETE /api/ebooks/:id/tags/:tagId - Remove tag from ebook
ebookRoutes.delete('/:id/tags/:tagId', async (c) => {
  try {
    const id = c.req.param('id');
    const tagId = c.req.param('tagId');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    const ebook = await removeTagFromEbook(id, userId, tagId);
    if (!ebook) {
      return c.json({ error: 'Ebook not found' }, 404);
    }
    return c.json({ data: ebook });
  } catch (error) {
    return c.json({ error: 'Failed to remove tag' }, 500);
  }
});

export { ebookRoutes };
