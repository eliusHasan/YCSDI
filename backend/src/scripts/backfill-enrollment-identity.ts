/**
 * One-time backfill: sync each student's courseDuration/session onto their
 * enrollment(s), which is what documents render from. Only non-empty student
 * values overwrite; empty student fields are left untouched.
 *
 *   PROD_URI=... npx tsx src/scripts/backfill-enrollment-identity.ts            (dry run)
 *   PROD_URI=... npx tsx src/scripts/backfill-enrollment-identity.ts --apply    (write)
 *   ...add --only=YCSDI-2026-0068 to limit to a single registrationId
 */
import mongoose from "mongoose";
import { Student } from "../models/Student.js";
import { Enrollment } from "../models/Enrollment.js";

const URI = process.env.PROD_URI!;
const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

async function main() {
  await mongoose.connect(URI);

  const enrollments = await Enrollment.find({}).select("studentId courseDuration session").lean();
  let changed = 0;

  for (const e of enrollments) {
    const s = await Student.findById(e.studentId).select("fullName courseDuration session registrationId").lean();
    if (!s) continue;
    const regId = (s as { registrationId?: string }).registrationId;
    if (ONLY && regId !== ONLY) continue;

    const sd = (s as { courseDuration?: string }).courseDuration;
    const ss = (s as { session?: string }).session;
    const set: Record<string, string> = {};
    if (sd && sd !== e.courseDuration) set.courseDuration = sd;
    if (ss && ss !== e.session) set.session = ss;
    if (Object.keys(set).length === 0) continue;

    changed += 1;
    console.log(
      `${regId ?? "?"} ${(s as { fullName?: string }).fullName ?? ""}: ` +
        Object.entries(set)
          .map(([k, v]) => `${k} "${(e as Record<string, unknown>)[k]}" -> "${v}"`)
          .join(", "),
    );
    if (APPLY) {
      await Enrollment.updateOne({ _id: e._id }, { $set: set });
    }
  }

  console.log(`\n${changed} enrollment(s) ${APPLY ? "updated" : "would be updated"}.`);
  console.log(APPLY ? "✅ Applied." : "Dry run only. Re-run with --apply to write.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
