-- AlterTable: user layout preference for /recherche page
ALTER TABLE "User" ADD COLUMN "searchLayout" TEXT NOT NULL DEFAULT 'masonry-editorial';
