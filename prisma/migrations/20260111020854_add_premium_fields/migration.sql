-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "searchesUsed" INTEGER NOT NULL DEFAULT 0,
    "searchesLimit" INTEGER NOT NULL DEFAULT 5,
    "paystackCustomerCode" TEXT,
    "paystackSubscriptionCode" TEXT,
    "subscriptionExpiresAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
