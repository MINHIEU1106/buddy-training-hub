const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const assigns = await prisma.assignment.findMany();
  for (const a of assigns) {
    if (a.title.includes("90%") || (a.description && a.description.includes("90%"))) {
      const newTitle = a.title.replace(/90%/g, "98%");
      const newDesc = a.description ? a.description.replace(/90%/g, "98%") : a.description;
      await prisma.assignment.update({
        where: { id: a.id },
        data: { title: newTitle, description: newDesc },
      });
      console.log("Updated assignment in DB:", newTitle);
    }
  }
  await prisma.$disconnect();
}

main().catch(console.error);
