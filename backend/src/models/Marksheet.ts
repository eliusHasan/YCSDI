import { Schema, model, type Document, type Types } from "mongoose";

export interface IMarksheetSubject {
  name: string;
  fullMark: number;
  obtainedMark: number;
  letterGrade: string;
  gradePoint: number;
}

export interface IMarksheet extends Document {
  enrollmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  instituteId: Types.ObjectId;
  serialNo: string;
  // Result snapshot taken at issuance time so a re-marked enrollment doesn't mutate an issued document.
  subjects: IMarksheetSubject[];
  totalFull: number;
  totalObtained: number;
  letterGrade: string;
  cgpa: number;
  issuedByAdminId: Types.ObjectId;
  issuedAt: Date;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const marksheetSubjectSchema = new Schema<IMarksheetSubject>(
  {
    name: { type: String, required: true },
    fullMark: { type: Number, required: true },
    obtainedMark: { type: Number, required: true },
    letterGrade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
  },
  { _id: false },
);

const marksheetSchema = new Schema<IMarksheet>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true, index: true },
    serialNo: { type: String, required: true, index: true },
    subjects: { type: [marksheetSubjectSchema], required: true },
    totalFull: { type: Number, required: true },
    totalObtained: { type: Number, required: true },
    letterGrade: { type: String, required: true },
    cgpa: { type: Number, required: true },
    issuedByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: () => new Date() },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const Marksheet = model<IMarksheet>("Marksheet", marksheetSchema);
