import mongoose, { type Model } from "mongoose";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
import { Enrollment } from "../models/Enrollment.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";

const DOCUMENT_MODELS: Model<unknown>[] = [
  RegistrationCard as unknown as Model<unknown>,
  AdmitCard as unknown as Model<unknown>,
  Marksheet as unknown as Model<unknown>,
  Certificate as unknown as Model<unknown>,
];

export async function ensureDocumentIndexes() {
  if (mongoose.connection.readyState !== 1) return;

  for (const model of DOCUMENT_MODELS) {
    const indexes = await model.collection.indexes();
    const serialIndex = indexes.find((index) => index.name === "serialNo_1");
    if (serialIndex?.unique) {
      await model.collection.dropIndex("serialNo_1");
      await model.collection.createIndex({ serialNo: 1 }, { background: true, name: "serialNo_1" });
    }
  }

  const enrollmentIndexes = await Enrollment.collection.indexes();
  for (const field of ["rollNo", "registrationNo"] as const) {
    const name = `${field}_1`;
    const index = enrollmentIndexes.find((item) => item.name === name);
    if (index && (!index.unique || !index.sparse)) {
      const duplicates = await Enrollment.aggregate<{ _id: string; count: number }>([
        { $match: { [field]: { $exists: true, $ne: null } } },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 5 },
      ]);
      if (duplicates.length > 0) {
        throw new Error(
          `Cannot create unique ${name}; duplicate values exist: ${duplicates
            .map((item) => `${item._id} (${item.count})`)
            .join(", ")}`,
        );
      }
      await Enrollment.collection.dropIndex(name);
    }
    if (!index || !index.unique || !index.sparse) {
      await Enrollment.collection.createIndex(
        { [field]: 1 },
        { background: true, name, sparse: true, unique: true },
      );
    }
  }
}
