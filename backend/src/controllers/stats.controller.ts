import type { Request, Response } from "express";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Institute } from "../models/Institute.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { Staff } from "../models/Staff.js";
import { Student } from "../models/Student.js";

export class StatsController {
  /** Admin: institute-wide totals + recent registrations for the overview dashboard. */
  static async admin(_req: Request, res: Response) {
    const [
      totalStudents,
      pending,
      approved,
      rejected,
      banned,
      totalCourses,
      publishedCourses,
      totalInstitutes,
      activeInstitutes,
      totalStaff,
      totalEnrollments,
      registrationCards,
      admitCards,
      marksheets,
      certificates,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "pending" }),
      Student.countDocuments({ status: "approved" }),
      Student.countDocuments({ status: "rejected" }),
      Student.countDocuments({ banned: true }),
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Institute.countDocuments(),
      Institute.countDocuments({ status: "active" }),
      Staff.countDocuments(),
      Enrollment.countDocuments(),
      RegistrationCard.countDocuments(),
      AdmitCard.countDocuments(),
      Marksheet.countDocuments(),
      Certificate.countDocuments(),
    ]);

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("fullName registrationId serialNo status photoUrl createdAt")
      .populate("preferredCourseId", "title")
      .populate("instituteId", "code");

    res.status(200).json({
      students: { total: totalStudents, pending, approved, rejected, banned },
      courses: { total: totalCourses, published: publishedCourses },
      institutes: { total: totalInstitutes, active: activeInstitutes },
      staff: { total: totalStaff },
      enrollments: { total: totalEnrollments },
      documents: {
        registration: registrationCards,
        admit: admitCards,
        marksheet: marksheets,
        certificate: certificates,
        total: registrationCards + admitCards + marksheets + certificates,
      },
      recentStudents,
    });
  }

  /** Staff: totals scoped to the institutes this staff member belongs to. */
  static async staff(req: Request, res: Response) {
    if (!req.user?.refId) {
      res.status(403).json({ message: "Staff profile not found for this account" });
      return;
    }
    const staff = await Staff.findById(req.user.refId).populate("instituteIds", "name code");
    if (!staff) {
      res.status(403).json({ message: "Staff profile not found for this account" });
      return;
    }

    const instituteIds = staff.instituteIds.map((i) => (typeof i === "object" && i ? (i as { _id: unknown })._id : i));
    const studentScope = { instituteId: { $in: instituteIds }, banned: false };

    const [totalStudents, approved, pending, activeEnrollments, completedEnrollments, certificates, marksheets] =
      await Promise.all([
        Student.countDocuments(studentScope),
        Student.countDocuments({ ...studentScope, status: "approved" }),
        Student.countDocuments({ ...studentScope, status: "pending" }),
        Enrollment.countDocuments({ instituteId: { $in: instituteIds }, status: "active" }),
        Enrollment.countDocuments({ instituteId: { $in: instituteIds }, status: "completed" }),
        Certificate.countDocuments({ instituteId: { $in: instituteIds } }),
        Marksheet.countDocuments({ instituteId: { $in: instituteIds } }),
      ]);

    const recentStudents = await Student.find({ ...studentScope, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("fullName registrationId photoUrl createdAt")
      .populate("instituteId", "code");

    res.status(200).json({
      institutes: staff.instituteIds.map((i) => {
        const inst = i as unknown as { name?: string; code?: string };
        return { name: inst.name ?? "", code: inst.code ?? "" };
      }),
      students: { total: totalStudents, approved, pending },
      enrollments: { active: activeEnrollments, completed: completedEnrollments, total: activeEnrollments + completedEnrollments },
      certificates: { total: certificates },
      marksheets: { total: marksheets },
      recentStudents,
    });
  }
}
