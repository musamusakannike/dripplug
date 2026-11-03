import mongoose from "mongoose";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { User } from "../src/models/User";
import { Coupon } from "../src/models/Coupon";
import { Order } from "../src/models/Order";
import { Review, recomputeProductRating } from "../src/models/Review";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, SAMPLE_VERIFIED_REVIEWS } from "../src/lib/sample-data";

const MONGODB_URI = process.env.MONGODB_URI;

async function runSeed() {
  if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI environment variable is required to run the seed script.");
    console.error("Example: MONGODB_URI='mongodb+srv://...' pnpm seed");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // 1. Upsert Admin & Sample Customer Users
  const adminUser = await User.findOneAndUpdate(
    { email: "admin@dripplug.com.ng" },
    {
      firebaseUid: "seed_admin_uid_dripplug",
      name: "Dripplug Campus Admin",
      email: "admin@dripplug.com.ng",
      phone: "08140003747",
      role: "admin",
      savedAddresses: [
        {
          hostel: "Sanusi Hostel, Tanke",
          room: "Room B12",
          landmark: "Opposite Tipper Garage",
          isDefault: true,
        },
      ],
    },
    { upsert: true, new: true }
  );
  console.log(`Admin user ready: ${adminUser.email} (role: ${adminUser.role})`);

  // 2. Seed Categories
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of SAMPLE_CATEGORIES) {
    const saved = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        order: cat.order,
      },
      { upsert: true, new: true }
    );
    categoryMap.set(cat.slug, saved._id as mongoose.Types.ObjectId);
  }
  console.log(`Seeded ${categoryMap.size} categories.`);

  // 3. Seed 22 Sample Products across all categories
  const createdProducts: mongoose.Document[] = [];
  for (const prod of SAMPLE_PRODUCTS) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) {
      throw new Error(`Category slug not found for product: ${prod.categorySlug}`);
    }

    const savedProd = await Product.findOneAndUpdate(
      { slug: prod.slug },
      {
        ...prod,
        category: categoryId,
      },
      { upsert: true, new: true }
    );
    createdProducts.push(savedProd);
  }
  console.log(`Seeded ${createdProducts.length} products across clothing categories.`);

  // 4. Seed Sample Coupons
  await Coupon.findOneAndUpdate(
    { code: "UNILORIN10" },
    {
      code: "UNILORIN10",
      type: "percent",
      value: 10,
      minOrder: 10000,
      expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 180 days
      usageLimit: 500,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await Coupon.findOneAndUpdate(
    { code: "FRESHERS2K" },
    {
      code: "FRESHERS2K",
      type: "fixed",
      value: 2000,
      minOrder: 15000,
      expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      usageLimit: 200,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log("Seeded coupons: UNILORIN10 (10% off), FRESHERS2K (₦2,000 off).");

  // 5. Seed Verified Buyer Orders + Reviews so homepage & product reviews work out of the box
  for (let i = 0; i < SAMPLE_VERIFIED_REVIEWS.length; i++) {
    const sampleRev = SAMPLE_VERIFIED_REVIEWS[i];
    const targetProduct = createdProducts[i % createdProducts.length] as unknown as {
      _id: mongoose.Types.ObjectId;
      slug: string;
      name: string;
      images: string[];
      basePrice: number;
    };

    const reviewer = await User.findOneAndUpdate(
      { email: `student${i + 1}@unilorin.edu.ng` },
      {
        firebaseUid: `seed_student_uid_${i + 1}`,
        name: sampleRev.userName,
        email: `student${i + 1}@unilorin.edu.ng`,
        phone: `0810000000${i + 1}`,
        role: "customer",
      },
      { upsert: true, new: true }
    );

    const seedOrder = await Order.findOneAndUpdate(
      { orderNumber: `DP-SEED0${i + 1}` },
      {
        orderNumber: `DP-SEED0${i + 1}`,
        user: reviewer._id,
        items: [
          {
            productId: targetProduct._id,
            slug: targetProduct.slug,
            name: targetProduct.name,
            image: targetProduct.images[0],
            size: "L",
            color: "Black",
            sku: `SEED-SKU-${i + 1}`,
            unitPrice: targetProduct.basePrice,
            quantity: 1,
          },
        ],
        subtotal: targetProduct.basePrice,
        deliveryFee: 0,
        discount: 0,
        total: targetProduct.basePrice,
        deliveryPoint: {
          id: "old_park",
          name: "Old Park",
          fee: 0,
          estimatedTime: "Same day (2 – 4 hrs)",
        },
        deliveryAddress: {
          customerName: reviewer.name,
          phone: reviewer.phone,
          email: reviewer.email,
        },
        status: "delivered",
        paymentStatus: "paid",
        paystackReference: `ref_seed_order_0${i + 1}`,
        paidAt: new Date(),
        statusHistory: [
          { status: "paid", note: "Seeded verified order", timestamp: new Date() },
          { status: "delivered", note: "Delivered at Old Park", timestamp: new Date() },
        ],
      },
      { upsert: true, new: true }
    );

    await Review.findOneAndUpdate(
      { product: targetProduct._id, user: reviewer._id },
      {
        product: targetProduct._id,
        user: reviewer._id,
        userName: reviewer.name,
        order: seedOrder._id,
        rating: sampleRev.rating,
        comment: sampleRev.comment,
        status: "published",
      },
      { upsert: true, new: true }
    );

    await recomputeProductRating(targetProduct._id);
  }

  console.log("Seeded verified student orders and reviews.");
  await mongoose.disconnect();
  console.log("Database seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
