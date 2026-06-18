import mongoose, { type Model } from "mongoose";
import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
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
}
