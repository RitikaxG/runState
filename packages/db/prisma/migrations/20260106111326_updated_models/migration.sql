/*
  Warnings:

  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `time_added` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `WebsiteTicks` table. All the data in the column will be lost.
  - You are about to drop the column `region_id` on the `WebsiteTicks` table. All the data in the column will be lost.
  - You are about to drop the column `response_time_ms` on the `WebsiteTicks` table. All the data in the column will be lost.
  - You are about to drop the column `website_id` on the `WebsiteTicks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Website` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Website` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionId` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTimeMs` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Website" DROP CONSTRAINT "Website_user_id_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteTicks" DROP CONSTRAINT "WebsiteTicks_region_id_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteTicks" DROP CONSTRAINT "WebsiteTicks_website_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "Website" DROP COLUMN "time_added",
DROP COLUMN "user_id",
ADD COLUMN     "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WebsiteTicks" DROP COLUMN "created_at",
DROP COLUMN "region_id",
DROP COLUMN "response_time_ms",
DROP COLUMN "website_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "regionId" TEXT NOT NULL,
ADD COLUMN     "responseTimeMs" INTEGER NOT NULL,
ADD COLUMN     "websiteId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "tokenHash" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Website_url_key" ON "Website"("url");

-- CreateIndex
CREATE INDEX "WebsiteTicks_websiteId_idx" ON "WebsiteTicks"("websiteId");

-- CreateIndex
CREATE INDEX "WebsiteTicks_regionId_idx" ON "WebsiteTicks"("regionId");

-- CreateIndex
CREATE INDEX "WebsiteTicks_createdAt_idx" ON "WebsiteTicks"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteTicks" ADD CONSTRAINT "WebsiteTicks_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteTicks" ADD CONSTRAINT "WebsiteTicks_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
