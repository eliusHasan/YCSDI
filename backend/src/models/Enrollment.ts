import { Schema, model, type Document, type Types } from "mongoose";

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface ISubjectResult {
  name: string;
  fullMark: number;
  obtainedMark: number;
  letterGrade: string;
  gradePoint: number;
}

export interface IEnrollmentResult {
  subjects: ISubjectResult[];
  totalFull?: number;
  totalObtained?: number;
  cgpa?: number;
  letterGrade?: string;
  published: boolean;
}

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  instituteId: Types.ObjectId;
  session?: string;
  rollNo?: string;
  registrationNo?: string;
  result?: IEnrollmentResult;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subjectResultSchema = new Schema<ISubjectResult>(
  {
    name: { type: String, required: true, trim: true },
    fullMark: { type: Number, required: true, min: 0 },
    obtainedMark: { type: Number, required: true, min: 0 },
    letterGrade: { type: String, required: true, trim: true },
    gradePoint: { type: Number, required: true, min: 0, max: 4 },
  },
  { _id: false },
);

const resultSchema = new Schema<IEnrollmentResult>(
  {
    subjects: { type: [subjectResultSchema], default: [] },
    totalFull: { type: Number, min: 0 },
    totalObtained: { type: Number, min: 0 },
    letterGrade: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 4 },
    published: { type: Boolean, default: false },
  },
  { _id: false },
);

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true, index: true },
    session: { type: String, trim: true },
    rollNo: { type: String, trim: true, index: true },
    registrationNo: { type: String, trim: true, index: true },
    result: { type: resultSchema, default: undefined },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active", index: true },
    enrolledAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);

/**
 * The grading system printed on the academic transcript reference document.
 * Each tier: [minPercentageInclusive, letterGrade, gradePoint].
 */
const GRADE_BANDS: Array<[number, string, number]> = [
  [80, "A+", 4.0],
  [75, "A", 3.75],
  [70, "A-", 3.5],
  [65, "B+", 3.25],
  [60, "B", 3.0],
  [55, "B-", 2.75],
  [50, "C+", 2.5],
  [45, "C", 2.25],
  [40, "D", 2.0],
  [0, "F", 0.0],
];

export function gradeFromPercentage(percentage: number): { letterGrade: string; cgpa: number } {
  for (const [min, letterGrade, cgpa] of GRADE_BANDS) {
    if (percentage >= min) return { letterGrade, cgpa };
  }
  return { letterGrade: "F", cgpa: 0 };
}

/** Maps an overall CGPA to the nearest grading-band letter (e.g. 3.92 → A+). */
export function letterGradeFromGpa(gpa: number): string {
  let best = GRADE_BANDS[GRADE_BANDS.length - 1];
  let bestDist = Infinity;
  for (const band of GRADE_BANDS) {
    const dist = Math.abs(gpa - band[2]);
    if (dist < bestDist) {
      bestDist = dist;
      best = band;
    }
  }
  return best[1];
}

export interface SubjectMarkInput {
  name: string;
  fullMark: number;
  obtainedMark: number;
}

/**
 * Computes per-subject grades and the overall result from raw subject marks.
 * Each subject's grade comes from its percentage; CGPA is the mean of subject
 * grade points; the overall letter grade is the band nearest that CGPA.
 */
export function computeResult(rawSubjects: SubjectMarkInput[]): {
  subjects: ISubjectResult[];
  totalFull: number;
  totalObtained: number;
  cgpa: number;
  letterGrade: string;
} {
  const subjects: ISubjectResult[] = rawSubjects.map((s) => {
    const fullMark = Number(s.fullMark) || 0;
    const obtainedMark = Number(s.obtainedMark) || 0;
    const pct = fullMark > 0 ? (obtainedMark / fullMark) * 100 : 0;
    const { letterGrade, cgpa } = gradeFromPercentage(pct);
    return { name: s.name, fullMark, obtainedMark, letterGrade, gradePoint: cgpa };
  });

  const totalFull = subjects.reduce((a, s) => a + s.fullMark, 0);
  const totalObtained = subjects.reduce((a, s) => a + s.obtainedMark, 0);
  const cgpa = subjects.length
    ? Math.round((subjects.reduce((a, s) => a + s.gradePoint, 0) / subjects.length) * 100) / 100
    : 0;
  const letterGrade = subjects.length ? letterGradeFromGpa(cgpa) : "F";

  return { subjects, totalFull, totalObtained, cgpa, letterGrade };
}

export const GRADING_SYSTEM = GRADE_BANDS;

/**
 * Generates the next sequential numeric roll/registration numbers across all
 * enrollments. Both start from a fixed base so they look like the references
 * (4-6 digit numbers) and are guaranteed unique by the schema indexes.
 */
export async function generateRollAndRegistration(): Promise<{ rollNo: string; registrationNo: string }> {
  const count = await Enrollment.countDocuments();
  const rollNo = (1000 + count + 1).toString();
  const registrationNo = (100000 + count + 1).toString();
  return { rollNo, registrationNo };
}
