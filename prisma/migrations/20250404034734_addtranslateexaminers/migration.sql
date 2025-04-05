-- CreateTable
CREATE TABLE "_UserTranslateProblems" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserTranslateProblems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserTranslateProblems_B_index" ON "_UserTranslateProblems"("B");

-- AddForeignKey
ALTER TABLE "_UserTranslateProblems" ADD CONSTRAINT "_UserTranslateProblems_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTranslateProblems" ADD CONSTRAINT "_UserTranslateProblems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
