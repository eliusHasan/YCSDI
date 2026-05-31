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
  photoUrl: string;
  status: StudentStatus;
  registrationId: string;
  instituteId?: Types.ObjectId;
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
    nidPassport: { type: String, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, trim: true },
    photoUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    registrationId: { type: String, unique: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    banned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Student = model<IStudent>("Student", studentSchema);
