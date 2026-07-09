const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

console.log("Creating pool");
const pool = new Pool({ connectionString: "postgresql://user:pass@localhost:5432/db" });
console.log("Creating adapter");
const adapter = new PrismaPg(pool);
console.log("Creating client");
try {
  const prisma = new PrismaClient({ adapter });
  console.log("Success");
} catch (e) {
  console.error(e);
}
