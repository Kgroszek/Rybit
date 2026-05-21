import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("postgresql://postgres.golklaeyesvyhenugirq:D1zzy-%40gency123!@aws-1-eu-central-2.pooler.supabase.com:5432/postgres");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});