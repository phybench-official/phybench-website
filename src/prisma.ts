import { PrismaClient } from "@prisma/client"
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || (
  process.env.NODE_ENV === "test" ? 
    new PrismaClient().$extends(withOptimize({
      apiKey: process.env.OPTIMIZE_API_KEY || "",
    }))
  :
  new PrismaClient()
)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma