import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL exists to prevent Prisma Client initialization crash
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/feastcraft?schema=public';
}

// Sanitize unencoded characters (such as '#' in password) in DATABASE_URL before Prisma initializes
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('#')) {
  const atIdx = process.env.DATABASE_URL.lastIndexOf('@');
  if (atIdx !== -1) {
    const credPart = process.env.DATABASE_URL.substring(0, atIdx);
    const hostPart = process.env.DATABASE_URL.substring(atIdx);
    if (credPart.includes('#')) {
      process.env.DATABASE_URL = credPart.replace(/#/g, '%23') + hostPart;
    }
  }
}

declare global {
  // Prevent multiple instances of Prisma Client in development (HMR / serverless reload)
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.DEBUG_PRISMA === 'true' ? ['error', 'warn'] : [],
  });
};

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;

