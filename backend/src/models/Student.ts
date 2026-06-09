import { Schema, model, type Document, type Types } from "mongoose";

export type StudentStatus = "pending" | "approved" | "rejected";

export interface IStudent extends Document {
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  postOffice: string;
  upazilla: string;
  district: string;
  nidPassport?: string;
  mobileNumber: string;
  email?: string;
  message?: string;
  courseDuration?: string;
  session?: string;
  photoUrl: string;
  status: StudentStatus;
  serialNo: string;
  registrationId: string;
  instituteId?: Types.ObjectId;
  preferredInstituteId?: Types.ObjectId;
  preferredCourseId?: Types.ObjectId;
  userId?: Types.ObjectId;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dateOfBirth: { type: Date, required: true },
    postOffice: { type: String, required: true, trim: true },
    upazilla: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    nidPassport: { type: String, trim: true, index: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, trim: true },
    courseDuration: { type: String, trim: true },
    session: { type: String, trim: true },
    photoUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    serialNo: { type: String, unique: true, sparse: true, index: true },
    registrationId: { type: String, unique: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute" },
    preferredInstituteId: { type: Schema.Types.ObjectId, ref: "Institute" },
    preferredCourseId: { type: Schema.Types.ObjectId, ref: "Course" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    banned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Student = model<IStudent>("Student", studentSchema);
