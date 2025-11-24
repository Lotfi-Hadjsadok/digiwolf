-- Convert enum column to text
-- First, alter the column type from enum to text
ALTER TABLE "leads" 
  ALTER COLUMN "category" TYPE TEXT 
  USING "category"::TEXT;

-- Convert enum values to lowercase kebab-case format
UPDATE "leads" 
SET "category" = LOWER(REPLACE("category", '_', '-'));

-- Drop the enum type (only if no other tables use it)
DROP TYPE IF EXISTS "BusinessCategory";

