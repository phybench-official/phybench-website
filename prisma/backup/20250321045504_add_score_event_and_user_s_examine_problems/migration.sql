-- CreateEnum
CREATE TYPE "ScoreEventTag" AS ENUM ('OFFER', 'SUBMIT', 'EXAMINE', 'DEBUG', 'PUNISH');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "offererEmail" TEXT,
ADD COLUMN     "offererId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ScoreEvent" (
    "id" SERIAL NOT NULL,
    "tag" "ScoreEventTag" NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserExamineProblems" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserExamineProblems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserExamineProblems_B_index" ON "_UserExamineProblems"("B");

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserExamineProblems" ADD CONSTRAINT "_UserExamineProblems_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserExamineProblems" ADD CONSTRAINT "_UserExamineProblems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
