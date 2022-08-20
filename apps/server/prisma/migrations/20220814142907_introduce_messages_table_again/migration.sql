-- CreateTable
CREATE TABLE "VolatileMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUsername" TEXT NOT NULL,
    "toUsername" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VolatileMessage_toUsername_fkey" FOREIGN KEY ("toUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
