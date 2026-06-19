import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For Supabase/Vercel: set DIRECT_URL to the direct connection (port 5432)
    // and DATABASE_URL to the transaction pooler (port 6543) with ?pgbouncer=true
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
