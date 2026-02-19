/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `Ebook` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Ebook` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Ebook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "color" TEXT;

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "currentPage" INTEGER,
    "totalPages" INTEGER,
    "percentage" REAL NOT NULL DEFAULT 0,
    "cfi" TEXT,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingProgress_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "Ebook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ebook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileHash" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "coverPath" TEXT,
    "isbn" TEXT,
    "publisher" TEXT,
    "publishedDate" TEXT,
    "language" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ebook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ebook" ("author", "createdAt", "description", "fileSize", "format", "id", "isbn", "syncStatus", "title", "updatedAt", "userId") SELECT "author", "createdAt", "description", "fileSize", "format", "id", "isbn", "syncStatus", "title", "updatedAt", "userId" FROM "Ebook";
DROP TABLE "Ebook";
ALTER TABLE "new_Ebook" RENAME TO "Ebook";
CREATE INDEX "Ebook_userId_idx" ON "Ebook"("userId");
CREATE INDEX "Ebook_syncStatus_idx" ON "Ebook"("syncStatus");
CREATE UNIQUE INDEX "Ebook_userId_filename_key" ON "Ebook"("userId", "filename");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_ebookId_key" ON "ReadingProgress"("userId", "ebookId");
