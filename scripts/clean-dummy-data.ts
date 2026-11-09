import mongoose from "mongoose";
import { User } from "../src/models/User";
import { Product } from "../src/models/Product";
import { Order } from "../src/models/Order";
import { Review } from "../src/models/Review";
import { Cart } from "../src/models/Cart";
import { Transaction } from "../src/models/Transaction";
import { Coupon } from "../src/models/Coupon";
import { Newsletter } from "../src/models/Newsletter";
import { Category } from "../src/models/Category";

const MONGODB_URI = process.env.MONGODB_URI;

const isDryRun = process.argv.includes("--dry-run") || !process.argv.includes("--execute");

async function main() {
  if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI environment variable is required.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected successfully.\n`);

  // Target query for dummy seed users
  const dummyUserFilter = {
    $or: [
      { email: /^student\d+@unilorin\.edu\.ng$/i },
      { firebaseUid: /^seed_student_uid_/i },
    ],
  };

  // Inspect users
  const dummyUsers = await User.find(dummyUserFilter).select("name email role firebaseUid");
  const retainedUsers = await User.find({ $nor: [dummyUserFilter] }).select("name email role firebaseUid");

  // Inspect collections to wipe
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();
  const reviewCount = await Review.countDocuments();
  const cartCount = await Cart.countDocuments();
  const transactionCount = await Transaction.countDocuments();
  const couponCount = await Coupon.countDocuments();
  const newsletterCount = await Newsletter.countDocuments();
  const categoryCount = await Category.countDocuments();

  console.log(`================ DATABASE AUDIT ================`);
  console.log(`Mode: ${isDryRun ? "DRY-RUN (No changes applied)" : "LIVE EXECUTION"}\n`);

  console.log(`[USER COLLECTION]`);
  console.log(`  Dummy users to DELETE (${dummyUsers.length}):`);
  dummyUsers.forEach((u) => console.log(`    - ${u.name} <${u.email}> (${u.role})`));

  console.log(`\n  Users to RETAIN (${retainedUsers.length}):`);
  retainedUsers.forEach((u) => console.log(`    - ${u.name} <${u.email}> (${u.role})`));

  console.log(`\n[COLLECTIONS TO CLEAR]`);
  console.log(`  - Products:     ${productCount} documents to delete`);
  console.log(`  - Orders:       ${orderCount} documents to delete`);
  console.log(`  - Reviews:      ${reviewCount} documents to delete`);
  console.log(`  - Carts:        ${cartCount} documents to delete`);
  console.log(`  - Transactions: ${transactionCount} documents to delete`);
  console.log(`  - Coupons:      ${couponCount} documents to delete`);
  console.log(`  - Newsletter:   ${newsletterCount} documents to delete`);

  console.log(`\n[PRESERVED COLLECTIONS]`);
  console.log(`  - Categories:   ${categoryCount} documents preserved`);
  console.log(`================================================\n`);

  if (isDryRun) {
    console.log("Dry run finished. Run with '--execute' to perform the deletions.");
    await mongoose.disconnect();
    return;
  }

  console.log("Executing deletions...");

  const delUsers = await User.deleteMany(dummyUserFilter);
  const delProducts = await Product.deleteMany({});
  const delOrders = await Order.deleteMany({});
  const delReviews = await Review.deleteMany({});
  const delCarts = await Cart.deleteMany({});
  const delTransactions = await Transaction.deleteMany({});
  const delCoupons = await Coupon.deleteMany({});
  const delNewsletters = await Newsletter.deleteMany({});

  console.log("\nCleanup Report:");
  console.log(`  - Deleted ${delUsers.deletedCount} dummy users`);
  console.log(`  - Deleted ${delProducts.deletedCount} products`);
  console.log(`  - Deleted ${delOrders.deletedCount} orders`);
  console.log(`  - Deleted ${delReviews.deletedCount} reviews`);
  console.log(`  - Deleted ${delCarts.deletedCount} carts`);
  console.log(`  - Deleted ${delTransactions.deletedCount} transactions`);
  console.log(`  - Deleted ${delCoupons.deletedCount} coupons`);
  console.log(`  - Deleted ${delNewsletters.deletedCount} newsletter subscriptions`);

  await mongoose.disconnect();
  console.log("\nCleanup completed successfully!");
}

main().catch(async (err) => {
  console.error("Cleanup error:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
