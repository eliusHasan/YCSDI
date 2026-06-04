import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
import { Course } from "../models/Course.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { Enrollment } from "../models/Enrollment.js";
import { Institute } from "../models/Institute.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";

interface ApprovalEnrollmentInput {
  courseId: string;
  session?: string;
}

const ADMIN_EDITABLE_FIELDS = [
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
  "status",
  "banned",
] as const;

export class AdminController {
  static async getAllStudents(_req: Request, res: Response) {
    const students = await Student.find()
      .populate("instituteId", "name code")
      .populate("preferredInstituteId", "name code")
      .populate("preferredCourseId", "title slug")
      .populate("userId", "userId role")
      .sort({ createdAt: -1 });
    res.status(200).json(students);
  }

  static async approveStudent(req: Request, res: Response) {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
      res.status(400).json({ message: "Invalid student id" });
      return;
    }

    const { userId, password, instituteId, enrollments, session } = req.body ?? {};

    if (!userId || !password) {
      res.status(400).json({ message: "userId and password are required" });
      return;
    }
    if (!instituteId || !isValidObjectId(instituteId)) {
      res.status(400).json({ message: "Valid instituteId is required" });
      return;
    }
    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      res.status(400).json({ message: "At least one enrollment is required" });
      return;
    }

    const courseIds: string[] = [];
    for (const e of enrollments as ApprovalEnrollmentInput[]) {
      if (!e?.courseId || !isValidObjectId(e.courseId)) {
        res.status(400).json({ message: "Each enrollment must have a valid courseId" });
        return;
      }
      courseIds.push(e.courseId);
    }
    if (new Set(courseIds).size !== courseIds.length) {
      res.status(400).json({ message: "Duplicate courseIds in enrollments" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    if (student.status === "approved") {
      res.status(409).json({ message: "Student is already approved" });
      return;
    }

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      res.status(400).json({ message: "Institute not found" });
      return;
    }

    const foundCourses = await Course.countDocuments({ _id: { $in: courseIds } });
    if (foundCourses !== courseIds.length) {
      res.status(400).json({ message: "One or more courses not found" });
      return;
    }

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      res.status(409).json({ message: "User ID already exists" });
      return;
    }

    const user = await User.create({ userId, password, role: "student", refId: student._id });

    try {
      student.status = "approved";
      student.instituteId = institute._id as typeof student.instituteId;
      student.userId = user._id as typeof student.userId;
      await student.save();

      // Allocate unique roll & registration numbers per enrollment.
      const baseCount = await Enrollment.countDocuments();
      const enrollmentDocs = await Enrollment.insertMany(
        (enrollments as ApprovalEnrollmentInput[]).map((e, i) => ({
          studentId: student._id,
          courseId: e.courseId,
          instituteId: institute._id,
          session: e.session ?? session ?? undefined,
          rollNo: (1000 + baseCount + i + 1).toString(),
          registrationNo: (100000 + baseCount + i + 1).toString(),
        })),
      );

      const populated = await Student.findById(student._id)
        .populate("instituteId", "name code")
        .populate("userId", "userId role");

      res.status(200).json({
        message: "Student approved successfully",
        student: populated,
        enrollments: enrollmentDocs,
        credentials: { userId: user.userId, role: user.role },
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  static async rejectStudent(req: Request, res: Response) {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
      res.status(400).json({ message: "Invalid student id" });
      return;
    }
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    student.status = "rejected";
    await student.save();
    res.status(200).json({ message: "Student application rejected" });
  }

  static async patchStudent(req: Request, res: Response) {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
      res.status(400).json({ message: "Invalid student id" });
      return;
    }

    const body = req.body ?? {};
    const rejectedFields = Object.keys(body).filter(
      (k) => !(ADMIN_EDITABLE_FIELDS as readonly string[]).includes(k),
    );
    if (rejectedFields.length > 0) {
      res.status(400).json({
        message: `Cannot edit via this endpoint: ${rejectedFields.join(", ")}`,
      });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    for (const key of ADMIN_EDITABLE_FIELDS) {
      if (body[key] !== undefined) {
        (student as unknown as Record<string, unknown>)[key] = body[key];
      }
    }
    await student.save();

    const populated = await Student.findById(student._id)
      .populate("instituteId", "name code")
      .populate("userId", "userId role");
    res.status(200).json(populated);
  }

  static async deleteStudent(req: Request, res: Response) {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
      res.status(400).json({ message: "Invalid student id" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Cascade
    if (student.userId) await User.deleteOne({ _id: student.userId });
    await Promise.all([
      Certificate.deleteMany({ studentId: student._id }),
      RegistrationCard.deleteMany({ studentId: student._id }),
      AdmitCard.deleteMany({ studentId: student._id }),
      Marksheet.deleteMany({ studentId: student._id }),
    ]);
    await Enrollment.deleteMany({ studentId: student._id });
    await Student.deleteOne({ _id: student._id });

    res.status(200).json({ message: "Student and all related records deleted" });
  }
}
