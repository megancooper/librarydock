import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Resolve database path - use absolute path to apps/api/dev.db
// process.cwd() is the workspace root when running via nx serve
const dbPath = path.resolve(process.cwd(), 'apps/api/dev.db');

console.log('📁 Database path:', dbPath);

// Create libSQL adapter for SQLite
const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
