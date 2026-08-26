import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Create a Cohort
  const cohort = await prisma.cohort.upsert({
    where: { name: "Year 3 Surgical Residency" },
    update: {},
    create: {
      name: "Year 3 Surgical Residency",
    },
  });
  console.log(`✅ Cohort created: ${cohort.name} (ID: ${cohort.id})`);

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Clinical Lead User
  const lead = await prisma.user.upsert({
    where: { email: "lead@surgiskill.ai" },
    update: {},
    create: {
      email: "lead@surgiskill.ai",
      password: hashedPassword,
      name: "Dr. Alistair Sterling",
      role: "CLINICAL_LEAD",
    },
  });
  console.log(`✅ Clinical Lead created: ${lead.email}`);

  // 4. Create Faculty User
  const faculty = await prisma.user.upsert({
    where: { email: "faculty@surgiskill.ai" },
    update: {},
    create: {
      email: "faculty@surgiskill.ai",
      password: hashedPassword,
      name: "Dr. Sarah Jenkins",
      role: "FACULTY",
    },
  });
  console.log(`✅ Faculty Examiner created: ${faculty.email}`);

  // 5. Create Student User
  const student = await prisma.user.upsert({
    where: { email: "student@surgiskill.ai" },
    update: {},
    create: {
      email: "student@surgiskill.ai",
      password: hashedPassword,
      name: "Arthur Pendelton",
      role: "STUDENT",
      cohortId: cohort.id,
    },
  });
  console.log(`✅ Student created: ${student.email}`);

  // 6. Create OSCE Station and Rubric v1
  const station = await prisma.station.upsert({
    where: { name: "Interrupted Suture Technique" },
    update: {},
    create: {
      name: "Interrupted Suture Technique",
      description: "Demonstrate three simple interrupted sutures on a silicone pad. Ensure proper spacing (5mm) and flat knot throws without tearing tissue edges.",
      cohorts: {
        connect: [{ id: cohort.id }],
      },
      rubrics: {
        create: {
          version: 1,
          motionEfficiencyWeight: 0.4,
          checklistWeight: 0.6,
          active: true,
          checklistSteps: {
            create: [
              { sequenceOrder: 1, description: "Engage surgical mask and sterile gloves", penaltyPoints: 5 },
              { sequenceOrder: 2, description: "Position needle perpendicular at 90 degrees to practice pad", penaltyPoints: 10 },
              { sequenceOrder: 3, description: "Drive needle curved trajectory through tissue simulation", penaltyPoints: 10 },
              { sequenceOrder: 4, description: "Perform primary double throw knot tie", penaltyPoints: 10 },
              { sequenceOrder: 5, description: "Snug knot throw flat without micro-tearing pad", penaltyPoints: 5 },
            ],
          },
        },
      },
    },
  });
  console.log(`✅ OSCE Station & Rubric v1 created: ${station.name}`);

  console.log("🌱 Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
