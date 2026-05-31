import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Certificate, generateCertificateNumber } from "../models/Certificate.js";
import { Enrollment } from "../models/Enrollment.js";
import { generateAndUploadCertificate } from "../utils/certificate-pdf.js";

interface EnrollmentForCert {
  _id: unknown;
  instituteId: unknown;
  studentId: { _id: unknown; fullName: string };
  courseId: { _id: unknown; title: string };
}

export class CertificateController {
  // ----- admin -----

  static async list(_req: Request, res: Response) {
    const certs = await Certificate.find()
      .populate({ path: "studentId", select: "fullName registrationId photoUrl" })
      .populate({ path: "courseId", select: "title slug" })
      .populate({ path: "instituteId", select: "name code" })
      .populate({ path: "issuedByAdminId", select: "userId" })
      .sort({ issuedAt: -1 });
    res.status(200).json(certs);
  }

  static async create(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { enrollmentId } = req.body ?? {};
    if (!enrollmentId || !isValidObjectId(enrollmentId)) {
      res.status(400).json({ message: "Valid enrollmentId is required" });
      return;
    }

    const existing = await Certificate.findOne({ enrollmentId });
    if (existing) {
      res.status(409).json({ message: "Certificate already exists for this enrollment", certificate: existing });
      return;
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({ path: "studentId", select: "fullName" })
      .populate({ path: "courseId", select: "title" })
      .populate({ path: "instituteId", select: "name" })
      .lean<EnrollmentForCert & { instituteId: { _id: unknown; name: string } }>();

    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    const certificateNumber = await generateCertificateNumber();
    const issuedAt = new Date();

    const pdfUrl = await generateAndUploadCertificate({
      studentName: enrollment.studentId.fullName,
      courseTitle: enrollment.courseId.title,
      certificateNumber,
      instituteName: enrollment.instituteId.name,
      issuedDate: issuedAt,
    });

    const cert = await Certificate.create({
      enrollmentId: enrollment._id,
      studentId: enrollment.studentId._id,
      courseId: enrollment.courseId._id,
      instituteId: enrollment.instituteId._id,
      certificateNumber,
      issuedByAdminId: req.user._id,
      issuedAt,
      pdfUrl,
    });

    const populated = await Certificate.findById(cert._id)
      .populate({ path: "studentId", select: "fullName registrationId photoUrl" })
      .populate({ path: "courseId", select: "title slug" })
      .populate({ path: "instituteId", select: "name code" })
      .populate({ path: "issuedByAdminId", select: "userId" });

    res.status(201).json(populated);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid certificate id" });
      return;
    }
    const cert = await Certificate.findByIdAndDelete(id);
    if (!cert) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }
    res.status(200).json({ message: "Certificate deleted" });
  }
}
