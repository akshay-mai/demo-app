-- Run this SQL manually in pgAdmin or psql if migration fails
-- Connect to PostgreSQL and run:

CREATE DATABASE kyc_demo;

\c kyc_demo;

CREATE TABLE IF NOT EXISTS "User" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "email"       TEXT NOT NULL UNIQUE,
  "password"    TEXT NOT NULL,
  "gender"      TEXT,
  "dateOfBirth" TEXT,
  "phone"       TEXT,
  "address"     TEXT,
  "city"        TEXT,
  "state"       TEXT,
  "country"     TEXT,
  "pincode"     TEXT,
  "occupation"  TEXT,
  "nationality" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
