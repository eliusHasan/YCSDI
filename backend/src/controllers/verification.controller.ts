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

function publicCourse(enrollment: HydratedDocument<IEnrollment>) {
  const course = enrollment.courseId as unknown as {
    toObject?: () => Record<string, unknown>;
    title?: string;
    duration?: string;
  };
  const base = typeof course?.toObject === "function" ? course.toObject() : course;
  return {
    ...base,
    title: enrollment.courseTitle ?? base?.title,
    duration: enrollment.courseDuration ?? base?.duration,
  };
}

const VERIFY_SOURCES: Array<{ type: string; label: string; model: Model<unknown> }> = [
  { type: "registration", label: "Registration Card", model: RegistrationCard as unknown as Model<unknown> },
  { type: "admit", label: "Admit Card", model: AdmitCard as unknown as Model<unknown> },
  { type: "marksheet", label: "Marksheet", model: Marksheet as unknown as Model<unknown> },
  { type: "certificate", label: "Certificate", model: Certificate as unknown as Model<unknown> },
];

type VerifiedDoc = {
  type: string;
  label: string;
  serialNo: string;
  pdfUrl: string;
  issuedAt: Date;
  course: unknown;
  institute: unknown;
};

export class VerificationController {
  /**
   * Public: resolve a serial number for authenticity checks. A serial now
   * identifies a *student* — every document they have been issued shares it —
   * so we return the student plus all of their issued documents. Older
   * per-document serials are still resolved via a fallback.
   */
  static async verify(req: Request, res: Response) {
    const { serial } = req.params;
    if (!serial || !/^\d{6,12}$/.test(serial)) {
      res.status(400).json({ message: "Invalid serial number" });
      return;
    }

    // Primary path: the serial belongs to a student.
    const student = await Student.findOne({ serialNo: serial }).select(
      "fullName fatherName motherName registrationId photoUrl",
    );
    if (student) {
      const documents = await VerificationController.collectDocuments({ studentId: student._id });
      const result = await VerificationController.studentResult(student._id);
      res.status(200).json({ found: true, student, documents, result });
      return;
    }

    // Legacy fallback: documents issued before serials were shared carry their
    // own unique serial. Resolve that single document and shape it uniformly.
    for (const source of VERIFY_SOURCES) {
      const doc = await source.model
        .findOne({ serialNo: serial })
        .populate(STUDENT)
        .populate(COURSE)
        .populate(INSTITUTE);
      if (doc) {
        const d = doc as unknown as {
          studentId: unknown;
          serialNo: string;
          pdfUrl: string;
          issuedAt: Date;
          courseId: unknown;
          instituteId: unknown;
        };
        res.status(200).json({
          found: true,
          student: d.studentId,
          documents: [
            {
              type: source.type,
              label: source.label,
              serialNo: d.serialNo,
              pdfUrl: d.pdfUrl,
              issuedAt: d.issuedAt,
              course: d.courseId,
              institute: d.instituteId,
            },
          ],
        });
        return;
      }
    }
    res.status(404).json({ found: false, message: "No document found for this serial number" });
  }

  /** The student's published transcript (most recent enrolment with marks), or null. */
  private static async studentResult(studentId: unknown) {
    const enrollments = await Enrollment.find({ studentId })
      .populate(STUDENT)
      .populate(COURSE)
      .populate(INSTITUTE)
      .sort({ enrolledAt: -1 });
    for (const e of enrollments) {
      const marksheet = await Marksheet.findOne({ enrollmentId: e._id });
      if (marksheet || e.result?.published) {
        const result = marksheet
          ? {
              subjects: marksheet.subjects,
              totalFull: marksheet.totalFull,
              totalObtained: marksheet.totalObtained,
              letterGrade: marksheet.letterGrade,
              cgpa: marksheet.cgpa,
            }
          : e.result;
        return {
          student: e.studentId,
          course: publicCourse(e),
          institute: e.instituteId,
          rollNo: e.rollNo,
          registrationNo: e.registrationNo,
          session: e.session,
          result,
          marksheetUrl: marksheet?.pdfUrl ?? null,
          serialNo: marksheet?.serialNo ?? null,
        };
      }
    }
    return null;
  }

  /** Gather every issued document matching a filter, with course/institute populated. */
  private static async collectDocuments(filter: Record<string, unknown>): Promise<VerifiedDoc[]> {
    const items: VerifiedDoc[] = [];
    for (const source of VERIFY_SOURCES) {
      const docs = await source.model.find(filter).populate(COURSE).populate(INSTITUTE).sort({ issuedAt: -1 });
      for (const raw of docs) {
        const d = raw as unknown as {
          serialNo: string;
          pdfUrl: string;
          issuedAt: Date;
          courseId: unknown;
          instituteId: unknown;
        };
        items.push({
          type: source.type,
          label: source.label,
          serialNo: d.serialNo,
          pdfUrl: d.pdfUrl,
          issuedAt: d.issuedAt,
          course: d.courseId,
          institute: d.instituteId,
        });
      }
    }
    return items;
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
      const matches = await Enrollment.find({ rollNo: roll, registrationNo: reg })
        .populate(STUDENT)
        .populate(COURSE)
        .populate(INSTITUTE)
        .sort({ enrolledAt: -1 });
      if (matches.length === 0) {
        res.status(404).json({ message: "No record found for the given roll and registration number" });
        return;
      }
      for (const match of matches) {
        const hasMarksheet = await Marksheet.exists({ enrollmentId: match._id });
        if (hasMarksheet || match.result?.published) {
          enrollment = match;
          break;
        }
      }
      enrollment = enrollment ?? matches[0];
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
      course: publicCourse(enrollment),
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
