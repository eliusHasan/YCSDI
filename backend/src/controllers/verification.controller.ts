import type { Request, Response } from "express";
import type { HydratedDocument, Model } from "mongoose";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
import { Enrollment, type IEnrollment } from "../models/Enrollment.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { Student } from "../models/Student.js";

const STUDENT = { path: "studentId", select: "fullName fatherName motherName registrationId photoUrl" };
const COURSE = { path: "courseId", select: "title slug duration category" };
const INSTITUTE = { path: "instituteId", select: "name code" };

const VERIFY_SOURCES: Array<{ type: string; label: string; model: Model<unknown> }> = [
  { type: "registration", label: "Registration Card", model: RegistrationCard as unknown as Model<unknown> },
  { type: "admit", label: "Admit Card", model: AdmitCard as unknown as Model<unknown> },
  { type: "marksheet", label: "Marksheet", model: Marksheet as unknown as Model<unknown> },
  { type: "certificate", label: "Certificate", model: Certificate as unknown as Model<unknown> },
];

export class VerificationController {
  /** Public: resolve a serial number to its issued document for authenticity checks. */
  static async verify(req: Request, res: Response) {
    const { serial } = req.params;
    if (!serial || !/^\d{6,12}$/.test(serial)) {
      res.status(400).json({ message: "Invalid serial number" });
      return;
    }
    for (const source of VERIFY_SOURCES) {
      const doc = await source.model
        .findOne({ serialNo: serial })
        .populate(STUDENT)
        .populate(COURSE)
        .populate(INSTITUTE);
      if (doc) {
        res.status(200).json({ found: true, type: source.type, label: source.label, document: doc });
        return;
      }
    }
    res.status(404).json({ found: false, message: "No document found for this serial number" });
  }

  /**
   * Public: look up a published result/marksheet either by roll + registration
   * number, or by the student's NID / passport number. For the NID path the most
   * recent published enrollment is returned.
   */
  static async result(req: Request, res: Response) {
    const roll = String(req.query.roll ?? "").trim();
    const reg = String(req.query.registration ?? req.query.reg ?? "").trim();
    const nid = String(req.query.nid ?? req.query.passport ?? "").trim();

    let enrollment: HydratedDocument<IEnrollment> | null = null;

    if (nid) {
      const student = await Student.findOne({ nidPassport: nid });
      if (!student) {
        res.status(404).json({ message: "No student found for the given NID / passport number" });
        return;
      }
      const enrollments = await Enrollment.find({ studentId: student._id })
        .populate(STUDENT)
        .populate(COURSE)
        .populate(INSTITUTE)
        .sort({ enrolledAt: -1 });
      for (const e of enrollments) {
        const hasMarksheet = await Marksheet.exists({ enrollmentId: e._id });
        if (hasMarksheet || e.result?.published) {
          enrollment = e;
          break;
        }
      }
      if (!enrollment) {
        res.status(404).json({ message: "No published result found for this NID / passport number" });
        return;
      }
    } else if (roll && reg) {
      enrollment = await Enrollment.findOne({ rollNo: roll, registrationNo: reg })
        .populate(STUDENT)
        .populate(COURSE)
        .populate(INSTITUTE);
      if (!enrollment) {
        res.status(404).json({ message: "No record found for the given roll and registration number" });
        return;
      }
    } else {
      res.status(400).json({ message: "Provide roll + registration number, or an NID / passport number" });
      return;
    }

    const marksheet = await Marksheet.findOne({ enrollmentId: enrollment._id });
    const published = marksheet || enrollment.result?.published;
    if (!published) {
      res.status(404).json({ message: "Result has not been published yet for this enrollment" });
      return;
    }

    const result = marksheet
      ? {
          subjects: marksheet.subjects,
          totalFull: marksheet.totalFull,
          totalObtained: marksheet.totalObtained,
          letterGrade: marksheet.letterGrade,
          cgpa: marksheet.cgpa,
        }
      : enrollment.result;

    res.status(200).json({
      student: enrollment.studentId,
      course: enrollment.courseId,
      institute: enrollment.instituteId,
      rollNo: enrollment.rollNo,
      registrationNo: enrollment.registrationNo,
      session: enrollment.session,
      result,
      marksheetUrl: marksheet?.pdfUrl ?? null,
      serialNo: marksheet?.serialNo ?? null,
    });
  }
}
