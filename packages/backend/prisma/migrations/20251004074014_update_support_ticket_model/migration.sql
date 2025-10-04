/*
  Warnings:

  - Made the column `category` on table `support_tickets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "category" SET NOT NULL;
