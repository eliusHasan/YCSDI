import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../database/connect.js";
import { User } from "../models/User.js";

async function main() {
  const userId = process.env.ADMIN_USER_ID;
  const password = process.env.ADMIN_PASSWORD;

  if (!userId || !password) {
    console.error("ADMIN_USER_ID and ADMIN_PASSWORD must be set in backend/.env");
    process.exit(1);
  }

  await connectDatabase();
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB is not connected. Check MONGODB_URI.");
    process.exit(1);
  }

  const existing = await User.findOne({ userId });
  if (existing) {
    if (existing.role !== "admin") {
      console.error(`User '${userId}' exists but is not an admin (role=${existing.role}). Refusing to overwrite.`);
      process.exit(1);
    }
    console.log(`Admin '${userId}' already exists. Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const admin = new User({ userId, password, role: "admin" });
  await admin.save();
  console.log(`Created admin '${userId}'.`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Failed to seed admin:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
