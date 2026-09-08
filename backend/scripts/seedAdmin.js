import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = (process.env.SUPER_ADMIN_EMAIL || "admin@healthwise.com").toLowerCase().trim();
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || "AdminSecurePassword123!";

  console.log(`Checking Super Admin account for email: ${email}...`);

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { role: "super_admin" }
        ]
      }
    });

    if (existingAdmin) {
      console.log(`[SEED NOTICE] Super Admin already exists (ID: ${existingAdmin.id}, Email: ${existingAdmin.email}, Role: ${existingAdmin.role}). Skipping seed.`);
      await prisma.$disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "super_admin",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    console.log(`[SEED SUCCESS] Initial Super Admin created successfully!`);
    console.log(`User ID: ${newAdmin.id} | Email: ${newAdmin.email} | Role: ${newAdmin.role}`);
  } catch (err) {
    console.error("[SEED ERROR] Failed to seed Super Admin:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
