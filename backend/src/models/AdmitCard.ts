import { Schema, model, type Document, type Types } from "mongoose";

export interface IAdmitCard extends Document {
  enrollmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  instituteId: Types.ObjectId;
  serialNo: string;
  examDate?: Date;
  issuedByAdminId: Types.ObjectId;
  issuedAt: Date;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const admitCardSchema = new Schema<IAdmitCard>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true, index: true },
    serialNo: { type: String, required: true, index: true },
    examDate: { type: Date },
    issuedByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: () => new Date() },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const AdmitCard = model<IAdmitCard>("AdmitCard", admitCardSchema);
