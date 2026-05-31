import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  userId: string; // Custom ID set by admin
  password: string;
  role: 'student' | 'admin' | 'instructor';
  refId: Schema.Types.ObjectId; // Reference to Student or Instructor model
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    refId: { type: Schema.Types.ObjectId, required: true, refPath: 'roleModel' },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for dynamic reference
userSchema.virtual('roleModel').get(function() {
  if (this.role === 'student') return 'Student';
  if (this.role === 'instructor') return 'Instructor';
  return 'Admin';
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", userSchema);
