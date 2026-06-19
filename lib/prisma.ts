import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = (process.env.DATABASE_URL || "").replace(
    /[?&]sslmode=\w+/g,
    ""
  );

  const needsSsl =
    (process.env.DATABASE_URL || "").includes("supabase") ||
    (process.env.DATABASE_URL || "").includes("sslmode");

  const pool = new pg.Pool({
    connectionString,
    ...(needsSsl && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
