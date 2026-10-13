const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const NEW_STUDENTS = [
  {
    studentCode: "HV74",
    fullName: "Cao Thị Hè",
    title: "Thư ký hành chính",
    department: "Khối Công ty – Ban trợ lý – Thư ký",
    managementLevel: "Khối Công ty",
    email: "hect@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV75",
    fullName: "Nguyễn Thị Thu Trang",
    title: "Tổ trưởng QLCL khoa",
    department: "Khoa Xét nghiệm",
    managementLevel: "Khối Bệnh viện",
    email: "trangntt@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV76",
    fullName: "Phùng Văn Tú",
    title: "Phụ trách QL kỹ thuật",
    department: "Khoa Xét nghiệm",
    managementLevel: "Khối Bệnh viện",
    email: "tupv@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV77",
    fullName: "Nguyễn Thế Sơn",
    title: "Trưởng Phòng",
    department: "Phòng KHTH - QLCL",
    managementLevel: "Khối Bệnh viện",
    email: "sonnt1@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV78",
    fullName: "Phan Thị Mai Anh",
    title: "Tổ trưởng QLCL",
    department: "Phòng KHTH - QLCL",
    managementLevel: "Khối Bệnh viện",
    email: "anhptm@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV79",
    fullName: "Ngô Thị Kim Chung",
    title: "Trưởng bộ phận phát triển dịch vụ khách hàng",
    department: "Bộ phận Phát triển dịch vụ khách hàng",
    managementLevel: "Khối Bệnh viện",
    email: "chungntk@phuongdonghospital.vn",
    phone: null,
  },
  {
    studentCode: "HV80",
    fullName: "Trần Minh Hằng",
    title: "Trưởng/Phó bộ phận",
    department: "Viện dưỡng lão ASAHI – Bộ phận Cung ứng",
    managementLevel: "Viện dưỡng lão ASAHI",
    email: "Hangmi.triviet@gmail.com",
    phone: null,
  },
];

async function main() {
  const course = await prisma.course.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!course) {
    throw new Error("Không tìm thấy khóa học ACTIVE");
  }

  console.log(`Đang cập nhật ${NEW_STUDENTS.length} học viên bổ sung kèm Email vào khóa học: ${course.name}`);

  for (const st of NEW_STUDENTS) {
    const saved = await prisma.student.upsert({
      where: {
        courseId_studentCode: {
          courseId: course.id,
          studentCode: st.studentCode,
        },
      },
      update: {
        fullName: st.fullName,
        title: st.title,
        department: st.department,
        managementLevel: st.managementLevel,
        email: st.email,
      },
      create: {
        courseId: course.id,
        studentCode: st.studentCode,
        fullName: st.fullName,
        title: st.title,
        department: st.department,
        managementLevel: st.managementLevel,
        email: st.email,
        phone: st.phone,
        status: "ACTIVE",
      },
    });
    console.log(`✓ Đã cập nhật: ${saved.studentCode} - ${saved.fullName} | Email: ${saved.email}`);
  }

  const total = await prisma.student.count({ where: { courseId: course.id, status: "ACTIVE" } });
  console.log(`\n=== HOÀN TẤT! Tổng số học viên: ${total} học viên ===`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
