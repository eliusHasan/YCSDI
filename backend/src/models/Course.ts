import { Schema, model, type Document } from "mongoose";

export type CourseStatus = "draft" | "published" | "archived";

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: number;
  offerPrice?: number;
  duration?: string;
  level?: string;
  category?: string;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    duration: { type: String, trim: true },
    level: { type: String, trim: true },
    category: { type: String, trim: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  },
  { timestamps: true },
);

export const Course = model<ICourse>("Course", courseSchema);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "course";
  let candidate = root;
  let counter = 1;
  while (await Course.exists({ slug: candidate })) {
    counter += 1;
    candidate = `${root}-${counter}`;
  }
  return candidate;
}
