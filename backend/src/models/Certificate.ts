import { Schema, model, type Document, type Types } from "mongoose";

export interface ICertificate extends Document {
  enrollmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  instituteId: Types.ObjectId;
  certificateNumber: string;
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
  const count = await Certificate.countDocuments({ certificateNumber: { $regex: `^${prefix}` } });
  return `${prefix}${(count + 1).toString().padStart(4, "0")}`;
}
