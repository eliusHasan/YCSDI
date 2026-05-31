import { Schema, model, type Document } from "mongoose";

export type InstituteStatus = "active" | "inactive";

export interface IInstitute extends Document {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: InstituteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const instituteSchema = new Schema<IInstitute>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    address: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export const Institute = model<IInstitute>("Institute", instituteSchema);
