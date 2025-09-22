/*
  Warnings:

  - Added the required column `description` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Classroom" ADD COLUMN     "description" TEXT NOT NULL;
