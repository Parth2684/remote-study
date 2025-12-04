/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "token" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_token_key" ON "Instructor"("token");
