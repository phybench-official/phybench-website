-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "translatedContent" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "translatedSolution" TEXT NOT NULL DEFAULT '';
