import { PrismaClient } from "@prisma/client"
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || (
  process.env.NODE_ENV === "production" ? 
    new PrismaClient()
  :
  new PrismaClient().$extends(withOptimize({
    apiKey: process.env.OPTIMIZE_API_KEY || "",
  }))
)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma