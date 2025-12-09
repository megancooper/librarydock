import { Hono } from 'hono';
import type { Ebook } from '@librarydock/types';

const ebooksRouter = new Hono();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const ebooks: Ebook[] = [];

// Get all ebooks
ebooksRouter.get('/', (c) => {
  return c.json(ebooks);
});

// Get single ebook
ebooksRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const ebook = ebooks.find((e) => e.id === id);

  if (!ebook) {
    return c.json({ error: 'Ebook not found' }, 404);
  }

  return c.json(ebook);
});

// Upload ebook
ebooksRouter.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['ebook'];

    if (!file || typeof file === 'string') {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Extract file information
    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

    // Validate file format
    const validFormats = ['epub', 'pdf', 'mobi', 'azw3', 'txt'];
    if (!validFormats.includes(fileExtension)) {
      return c.json({ error: 'Invalid file format' }, 400);
    }

    // Create ebook record
    const newEbook: Ebook = {
      id: `ebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      author: 'Unknown Author',
      format: fileExtension as Ebook['format'],
      filePath: `/ebooks/${fileName}`,
      fileSize: fileSize,
      addedAt: new Date(),
      lastModified: new Date(),
    };

    // In production, save the file to disk or cloud storage
    // For now, just store the metadata
    ebooks.push(newEbook);

    return c.json(newEbook, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Update ebook
ebooksRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const index = ebooks.findIndex((e) => e.id === id);

  if (index === -1) {
    return c.json({ error: 'Ebook not found' }, 404);
  }

  const updates = await c.req.json();
  ebooks[index] = {
    ...ebooks[index],
    ...updates,
    lastModified: new Date(),
  };

  return c.json(ebooks[index]);
});

// Delete ebook
ebooksRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const index = ebooks.findIndex((e) => e.id === id);

  if (index === -1) {
    return c.json({ error: 'Ebook not found' }, 404);
  }

  ebooks.splice(index, 1);
  return c.json({ message: 'Ebook deleted successfully' });
});

export default ebooksRouter;
