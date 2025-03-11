/*
  Warnings:

  - You are about to drop the column `aiResults` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `solution` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Made the column `answer` on table `Problem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tag` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProblemTag" AS ENUM ('MECHANICS', 'ELECTRICITY', 'THERMODYNAMICS', 'OPTICS', 'MODERN', 'ADVANCED', 'OTHER');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('PENDING', 'RETURNED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiName" AS ENUM ('DEEPSEEK', 'DEEPSEEK_R1', 'OTHER');

-- CreateEnum
CREATE TYPE "AiPerformanceTag" AS ENUM ('SUBMITTED', 'EVALUATION');

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "aiResults",
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "solution" TEXT NOT NULL,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" "ProblemStatus" NOT NULL,
ALTER COLUMN "answer" SET NOT NULL,
DROP COLUMN "tag",
ADD COLUMN     "tag" "ProblemTag" NOT NULL;

-- CreateTable
CREATE TABLE "ProblemVariable" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lowerBound" DOUBLE PRECISION NOT NULL,
    "upperBound" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProblemVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPerformance" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "aiName" "AiName" NOT NULL,
    "aiSolution" TEXT NOT NULL,
    "aiAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "tag" "AiPerformanceTag" NOT NULL,
    "aiEvaluationId" TEXT,
    "aiScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEvaluation" (
    "id" TEXT NOT NULL,
    "aiName" "AiName" NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProblemVariable" ADD CONSTRAINT "ProblemVariable_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPerformance" ADD CONSTRAINT "AiPerformance_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPerformance" ADD CONSTRAINT "AiPerformance_aiEvaluationId_fkey" FOREIGN KEY ("aiEvaluationId") REFERENCES "AiEvaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
