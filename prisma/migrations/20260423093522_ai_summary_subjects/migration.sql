-- DropForeignKey
ALTER TABLE "AiSummary" DROP CONSTRAINT "AiSummary_articleId_fkey";

-- AlterTable: make articleId nullable, add subjectKey
ALTER TABLE "AiSummary" ALTER COLUMN "articleId" DROP NOT NULL;
ALTER TABLE "AiSummary" ADD COLUMN "subjectKey" TEXT;

-- AddForeignKey (with nullable articleId)
ALTER TABLE "AiSummary" ADD CONSTRAINT "AiSummary_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex for the new unique constraint on subjectKey
CREATE UNIQUE INDEX "AiSummary_subjectKey_provider_model_key" ON "AiSummary"("subjectKey", "provider", "model");
