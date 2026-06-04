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

      const count = await Student.countDocuments();
      const year = new Date().getFullYear();
      const registrationId = `YCSDI-${year}-${(count + 1).toString().padStart(4, "0")}`;
      const serialNo = await generateSerialNo();

      const newStudent = new Student({
        ...pickAccepted(req.body ?? {}),
        ...(preferredInstituteId ? { preferredInstituteId } : {}),
        ...(preferredCourseId ? { preferredCourseId } : {}),
        photoUrl: file.path,
        serialNo,
        registrationId,
        status: "pending",
      });

      await newStudent.save();

      res.status(201).json({
        message: "Registration successful! Your application is pending review.",
        serialNo,
        registrationId,
        student: newStudent,
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
