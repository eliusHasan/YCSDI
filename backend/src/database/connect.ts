import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. API will start without MongoDB.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. API will continue running.");
    console.warn(error);
  }
}
