import { AdmitCard } from "../models/AdmitCard.js";
import { Certificate } from "../models/Certificate.js";
import { Marksheet } from "../models/Marksheet.js";
import { RegistrationCard } from "../models/RegistrationCard.js";
import { Student } from "../models/Student.js";

/** Random 9-digit number (100000000 - 999999999), matching the reference documents. */
function random9(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

/**
 * Generates a 9-digit serial number that is unique across every issued document
 * type, so the public verify endpoint can resolve a serial unambiguously.
 */
export async function generateSerialNo(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = random9();
    const [a, b, c, d, e] = await Promise.all([
      RegistrationCard.exists({ serialNo: candidate }),
      AdmitCard.exists({ serialNo: candidate }),
      Marksheet.exists({ serialNo: candidate }),
      Certificate.exists({ serialNo: candidate }),
      Student.exists({ serialNo: candidate }),
    ]);
    if (!a && !b && !c && !d && !e) return candidate;
  }
  throw new Error("Could not generate a unique serial number");
}
