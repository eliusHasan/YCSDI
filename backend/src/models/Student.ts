import { Schema, model, Document } from "mongoose";

export interface IStudent extends Document {
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  course: string;
  session: string;
  courseDuration: string;
  postOffice: string;
  upazilla: string;
  district: string;
  nidPassport?: string;
  mobileNumber: string;
  email?: string;
  message?: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationId: string; // Auto-generated or set by admin
  userId?: Schema.Types.ObjectId; // Link to User model
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    course: { type: String, required: true },
    session: { type: String, required: true },
    courseDuration: { type: String, required: true },
    postOffice: { type: String, required: true },
    upazilla: { type: String, required: true },
    district: { type: String, required: true },
    nidPassport: { type: String },
    mobileNumber: { type: String, required: true },
    email: { type: String },
    message: { type: String },
    photoUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    registrationId: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Student = model<IStudent>("Student", studentSchema);
