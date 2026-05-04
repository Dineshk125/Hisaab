import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️ Deleting all records in Account collection directly via Prisma raw command...");
  const result = await (prisma as any).$runCommandRaw({
    delete: "Account",
    deletes: [
      { q: {}, limit: 0 }
    ]
  });
  console.log("✅ Cleanup complete.", result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
