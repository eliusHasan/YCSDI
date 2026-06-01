import { User } from "../models/User.js";

export async function ensureAdminFromEnv() {
  const userId = process.env.ADMIN_USER_ID;
  const password = process.env.ADMIN_PASSWORD;

  if (!userId || !password) return;

  const existing = await User.findOne({ userId });
  if (existing) {
    if (existing.role !== "admin") {
      console.warn(`User '${userId}' exists but is not an admin. Skipping auto-seed.`);
    }
    return;
  }

  await new User({ userId, password, role: "admin" }).save();
  console.log(`Auto-seeded admin '${userId}' from env.`);
}
