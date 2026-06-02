import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Course, generateUniqueSlug, type CourseStatus } from "../models/Course.js";

const VALID_STATUSES: CourseStatus[] = ["draft", "published", "archived"];

function parsePrice(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

// Subjects arrive over multipart as a JSON string (or a repeated field => array).
// Returns undefined when the field was not sent at all.
function parseSubjects(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  let arr: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "") return [];
    try {
      arr = JSON.parse(trimmed);
    } catch {
      arr = trimmed.split(",");
    }
  }
  if (!Array.isArray(arr)) return undefined;
  return arr.map((s) => String(s).trim()).filter((s) => s.length > 0);
}

export class CourseController {
  // ---------- admin ----------

  static async list(_req: Request, res: Response) {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  }

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }
    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json(course);
  }

  static async create(req: Request, res: Response) {
    const { title, description, duration, level, category, status } = req.body ?? {};
    const file = req.file;
    const price = parsePrice(req.body?.price);
    const offerPriceRaw = req.body?.offerPrice;
    const offerPrice =
      offerPriceRaw === undefined || offerPriceRaw === "" ? undefined : parsePrice(offerPriceRaw);

    if (!title || !description) {
      res.status(400).json({ message: "title and description are required" });
      return;
    }
    if (price === undefined) {
      res.status(400).json({ message: "price is required and must be a non-negative number" });
      return;
    }
    if (offerPriceRaw !== undefined && offerPriceRaw !== "" && offerPrice === undefined) {
      res.status(400).json({ message: "offerPrice must be a non-negative number" });
      return;
    }
    if (!file) {
      res.status(400).json({ message: "image is required" });
      return;
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const slug = await generateUniqueSlug(title);

    const course = await Course.create({
      title,
      slug,
      description,
      imageUrl: file.path,
      price,
      offerPrice,
      duration,
      level,
      category,
      subjects: parseSubjects(req.body?.subjects) ?? [],
      status,
    });

    res.status(201).json(course);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }

    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const { title, description, duration, level, category, status } = req.body ?? {};

    if (title !== undefined) {
      if (title.trim() !== course.title) {
        course.title = title.trim();
        course.slug = await generateUniqueSlug(title);
      }
    }
    if (description !== undefined) course.description = description;
    if (duration !== undefined) course.duration = duration;
    if (level !== undefined) course.level = level;
    if (category !== undefined) course.category = category;

    if (req.body?.subjects !== undefined) {
      const subjects = parseSubjects(req.body.subjects);
      if (subjects) course.subjects = subjects;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      course.status = status;
    }

    if (req.body?.price !== undefined) {
      const price = parsePrice(req.body.price);
      if (price === undefined) {
        res.status(400).json({ message: "price must be a non-negative number" });
        return;
      }
      course.price = price;
    }

    if (req.body?.offerPrice !== undefined) {
      if (req.body.offerPrice === "" || req.body.offerPrice === null) {
        course.offerPrice = undefined;
      } else {
        const offerPrice = parsePrice(req.body.offerPrice);
        if (offerPrice === undefined) {
          res.status(400).json({ message: "offerPrice must be a non-negative number" });
          return;
        }
        course.offerPrice = offerPrice;
      }
    }

    if (req.file) {
      course.imageUrl = req.file.path;
    }

    await course.save();
    res.status(200).json(course);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }
    const result = await Course.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json({ message: "Course deleted" });
  }

  // ---------- public ----------

  static async publicList(_req: Request, res: Response) {
    const courses = await Course.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.status(200).json(courses);
  }

  static async publicGetBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const course = await Course.findOne({ slug, status: "published" }).select("-__v");
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json(course);
  }
}
