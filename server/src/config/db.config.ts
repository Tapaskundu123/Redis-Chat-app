import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString || "");
const adapter = new PrismaPg(client);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "query"],
});

export default prisma;
