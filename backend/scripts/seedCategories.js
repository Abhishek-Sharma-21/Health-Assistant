import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Diseases", slug: "diseases" },
  { name: "Wellness", slug: "wellness" },
  { name: "Nutrition", slug: "nutrition" },
  { name: "Mental Health", slug: "mental-health" },
  { name: "Fitness", slug: "fitness" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Preventive Care", slug: "preventive-care" },
  { name: "Women's Health", slug: "womens-health" },
  { name: "Children's Health", slug: "childrens-health" },
];

async function seedCategories() {
  let created = 0;
  let skipped = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      created++;
    } catch (err) {
      if (err.code === "P2002") {
        skipped++;
      } else {
        console.error(`Error seeding category "${cat.name}":`, err.message);
      }
    }
  }

  console.log(`\nCategory seeding complete: ${created} created/updated, ${skipped} skipped (already exist).`);
}

seedCategories()
  .catch((err) => {
    console.error("Category seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
