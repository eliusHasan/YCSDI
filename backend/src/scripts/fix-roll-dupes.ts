import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../database/connect.js";
import { Enrollment, generateRollAndRegistrationSequence } from "../models/Enrollment.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { AdmitCard } from "../models/AdmitCard.js";
import { Marksheet } from "../models/Marksheet.js";
import { Certificate } from "../models/Certificate.js";

const APPLY = process.argv.includes("--apply");

const DOC_MODELS = [
  ["RegistrationCard", RegistrationCard],
  ["AdmitCard", AdmitCard],
  ["Marksheet", Marksheet],
  ["Certificate", Certificate],
] as const;

async function findDupeIds(field: "rollNo" | "registrationNo") {
  const groups = await Enrollment.aggregate<{ _id: string; ids: unknown[] }>([
    { $match: { [field]: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: `$${field}`,
        ids: { $push: "$_id" },
        oldest: { $min: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
  return groups;
}

async function main() {
  await connectDatabase();
  if (mongoose.connection.readyState !== 1) {
    console.error("Not connected to MongoDB (set MONGODB_URI).");
    process.exit(1);
  }

  // Within each duplicate group, keep the earliest-created enrollment on the
  // existing number and reassign every later enrollment a fresh number.
  const toRenumber = new Map<string, mongoose.Types.ObjectId>(); // _id -> objectId
  for (const field of ["rollNo", "registrationNo"] as const) {
    const groups = await findDupeIds(field);
    for (const g of groups) {
      const docs = await Enrollment.find({ _id: { $in: g.ids } })
        .select("_id createdAt")
        .sort({ createdAt: 1 })
        .lean();
      // first (oldest) keeps the number; rest get renumbered
      for (const d of docs.slice(1)) {
        toRenumber.set(String(d._id), d._id as mongoose.Types.ObjectId);
      }
    }
  }

  if (toRenumber.size === 0) {
    console.log("No duplicate roll/registration numbers found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  const ids = [...toRenumber.values()];
  console.log(`Enrollments to renumber: ${ids.length}`);

  const fresh = await generateRollAndRegistrationSequence(ids.length);

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const before = await Enrollment.findById(id).select("rollNo registrationNo studentId").lean();
    const next = fresh[i];

    // Report any already-issued documents whose rendered PDF will be stale.
    const issued: string[] = [];
    for (const [name, model] of DOC_MODELS) {
      const doc = await (model as mongoose.Model<unknown>).findOne({ enrollmentId: id }).select("_id").lean();
      if (doc) issued.push(name);
    }

    console.log(
      `\n[${i + 1}/${ids.length}] enrollment ${String(id)} (student ${String(before?.studentId)})\n` +
        `  rollNo: ${before?.rollNo} -> ${next.rollNo}\n` +
        `  registrationNo: ${before?.registrationNo} -> ${next.registrationNo}` +
        (issued.length ? `\n  ⚠ issued documents (re-issue to refresh PDFs): ${issued.join(", ")}` : ""),
    );

    if (APPLY) {
      await Enrollment.updateOne(
        { _id: id },
        { $set: { rollNo: next.rollNo, registrationNo: next.registrationNo } },
      );
    }
  }

  console.log(APPLY ? "\n✅ Applied." : "\nDry run only. Re-run with --apply to write changes.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
