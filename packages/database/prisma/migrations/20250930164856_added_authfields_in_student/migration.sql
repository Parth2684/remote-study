/*
  Warnings:

  - Added the required column `provider` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'CREDENTIALS');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "provider" "Provider" NOT NULL,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
