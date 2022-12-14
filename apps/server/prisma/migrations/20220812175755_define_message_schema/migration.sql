-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editetAt" DATETIME NOT NULL,
    CONSTRAINT "Message_from_fkey" FOREIGN KEY ("from") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_to_fkey" FOREIGN KEY ("to") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
