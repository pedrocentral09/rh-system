-- AlterTable
ALTER TABLE "core_companies" ADD COLUMN "complement" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "email" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "municipalRegistration" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "phone" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "responsible" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "stateRegistration" TEXT;
ALTER TABLE "core_companies" ADD COLUMN "tradingName" TEXT;

-- AlterTable
ALTER TABLE "core_stores" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "complement" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "email" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "municipalRegistration" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "phone" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "responsible" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "stateRegistration" TEXT;
ALTER TABLE "core_stores" ADD COLUMN "tradingName" TEXT;
