/*
  Warnings:

  - Changed the type of `isCorrect` on the `QuizAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `correctCount` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCount` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."QuizAnswer" DROP CONSTRAINT "QuizAnswer_selectedOptionId_fkey";

-- AlterTable
ALTER TABLE "public"."QuizAnswer" ALTER COLUMN "selectedOptionId" DROP NOT NULL,
DROP COLUMN "isCorrect",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."QuizAttempt" ADD COLUMN     "correctCount" INTEGER NOT NULL,
ADD COLUMN     "totalCount" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "public"."Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
