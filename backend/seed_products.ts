import fs from "node:fs";
import path from "node:path";
import { prisma } from "@artisan-haven/database";

async function seed() {
  const localPath = path.resolve("./artisan_haven.products.json");
  const parentPath = path.resolve("../artisan_haven.products.json");
  const jsonPath = fs.existsSync(localPath) ? localPath : parentPath;
  console.log(`Reading products from ${jsonPath}...`);
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log(`Found ${data.length} products. Inserting into PostgreSQL...`);

  for (const item of data) {
    let categoryId = undefined;
    if (item.category) {
      const catId = item.category.id || item.categoryId || `cat-${item.category.slug}`;
      await prisma.category.upsert({
        where: { id: catId },
        update: {
          name: item.category.name,
          slug: item.category.slug,
        },
        create: {
          id: catId,
          name: item.category.name,
          slug: item.category.slug,
        },
      });
      categoryId = catId;
    }

    const createdAt = item.createdAt?.$date ? new Date(item.createdAt.$date) : new Date();
    const updatedAt = item.updatedAt?.$date ? new Date(item.updatedAt.$date) : new Date();

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description || null,
        shortDescription: item.shortDescription || null,
        price: Number(item.price),
        compareAtPrice: item.compareAtPrice !== null && item.compareAtPrice !== undefined ? Number(item.compareAtPrice) : null,
        productType: item.productType || "ART_CRAFTS",
        featuredImage: item.featuredImage,
        images: item.images || [],
        categoryId,
        stockQuantity: Number(item.stockQuantity ?? 0),
        isFeatured: Boolean(item.isFeatured),
        isBestSeller: Boolean(item.isBestSeller),
        sustainabilityScore: item.sustainabilityScore !== null && item.sustainabilityScore !== undefined ? Number(item.sustainabilityScore) : null,
        ingredients: item.ingredients || [],
        createdAt,
        updatedAt,
      },
      create: {
        id: item.id || undefined,
        slug: item.slug,
        name: item.name,
        description: item.description || null,
        shortDescription: item.shortDescription || null,
        price: Number(item.price),
        compareAtPrice: item.compareAtPrice !== null && item.compareAtPrice !== undefined ? Number(item.compareAtPrice) : null,
        productType: item.productType || "ART_CRAFTS",
        featuredImage: item.featuredImage,
        images: item.images || [],
        categoryId,
        stockQuantity: Number(item.stockQuantity ?? 0),
        isFeatured: Boolean(item.isFeatured),
        isBestSeller: Boolean(item.isBestSeller),
        sustainabilityScore: item.sustainabilityScore !== null && item.sustainabilityScore !== undefined ? Number(item.sustainabilityScore) : null,
        ingredients: item.ingredients || [],
        createdAt,
        updatedAt,
      },
    });

    if (item.nutrition) {
      await prisma.productNutrition.upsert({
        where: { productId: product.id },
        update: {
          calories: item.nutrition.calories ?? null,
          proteinGram: item.nutrition.proteinGram ?? null,
          carbsGram: item.nutrition.carbsGram ?? null,
          fatGram: item.nutrition.fatGram ?? null,
          fiberGram: item.nutrition.fiberGram ?? null,
          sugarGram: item.nutrition.sugarGram ?? null,
        },
        create: {
          productId: product.id,
          calories: item.nutrition.calories ?? null,
          proteinGram: item.nutrition.proteinGram ?? null,
          carbsGram: item.nutrition.carbsGram ?? null,
          fatGram: item.nutrition.fatGram ?? null,
          fiberGram: item.nutrition.fiberGram ?? null,
          sugarGram: item.nutrition.sugarGram ?? null,
        },
      });
    }
  }

  console.log("Successfully imported all products into SQL!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
