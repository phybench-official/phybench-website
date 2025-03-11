/*
  Warnings:

  - The primary key for the `AiEvaluation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AiEvaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `AiPerformance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AiPerformance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `aiEvaluationId` column on the `AiPerformance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProblemVariable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProblemVariable` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `problemId` on the `AiPerformance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `problemId` on the `ProblemVariable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "AiPerformance" DROP CONSTRAINT "AiPerformance_aiEvaluationId_fkey";

-- DropForeignKey
ALTER TABLE "AiPerformance" DROP CONSTRAINT "AiPerformance_problemId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemVariable" DROP CONSTRAINT "ProblemVariable_problemId_fkey";

-- AlterTable
ALTER TABLE "AiEvaluation" DROP CONSTRAINT "AiEvaluation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AiPerformance" DROP CONSTRAINT "AiPerformance_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "problemId",
ADD COLUMN     "problemId" INTEGER NOT NULL,
DROP COLUMN "aiEvaluationId",
ADD COLUMN     "aiEvaluationId" INTEGER,
ADD CONSTRAINT "AiPerformance_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Problem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProblemVariable" DROP CONSTRAINT "ProblemVariable_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "problemId",
ADD COLUMN     "problemId" INTEGER NOT NULL,
ADD CONSTRAINT "ProblemVariable_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ProblemVariable" ADD CONSTRAINT "ProblemVariable_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPerformance" ADD CONSTRAINT "AiPerformance_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPerformance" ADD CONSTRAINT "AiPerformance_aiEvaluationId_fkey" FOREIGN KEY ("aiEvaluationId") REFERENCES "AiEvaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
