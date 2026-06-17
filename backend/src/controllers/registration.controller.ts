import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Course } from "../models/Course.js";
import { Institute } from "../models/Institute.js";
import { Student } from "../models/Student.js";
import { generateSerialNo } from "../utils/serial.js";

const ACCEPTED_FIELDS = [
  "fullName",
  "fatherName",
  "motherName",
  "gender",
  "dateOfBirth",
  "postOffice",
  "upazilla",
  "district",
  "nidPassport",
  "mobileNumber",
  "email",
  "message",
  "courseDuration",
  "session",
] as const;

function pickAccepted(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ACCEPTED_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") {
      out[key] = body[key];
    }
  }
  return out;
}

export class RegistrationController {
  static async registerStudent(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "Passport size photo is required" });
        return;
      }

      const { preferredInstituteId, preferredCourseId } = req.body ?? {};

      if (preferredInstituteId) {
        if (!isValidObjectId(preferredInstituteId) || !(await Institute.exists({ _id: preferredInstituteId }))) {
          res.status(400).json({ message: "Invalid institute selection" });
          return;
        }
      }
      if (preferredCourseId) {
        if (!isValidObjectId(preferredCourseId) || !(await Course.exists({ _id: preferredCourseId }))) {
          res.status(400).json({ message: "Invalid course selection" });
          return;
        }
      }

      const year = new Date().getFullYear();
      const prefix = `YCSDI-${year}-`;
      const baseFields = {
        ...pickAccepted(req.body ?? {}),
        ...(preferredInstituteId ? { preferredInstituteId } : {}),
        ...(preferredCourseId ? { preferredCourseId } : {}),
        photoUrl: file.path,
        status: "pending" as const,
      };

      // Allocate the next registrationId from the highest existing one for the
      // year (not the document count, which breaks after deletions), retrying on
      // a duplicate-key race for registrationId or serialNo.
      let saved: typeof Student.prototype | null = null;
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 6 && !saved; attempt += 1) {
        const latest = await Student.findOne({ registrationId: { $regex: `^${prefix}` } })
          .sort({ registrationId: -1 })
          .select("registrationId")
          .lean();
        let seq = 1;
        if (latest?.registrationId) {
          const parsed = Number.parseInt(latest.registrationId.slice(prefix.length), 10);
          if (Number.isFinite(parsed)) seq = parsed + 1;
        }
        const registrationId = `${prefix}${String(seq).padStart(4, "0")}`;
        const serialNo = await generateSerialNo();
        try {
          saved = await new Student({ ...baseFields, serialNo, registrationId }).save();
        } catch (err: any) {
          lastError = err;
          if (err?.code === 11000) continue; // collision -> recompute and retry
          throw err;
        }
      }
      if (!saved) throw lastError ?? new Error("Could not allocate a registration id");

      res.status(201).json({
        message: "Registration successful! Your application is pending review.",
        serialNo: saved.serialNo,
        registrationId: saved.registrationId,
        student: saved,
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      res.status(500).json({
        message: "Failed to register student",
        error: error.message,
      });
    }
  }
}
