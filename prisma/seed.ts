import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.category.upsert({
    where: {
      slug: 'uncategorized',
    },
    update: {},
    create: {
      title: 'Uncategorized',
      slug: 'uncategorized',
      description: 'System category',
      isSystem: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });