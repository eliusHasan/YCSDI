import bcrypt from "bcrypt";
import { Schema, model, type Document } from "mongoose";

export type UserRole = "student" | "staff" | "admin";

export interface IUser extends Document {
  userId: string;
  password: string;
  role: UserRole;
  refId?: Schema.Types.ObjectId;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "staff", "admin"], default: "student" },
    refId: { type: Schema.Types.ObjectId, refPath: "roleModel" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as { password?: string }).password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("roleModel").get(function () {
  if (this.role === "student") return "Student";
  if (this.role === "staff") return "Staff";
  return null;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", userSchema);
