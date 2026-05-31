import type { Request, Response } from "express";
import { Certificate } from "../models/Certificate.js";
import { Enrollment } from "../models/Enrollment.js";
import { Student } from "../models/Student.js";

export class StudentController {
  static async me(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    if (req.user.role !== "student") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    if (!req.user.refId) {
      res.status(404).json({ message: "No student profile linked to this account" });
      return;
    }

    const student = await Student.findById(req.user.refId).populate("instituteId", "name code");
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }
    if (student.banned) {
      res.status(403).json({ message: "Account is suspended" });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate("courseId", "title slug imageUrl duration level category")
      .sort({ enrolledAt: -1 });

    const certificates = await Certificate.find({ studentId: student._id })
      .populate({ path: "courseId", select: "title slug" })
      .sort({ issuedAt: -1 });

    res.status(200).json({ student, enrollments, certificates });
  }
}
