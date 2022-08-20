/*
  Warnings:

  - Added the required column `content` to the `VolatileMessage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VolatileMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUsername" TEXT NOT NULL,
    "toUsername" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VolatileMessage_toUsername_fkey" FOREIGN KEY ("toUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VolatileMessage" ("createdAt", "fromUsername", "id", "toUsername") SELECT "createdAt", "fromUsername", "id", "toUsername" FROM "VolatileMessage";
DROP TABLE "VolatileMessage";
ALTER TABLE "new_VolatileMessage" RENAME TO "VolatileMessage";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
