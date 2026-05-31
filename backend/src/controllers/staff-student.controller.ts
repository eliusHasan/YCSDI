import type { Request, Response } from "express";
import { Certificate } from "../models/Certificate.js";
import { Enrollment } from "../models/Enrollment.js";
import { Staff, type IStaff } from "../models/Staff.js";
import { Student } from "../models/Student.js";

const EDITABLE_FIELDS = [
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

async function loadStaffProfile(req: Request): Promise<IStaff | null> {
  if (!req.user?.refId) return null;
  return Staff.findById(req.user.refId);
}

export class StaffStudentController {
  static async list(req: Request, res: Response) {
    const staff = await loadStaffProfile(req);
    if (!staff) {
      res.status(403).json({ message: "Staff profile not found for this account" });
      return;
    }

    const students = await Student.find({
      status: "approved",
      banned: false,
      instituteId: { $in: staff.instituteIds },
    })
      .populate("instituteId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  }

  static async getBySerial(req: Request, res: Response) {
    const staff = await loadStaffProfile(req);
    if (!staff) {
      res.status(403).json({ message: "Staff profile not found for this account" });
      return;
    }

    const student = await Student.findOne({
      registrationId: req.params.serial,
      banned: false,
      instituteId: { $in: staff.instituteIds },
    }).populate("instituteId", "name code");

    if (!student) {
      res.status(404).json({ message: "Student not found" });
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

  static async patch(req: Request, res: Response) {
    const staff = await loadStaffProfile(req);
    if (!staff) {
      res.status(403).json({ message: "Staff profile not found for this account" });
      return;
    }

    const student = await Student.findOne({
      registrationId: req.params.serial,
      banned: false,
      instituteId: { $in: staff.instituteIds },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const body = req.body ?? {};
    const rejectedFields = Object.keys(body).filter(
      (k) => !(EDITABLE_FIELDS as readonly string[]).includes(k),
    );
    if (rejectedFields.length > 0) {
      res.status(400).json({
        message: `Staff cannot edit: ${rejectedFields.join(", ")}. Allowed: ${EDITABLE_FIELDS.join(", ")}.`,
      });
      return;
    }

    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) {
        (student as unknown as Record<string, unknown>)[key] = body[key];
      }
    }

    await student.save();

    const populated = await Student.findById(student._id).populate("instituteId", "name code");
    res.status(200).json(populated);
  }
}
