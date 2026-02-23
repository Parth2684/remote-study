-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "documentName" TEXT,
ADD COLUMN     "documentSize" INTEGER,
ADD COLUMN     "documentType" TEXT,
ADD COLUMN     "documentUrl" TEXT;
