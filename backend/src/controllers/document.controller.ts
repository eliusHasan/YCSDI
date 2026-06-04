import type { Request, Response } from "express";
import { isValidObjectId, type Model } from "mongoose";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate, generateCertificateNumber } from "../models/Certificate.js";
import {
  Enrollment,
  computeResult,
  generateRollAndRegistration,
  type SubjectMarkInput,
} from "../models/Enrollment.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { Student } from "../models/Student.js";
import { generateAndUploadAdmitCard } from "../utils/pdf/admit-card.js";
import { generateAndUploadCertificate } from "../utils/pdf/certificate.js";
import { generateAndUploadMarksheet } from "../utils/pdf/marksheet.js";
import { generateAndUploadRegistrationCard } from "../utils/pdf/registration-card.js";
import { generateSerialNo } from "../utils/serial.js";

type DocType = "registration" | "admit" | "marksheet" | "certificate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODEL_BY_TYPE: Record<DocType, Model<any>> = {
  registration: RegistrationCard,
  admit: AdmitCard,
  marksheet: Marksheet,
  certificate: Certificate,
};

interface PopulatedEnrollment {
  _id: unknown;
  session?: string;
  rollNo?: string;
  registrationNo?: string;
  result?: {
    subjects?: Array<{ name: string; fullMark: number; obtainedMark: number; letterGrade: string; gradePoint: number }>;
    totalFull?: number;
    totalObtained?: number;
    letterGrade?: string;
    cgpa?: number;
    published?: boolean;
  };
  studentId: {
    _id: unknown;
    fullName: string;
    fatherName: string;
    motherName: string;
    gender: string;
    dateOfBirth: Date;
    postOffice: string;
    upazilla: string;
    district: string;
    photoUrl?: string;
  };
  courseId: { _id: unknown; title: string; category?: string; duration?: string; subjects?: string[] };
  instituteId: { _id: unknown; name: string; code: string };
}

const STUDENT_FIELDS = "fullName fatherName motherName gender dateOfBirth postOffice upazilla district photoUrl";

function populateEnrollment(query: ReturnType<typeof Enrollment.findById>) {
  return query
    .populate({ path: "studentId", select: STUDENT_FIELDS })
    .populate({ path: "courseId", select: "title category duration slug subjects" })
    .populate({ path: "instituteId", select: "name code" });
}

function isType(value: string): value is DocType {
  return value === "registration" || value === "admit" || value === "marksheet" || value === "certificate";
}

export class DocumentController {
  /** Admin: full student detail incl. enrollments and every issued document. */
  static async studentDetail(req: Request, res: Response) {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
      res.status(400).json({ message: "Invalid student id" });
      return;
    }
    const student = await Student.findById(studentId)
      .populate("instituteId", "name code")
      .populate("userId", "userId role");
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    const enrollments = await Enrollment.find({ studentId })
      .populate("courseId", "title slug imageUrl duration category subjects")
      .populate("instituteId", "name code")
      .sort({ enrolledAt: -1 });

    const [registrationCards, admitCards, marksheets, certificates] = await Promise.all([
      RegistrationCard.find({ studentId }).sort({ issuedAt: -1 }),
      AdmitCard.find({ studentId }).sort({ issuedAt: -1 }),
      Marksheet.find({ studentId }).sort({ issuedAt: -1 }),
      Certificate.find({ studentId }).sort({ issuedAt: -1 }),
    ]);

    res.status(200).json({
      student,
      enrollments,
      documents: { registrationCards, admitCards, marksheets, certificates },
    });
  }

  /** Admin: update roll/registration numbers, session and exam marks of an enrollment. */
  static async patchEnrollment(req: Request, res: Response) {
    const { enrollmentId } = req.params;
    if (!isValidObjectId(enrollmentId)) {
      res.status(400).json({ message: "Invalid enrollment id" });
      return;
    }
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    const body = req.body ?? {};
    if (typeof body.rollNo === "string") enrollment.rollNo = body.rollNo.trim();
    if (typeof body.registrationNo === "string") enrollment.registrationNo = body.registrationNo.trim();
    if (typeof body.session === "string") enrollment.session = body.session.trim();
    if (body.status && ["active", "completed", "cancelled"].includes(body.status)) {
      enrollment.status = body.status;
    }

    // Subject-wise marks: each { name, fullMark, obtainedMark } → per-subject grade + overall CGPA.
    if (Array.isArray(body.subjects) || body.published !== undefined) {
      const prev = enrollment.result;
      let computed: ReturnType<typeof computeResult> | null = null;

      if (Array.isArray(body.subjects)) {
        const raw: SubjectMarkInput[] = (body.subjects as unknown[])
          .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
          .map((s: Record<string, unknown>) => ({
            name: String(s.name ?? "").trim(),
            fullMark: Number(s.fullMark) || 0,
            obtainedMark: Number(s.obtainedMark) || 0,
          }))
          .filter((s) => s.name);
        computed = computeResult(raw);
      }

      enrollment.result = {
        subjects: computed ? computed.subjects : (prev?.subjects ?? []),
        totalFull: computed ? computed.totalFull : prev?.totalFull,
        totalObtained: computed ? computed.totalObtained : prev?.totalObtained,
        cgpa: computed ? computed.cgpa : prev?.cgpa,
        letterGrade: computed ? computed.letterGrade : prev?.letterGrade,
        published: body.published !== undefined ? !!body.published : (prev?.published ?? false),
      };
    }

    await enrollment.save();
    const populated = await Enrollment.findById(enrollment._id)
      .populate("courseId", "title slug imageUrl duration category subjects")
      .populate("instituteId", "name code");
    res.status(200).json(populated);
  }

  /** Admin: list every issued document of a given type. */
  static async list(req: Request, res: Response) {
    const { type } = req.params;
    if (!isType(type)) {
      res.status(400).json({ message: "Invalid document type" });
      return;
    }
    const docs = await MODEL_BY_TYPE[type]
      .find()
      .populate({ path: "studentId", select: "fullName registrationId photoUrl" })
      .populate({ path: "courseId", select: "title slug" })
      .populate({ path: "instituteId", select: "name code" })
      .populate({ path: "issuedByAdminId", select: "userId" })
      .sort({ issuedAt: -1 });
    res.status(200).json(docs);
  }

  /** Admin: delete an issued document record. */
  static async remove(req: Request, res: Response) {
    const { type, id } = req.params;
    if (!isType(type)) {
      res.status(400).json({ message: "Invalid document type" });
      return;
    }
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid document id" });
      return;
    }
    const doc = await MODEL_BY_TYPE[type].findByIdAndDelete(id);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }
    res.status(200).json({ message: "Document deleted" });
  }

  /** Admin: issue (generate + upload + persist) a document for an enrollment. */
  static async issue(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { type } = req.params;
    if (!isType(type)) {
      res.status(400).json({ message: "Invalid document type" });
      return;
    }
    const { enrollmentId, examDate } = req.body ?? {};
    if (!enrollmentId || !isValidObjectId(enrollmentId)) {
      res.status(400).json({ message: "Valid enrollmentId is required" });
      return;
    }

    const existing = await MODEL_BY_TYPE[type].findOne({ enrollmentId });
    if (existing) {
      res.status(409).json({ message: `A ${type} document already exists for this enrollment`, document: existing });
      return;
    }

    const enrollment = await populateEnrollment(Enrollment.findById(enrollmentId)).lean<PopulatedEnrollment>();
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    // Ensure roll/registration numbers exist (auto-assign if somehow missing).
    let { rollNo, registrationNo } = enrollment;
    if (!rollNo || !registrationNo) {
      const generated = await generateRollAndRegistration();
      rollNo = rollNo || generated.rollNo;
      registrationNo = registrationNo || generated.registrationNo;
      await Enrollment.updateOne({ _id: enrollment._id }, { rollNo, registrationNo });
    }

    const needsResult = type === "marksheet" || type === "certificate";
    if (
      needsResult &&
      (!enrollment.result || !enrollment.result.subjects?.length || enrollment.result.cgpa === undefined)
    ) {
      res.status(400).json({ message: "Enter and save subject marks for this enrollment before issuing this document" });
      return;
    }

    const s = enrollment.studentId;
    const serialNo = await generateSerialNo();
    const issuedAt = new Date();
    const exam = examDate ? new Date(examDate) : issuedAt;

    try {
      if (type === "registration") {
        const pdfUrl = await generateAndUploadRegistrationCard({
          serialNo,
          studentName: s.fullName,
          fatherName: s.fatherName,
          motherName: s.motherName,
          gender: s.gender,
          instituteName: enrollment.instituteId.name,
          postOffice: s.postOffice,
          upazilla: s.upazilla,
          district: s.district,
          courseTitle: enrollment.courseId.title,
          courseCode: enrollment.courseId.category ?? "",
          registrationNo: registrationNo!,
          rollNo: rollNo!,
          session: enrollment.session ?? "",
          photoUrl: s.photoUrl,
        });
        const doc = await RegistrationCard.create({
          enrollmentId: enrollment._id,
          studentId: s._id,
          courseId: enrollment.courseId._id,
          instituteId: enrollment.instituteId._id,
          serialNo,
          issuedByAdminId: req.user._id,
          issuedAt,
          pdfUrl,
        });
        res.status(201).json(await DocumentController.populateOne("registration", doc._id));
        return;
      }

      if (type === "admit") {
        const pdfUrl = await generateAndUploadAdmitCard({
          serialNo,
          instituteName: enrollment.instituteId.name,
          studentName: s.fullName,
          fatherName: s.fatherName,
          motherName: s.motherName,
          dateOfBirth: new Date(s.dateOfBirth),
          session: enrollment.session ?? "",
          subjectName: enrollment.courseId.title,
          rollNo: rollNo!,
          registrationNo: registrationNo!,
          sex: s.gender,
          photoUrl: s.photoUrl,
        });
        const doc = await AdmitCard.create({
          enrollmentId: enrollment._id,
          studentId: s._id,
          courseId: enrollment.courseId._id,
          instituteId: enrollment.instituteId._id,
          serialNo,
          examDate: examDate ? exam : undefined,
          issuedByAdminId: req.user._id,
          issuedAt,
          pdfUrl,
        });
        res.status(201).json(await DocumentController.populateOne("admit", doc._id));
        return;
      }

      if (type === "marksheet") {
        const r = enrollment.result!;
        const subjects = (r.subjects ?? []).map((sub) => ({
          name: sub.name,
          fullMark: sub.fullMark,
          obtainedMark: sub.obtainedMark,
          letterGrade: sub.letterGrade,
          gradePoint: sub.gradePoint,
        }));
        const totalFull = r.totalFull ?? subjects.reduce((a, x) => a + x.fullMark, 0);
        const totalObtained = r.totalObtained ?? subjects.reduce((a, x) => a + x.obtainedMark, 0);
        const pdfUrl = await generateAndUploadMarksheet({
          serialNo,
          studentName: s.fullName,
          fatherName: s.fatherName,
          motherName: s.motherName,
          rollNo: rollNo!,
          registrationNo: registrationNo!,
          instituteName: enrollment.instituteId.name,
          courseTitle: enrollment.courseId.title,
          courseDuration: enrollment.courseId.duration ?? "",
          session: enrollment.session ?? "",
          subjects,
          totalFull,
          totalObtained,
          letterGrade: r.letterGrade ?? "",
          cgpa: r.cgpa ?? 0,
        });
        const doc = await Marksheet.create({
          enrollmentId: enrollment._id,
          studentId: s._id,
          courseId: enrollment.courseId._id,
          instituteId: enrollment.instituteId._id,
          serialNo,
          subjects,
          totalFull,
          totalObtained,
          letterGrade: r.letterGrade ?? "",
          cgpa: r.cgpa ?? 0,
          issuedByAdminId: req.user._id,
          issuedAt,
          pdfUrl,
        });
        res.status(201).json(await DocumentController.populateOne("marksheet", doc._id));
        return;
      }

      // certificate
      const r = enrollment.result!;
      const certificateNumber = await generateCertificateNumber();
      const pdfUrl = await generateAndUploadCertificate({
        serialNo,
        certificateNumber,
        studentName: s.fullName,
        fatherName: s.fatherName,
        motherName: s.motherName,
        instituteName: enrollment.instituteId.name,
        courseTitle: enrollment.courseId.title,
        rollNo: rollNo!,
        registrationNo: registrationNo!,
        session: enrollment.session ?? "",
        cgpa: r.cgpa,
        letterGrade: r.letterGrade,
        examDate: exam,
        issuedDate: issuedAt,
      });
      const doc = await Certificate.create({
        enrollmentId: enrollment._id,
        studentId: s._id,
        courseId: enrollment.courseId._id,
        instituteId: enrollment.instituteId._id,
        certificateNumber,
        serialNo,
        cgpa: r.cgpa,
        letterGrade: r.letterGrade,
        issuedByAdminId: req.user._id,
        issuedAt,
        pdfUrl,
      });
      res.status(201).json(await DocumentController.populateOne("certificate", doc._id));
    } catch (error) {
      console.error(`Failed to issue ${type}:`, error);
      res.status(500).json({ message: `Failed to issue ${type} document` });
    }
  }

  private static populateOne(type: DocType, id: unknown) {
    return MODEL_BY_TYPE[type]
      .findById(id)
      .populate({ path: "studentId", select: "fullName registrationId photoUrl" })
      .populate({ path: "courseId", select: "title slug" })
      .populate({ path: "instituteId", select: "name code" })
      .populate({ path: "issuedByAdminId", select: "userId" });
  }
}
