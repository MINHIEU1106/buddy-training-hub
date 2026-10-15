const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

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
    "HV79", "HV82", "HV83", "HV84", "HV85"
  ],
  7: ["HV31", "HV32", "HV33", "HV34", "HV39", "HV40", "HV41", "HV42", "HV43", "HV44"],
  8: ["HV45", "HV46", "HV47", "HV56", "HV57", "HV58", "HV59", "HV60", "HV61", "HV80"],
  9: ["HV62", "HV63", "HV64", "HV65", "HV86", "HV87", "HV88", "HV89", "HV90", "HV91"],
  10: ["HV66", "HV67", "HV68", "HV69", "HV70", "HV71", "HV72", "HV73", "HV74"]
};

const NEW_STUDENTS_GROUP_9 = [
  { studentCode: "HV86", fullName: "Hoàng Thị Hải Yến", title: "Thư ký chuyên môn", department: "Ban trợ lý – Thư ký" },
  { studentCode: "HV87", fullName: "Giáp Thị Hoài Anh", title: "Thư ký chuyên môn", department: "Ban trợ lý – Thư ký" },
  { studentCode: "HV88", fullName: "Đặng Ánh Dương", title: "Thư ký chuyên môn", department: "Ban trợ lý – Thư ký" },
  { studentCode: "HV89", fullName: "Đào Thị Thu Hương", title: "Thư ký chuyên môn", department: "Ban trợ lý – Thư ký" },
  { studentCode: "HV90", fullName: "Nguyễn Châu Anh", title: "Thư ký chuyên môn", department: "Ban trợ lý – Thư ký" },
  { studentCode: "HV91", fullName: "Trần Thị Mỹ Nhân", title: "Thư ký kinh doanh", department: "Ban trợ lý – Thư ký" }
];

async function main() {
  console.log("=== BẮT ĐẦU CẬP NHẬT 10 NHÓM VÀ TẠO 6 HỌC VIÊN MỚI ===");

  const course = await prisma.course.findFirst();
  if (!course) {
    throw new Error("Không tìm thấy khoá học nào trong DB!");
  }
  console.log(`Khoá học: ${course.name} (ID: ${course.id})`);

  // 1. Upsert 6 new students
  console.log("\n1. Tạo/cập nhật 6 thư ký mới (HV86 - HV91):");
  for (const s of NEW_STUDENTS_GROUP_9) {
    const existing = await prisma.student.findUnique({
      where: {
        courseId_studentCode: {
          courseId: course.id,
          studentCode: s.studentCode
        }
      }
    });

    if (!existing) {
      const created = await prisma.student.create({
        data: {
          courseId: course.id,
          studentCode: s.studentCode,
          fullName: s.fullName,
          title: s.title,
          department: s.department,
          managementLevel: "Cán bộ quản lý",
          groupNumber: 9,
          status: "ACTIVE"
        }
      });
      console.log(`  + Đã tạo mới: ${created.studentCode} | ${created.fullName} -> Nhóm 9`);
    } else {
      await prisma.student.update({
        where: { id: existing.id },
        data: {
          fullName: s.fullName,
          title: s.title,
          department: s.department,
          groupNumber: 9,
          status: "ACTIVE"
        }
      });
      console.log(`  ~ Đã cập nhật: ${existing.studentCode} | ${existing.fullName} -> Nhóm 9`);
    }
  }

  // 2. Update groupNumber for all students
  console.log("\n2. Cập nhật nhóm (groupNumber 1-10) cho tất cả học viên:");
  let totalUpdated = 0;
  for (const [groupStr, codes] of Object.entries(GROUP_STUDENT_CODES)) {
    const gNum = parseInt(groupStr, 10);
    const res = await prisma.student.updateMany({
      where: {
        courseId: course.id,
        studentCode: { in: codes }
      },
      data: {
        groupNumber: gNum
      }
    });
    console.log(`  ✓ Nhóm ${gNum}: Cập nhật ${res.count} học viên (dự kiến ${codes.length})`);
    totalUpdated += res.count;
  }
  console.log(`Tổng cộng học viên cập nhật nhóm: ${totalUpdated}`);

  // 3. Export to students_cache.json
  const allStudents = await prisma.student.findMany({
    where: { courseId: course.id },
    orderBy: { studentCode: "asc" }
  });
  console.log(`\n3. Đang xuất ${allStudents.length} học viên ra students_cache.json...`);
  fs.writeFileSync("students_cache.json", JSON.stringify(allStudents, null, 2), "utf8");
  console.log("✓ Đã ghi file students_cache.json thành công!");

  // 4. In bảng tóm tắt 10 nhóm
  console.log("\n=== TỔNG KẾT 10 NHÓM TRONG HỆ THỐNG ===");
  for (let g = 1; g <= 10; g++) {
    const members = allStudents.filter(s => s.groupNumber === g);
    console.log(`Nhóm ${g} (${members.length} người): ${members.map(m => m.studentCode).join(", ")}`);
  }
}

main()
  .catch((err) => {
    console.error("Lỗi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma["$disconnect"]();
  });
