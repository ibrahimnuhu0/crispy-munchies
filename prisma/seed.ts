import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Small Pack",
    slug: "small-pack",
    description: "Fresh, crunchy plantain chips — perfect for a quick snack.",
    packSize: "100g",
    price: 500,
    stock: 50,
    imageUrl: "/products/small-pack.jpeg",
    isAvailable: true,
  },
  {
    name: "Medium Pack",
    slug: "medium-pack",
    description: "Our most popular size — great for sharing or solo snacking.",
    packSize: "250g",
    price: 1200,
    stock: 30,
    imageUrl: "/products/medium-pack.jpeg",
    isAvailable: true,
  },
  {
    name: "Family Pack",
    slug: "family-pack",
    description: "The big one. Stock up for the house.",
    packSize: "500g",
    price: 2000,
    stock: 15,
    imageUrl: "/products/family-pack.jpeg",
    isAvailable: true,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  await prisma.deliveryFee.createMany({
    data: [
      { state: "Niger", city: "Minna", fee: 500, isDefault: false },
      { state: "FCT", city: "Abuja", fee: 2000, isDefault: false },
      { state: "Other", city: null, fee: 3000, isDefault: true },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete: products upserted, delivery fees ensured.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });