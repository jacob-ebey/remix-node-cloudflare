import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient;
}

export const prisma =
  typeof process === "undefined"
    ? (undefined as unknown as PrismaClient)
    : global.prismaClient || (global.prismaClient = new PrismaClient());
