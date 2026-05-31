import { Schema, model, type Document, type Types } from "mongoose";

export type StaffStatus = "active" | "inactive";

export interface IStaff extends Document {
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  instituteIds: Types.ObjectId[];
  userId?: Types.ObjectId;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    photoUrl: { type: String },
    instituteIds: [{ type: Schema.Types.ObjectId, ref: "Institute" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export const Staff = model<IStaff>("Staff", staffSchema);
