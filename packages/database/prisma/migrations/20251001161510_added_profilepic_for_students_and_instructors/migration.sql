/*
  Warnings:

  - Added the required column `profilePic` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePic` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "profilePic" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "profilePic" TEXT NOT NULL;
