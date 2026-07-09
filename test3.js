const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = "postgresql://user:pass@localhost:5432/db";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}

try {
  const service = new PrismaService();
  console.log("Success with PrismaService class");
} catch (e) {
  console.error("Failed with PrismaService class", e);
}
