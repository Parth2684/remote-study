/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenExpiry` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "tokenExpiry" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_token_key" ON "Student"("token");
