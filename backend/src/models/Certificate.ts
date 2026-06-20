import { Schema, model, type Document, type Types } from "mongoose";

export interface ICertificate extends Document {
  enrollmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  instituteId: Types.ObjectId;
  certificateNumber: string;
  serialNo: string;
  cgpa?: number;
  letterGrade?: string;
  issuedByAdminId: Types.ObjectId;
  issuedAt: Date;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true, index: true },
    certificateNumber: { type: String, required: true, unique: true, index: true },
    serialNo: { type: String, required: true, index: true },
    cgpa: { type: Number, min: 0, max: 4 },
    letterGrade: { type: String, trim: true },
    issuedByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: () => new Date() },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const Certificate = model<ICertificate>("Certificate", certificateSchema);

export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `YCSDI-CERT-${year}-`;
  const latest = await Certificate.findOne({ certificateNumber: { $regex: `^${prefix}` } })
    .sort({ certificateNumber: -1 })
    .select("certificateNumber")
    .lean();

  let seq = 1;
  if (latest?.certificateNumber) {
    const parsed = Number.parseInt(latest.certificateNumber.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) seq = parsed + 1;
  }

  return `${prefix}${seq.toString().padStart(4, "0")}`;
}
