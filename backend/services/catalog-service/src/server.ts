import fastify from "fastify";
import fastifySensible from "@fastify/sensible";
import crypto from "node:crypto";
import { getCollection, serializeProduct, mapFrontendProductType } from "@artisan-haven/database";
import type { Product, ProductType, Category, ProductNutrition } from "@artisan-haven/database";

type SortDirection = 1 | -1;
type Sort = Record<string, SortDirection>;

const app = fastify({ logger: true });

app.register(fastifySensible);

app.get("/catalog/products", async (request, reply) => {
  const query = request.query as Record<string, string>;
  const filter: Record<string, unknown> = {};

  if (query.product_type) {
    const mappedType = mapFrontendProductType(query.product_type);
    if (mappedType) {
      filter.productType = mappedType;
    }
  }

  if (query.is_featured === "true") filter.isFeatured = true;
  if (query.is_best_seller === "true") filter.isBestSeller = true;
  if (query.in_stock === "true") filter.stockQuantity = { $gt: 0 };

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: "i" };
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
    ];
  }

  if (query.min_price || query.max_price) {
    filter.price = {};
    if (query.min_price) (filter.price as Record<string, unknown>).$gte = Number(query.min_price);
    if (query.max_price) (filter.price as Record<string, unknown>).$lte = Number(query.max_price);
  }

  const sort: Sort = {};
  switch (query.sort) {
    case "price_asc": sort.price = 1; break;
    case "price_desc": sort.price = -1; break;
    case "popular": sort.isBestSeller = -1; break;
    default: sort.createdAt = -1;
  }

  const limit = Math.min(Number(query.limit) || 50, 100);
  const skip = Math.max(Number(query.offset) || 0, 0);

  const productsCol = await getCollection<Product>("products");
  const products = await productsCol
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await productsCol.countDocuments(filter);

  return {
    data: products.map(serializeProduct),
    total,
    limit,
    offset: skip,
  };
});

app.get("/catalog/products/:slug", async (request, reply) => {
  const { slug } = request.params as { slug: string };
  const productsCol = await getCollection<Product>("products");
  const product = await productsCol.findOne({ slug });

  if (!product) {
    throw app.httpErrors.notFound("Product not found");
  }

  return { data: serializeProduct(product) };
});

// ─── Seed / Admin Endpoints ──────────────────────────────────────────────────

app.post("/catalog/products", async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  const products = Array.isArray(body) ? body : [body];

  const now = new Date();
  const inserted: Array<Record<string, unknown>> = [];

  for (const item of products) {
    let productType: ProductType;
    const rawType = item.productType || item.product_type;
    if (rawType === "ART_CRAFTS" || rawType === "art_crafts") productType = "ART_CRAFTS";
    else if (rawType === "HEALTHY_FOOD" || rawType === "healthy_food") productType = "HEALTHY_FOOD";
    else if (rawType === "CAKES" || rawType === "cakes") productType = "CAKES";
    else productType = "ART_CRAFTS";

    const id = (item.id as string) || crypto.randomUUID();
    const slug = (item.slug as string) || id;

    const nutritionRaw = item.nutritional_info || item.nutrition || item.nutritionInfo;
    let nutrition: ProductNutrition | undefined;
    if (nutritionRaw && typeof nutritionRaw === "object") {
      const n = nutritionRaw as Record<string, unknown>;
      nutrition = {
        calories: Number(n.calories) || undefined,
        proteinGram: parseGram(n.protein),
        carbsGram: parseGram(n.carbs),
        fatGram: parseGram(n.fat),
        fiberGram: parseGram(n.fiber),
        sugarGram: parseGram(n.sugar),
      };
    }

    let category: Category | undefined;
    const catRaw = item.category;
    if (catRaw && typeof catRaw === "object") {
      const c = catRaw as Record<string, unknown>;
      category = {
        id: (c.id as string) || crypto.randomUUID(),
        name: (c.name as string) || "",
        slug: (c.slug as string) || "",
      };
    }

    const product: Product = {
      id,
      slug,
      name: (item.name || item.product_name || "") as string,
      description: (item.description as string) || undefined,
      shortDescription: (item.short_description || item.shortDescription as string) || undefined,
      price: Number(item.price) || 0,
      compareAtPrice: item.compare_at_price || item.compareAtPrice ? Number(item.compare_at_price || item.compareAtPrice) : undefined,
      productType,
      featuredImage: (item.featured_image || item.featuredImage || item.image || "") as string,
      images: (item.images as string[]) || [],
      categoryId: category?.id,
      category,
      stockQuantity: Number(item.stock_quantity ?? item.stockQuantity ?? 0),
      isFeatured: Boolean(item.is_featured ?? item.isFeatured),
      isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller),
      sustainabilityScore: item.sustainability_score || item.sustainabilityScore ? Number(item.sustainability_score || item.sustainabilityScore) : undefined,
      nutrition,
      ingredients: (item.ingredients as string[]) || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const productsCol = await getCollection<Product>("products");
    await productsCol.updateOne(
      { id: product.id },
      { $set: product },
      { upsert: true }
    );

    const catCol = await getCollection<Category>("categories");
    if (category) {
      await catCol.updateOne(
        { id: category.id },
        { $set: category },
        { upsert: true }
      );
    }

    inserted.push(serializeProduct(product));
  }

  reply.code(201);
  return { data: inserted.length === 1 ? inserted[0] : inserted };
});

function parseGram(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const str = String(value).replace(/[^0-9.]/g, "");
  return str ? Number(str) : undefined;
}

const port = Number(process.env.CATALOG_SERVICE_PORT ?? 4101);
await app.listen({ port, host: "0.0.0.0" });
