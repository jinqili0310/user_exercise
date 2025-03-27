-- CreateIndex
CREATE INDEX "Exercise_isPublic_createdAt_idx" ON "Exercise"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Exercise_creatorId_createdAt_idx" ON "Exercise"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "Exercise_name_description_idx" ON "Exercise"("name", "description");
