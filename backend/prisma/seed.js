// Run with: node prisma/seed.js
// Creates the first Admin user + sample records for testing

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Create Admin ──────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@zorvyn.io" },
    update: {},
    create: {
      name: "Zorvyn Admin",
      email: "admin@zorvyn.io",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ── 2. Create Analyst ─────────────────────────────────────────
  const analystPassword = await bcrypt.hash("Analyst@123", 10);

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@zorvyn.io" },
    update: {},
    create: {
      name: "Priya Analyst",
      email: "analyst@zorvyn.io",
      password: analystPassword,
      role: "ANALYST",
    },
  });
  console.log("✅ Analyst created:", analyst.email);

  // ── 3. Create Viewer ──────────────────────────────────────────
  const viewerPassword = await bcrypt.hash("Viewer@123", 10);

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@zorvyn.io" },
    update: {},
    create: {
      name: "Rahul Viewer",
      email: "viewer@zorvyn.io",
      password: viewerPassword,
      role: "VIEWER",
    },
  });
  console.log("✅ Viewer created:", viewer.email);

  // ── 4. Sample Transactions ────────────────────────────────────
  const sampleTransactions = [
    {
      userId: admin.id,
      amount: 150000.0,
      type: "INCOME",
      category: "Salary",
      date: new Date("2026-01-05"),
      description: "Monthly salary - January",
    },
    {
      userId: admin.id,
      amount: 45000.0,
      type: "EXPENSE",
      category: "Rent",
      date: new Date("2026-01-07"),
      description: "Office rent - January",
    },
    {
      userId: admin.id,
      amount: 12000.0,
      type: "EXPENSE",
      category: "Marketing",
      date: new Date("2026-01-15"),
      description: "Social media ads",
    },
    {
      userId: analyst.id,
      amount: 80000.0,
      type: "INCOME",
      category: "Consulting",
      date: new Date("2026-02-01"),
      description: "Client consulting fee",
    },
    {
      userId: analyst.id,
      amount: 8500.0,
      type: "EXPENSE",
      category: "Software",
      date: new Date("2026-02-10"),
      description: "SaaS tools subscription",
    },
    {
      userId: viewer.id,
      amount: 55000.0,
      type: "INCOME",
      category: "Salary",
      date: new Date("2026-03-01"),
      description: "Monthly salary - March",
    },
    {
      userId: viewer.id,
      amount: 18000.0,
      type: "EXPENSE",
      category: "Travel",
      date: new Date("2026-03-12"),
      description: "Client visit - Mumbai",
    },
    {
      userId: admin.id,
      amount: 200000.0,
      type: "INCOME",
      category: "Investment",
      date: new Date("2026-03-20"),
      description: "Q1 investment returns",
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`✅ ${sampleTransactions.length} sample transactions created`);

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────");
  console.log("Admin    → admin@zorvyn.io    / Admin@123");
  console.log("Analyst  → analyst@zorvyn.io  / Analyst@123");
  console.log("Viewer   → viewer@zorvyn.io   / Viewer@123");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
