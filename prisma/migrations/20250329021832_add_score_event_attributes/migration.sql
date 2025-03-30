-- AlterTable
ALTER TABLE "ScoreEvent" ADD COLUMN     "problemNominated" TEXT,
ADD COLUMN     "problemRemark" TEXT,
ADD COLUMN     "problemScore" INTEGER,
ADD COLUMN     "problemStatus" "ProblemStatus";
