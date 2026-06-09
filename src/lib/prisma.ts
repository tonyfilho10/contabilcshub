import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

function createPrismaClient() {
  // Parse the URL manually so special chars in password ($, !) aren't mishandled
  const raw = process.env.DATABASE_URL!
  const u = new URL(raw)

  const pool = new pg.Pool({
    host:     u.hostname,
    port:     Number(u.port) || 6543,
    database: u.pathname.replace(/^\//, ""),
    user:     decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl:      { rejectUnauthorized: false },
    max:      1, // pgbouncer transaction mode
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
