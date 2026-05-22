@'
-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "pzwDistrict" TEXT;

-- AlterTable
ALTER TABLE "LakeSubmission" ADD COLUMN     "pzwDistrict" TEXT;
'@ | Set-Content -Encoding UTF8 "prisma\migrations\20260520105118_add_pzw_district_to_lakes\migration.sql"