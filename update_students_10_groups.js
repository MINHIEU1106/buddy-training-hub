const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GROUP_STUDENT_CODES = {
  1: ["HV01", "HV02", "HV03", "HV04", "HV05", "HV18", "HV19"],
  2: ["HV20", "HV21", "HV22", "HV23", "HV24", "HV27", "HV75", "HV76"],
  3: ["HV06", "HV10", "HV11", "HV12", "HV13", "HV14", "HV15", "HV81"],
  4: ["HV07", "HV08", "HV09", "HV16", "HV17", "HV29", "HV30"],
  5: ["HV25", "HV26", "HV28", "HV77", "HV78"],
  6: [
    "HV35", "HV36", "HV37", "HV38", "HV48", "HV49",
    "HV50", "HV51", "HV52", "HV53", "HV54", "HV55",
    "HV79", "HV82", "HV83", "HV84", "HV85",
  ],
  7: ["HV31", "HV32", "HV33", "HV34", "HV39", "HV40", "HV41", "HV42", "HV43", "HV44"],
  8: ["HV45", "HV46", "HV47", "HV56", "HV57", "HV58", "HV59", "HV60", "HV61", "HV80"],
  9: ["HV62", "HV63", "HV64", "HV65", "HV86", "HV87", "HV88", "HV89", "HV90", "HV91"],
  10: ["HV66", "HV67", "HV68", "HV69", "HV70", "HV71", "HV72", "HV73", "HV74"],
};

async function main() {
  console.log("=== UPDATING STUDENT DB GROUP NUMBER TO 10 GROUPS ===");
  let updated = 0;
  for (const [grpStr, codes] of Object.entries(GROUP_STUDENT_CODES)) {
    const grpNum = parseInt(grpStr, 10);
    const res = await prisma.student.updateMany({
      where: { studentCode: { in: codes } },
      data: { groupNumber: grpNum }
    });
    console.log(`Group ${grpNum}: updated ${res.count} students`);
    updated += res.count;
  }
  console.log(`Total students updated: ${updated}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
