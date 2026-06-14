import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { render as renderAdmit } from "../utils/pdf/admit-card.js";
import { render as renderCert } from "../utils/pdf/certificate.js";
import { render as renderMark } from "../utils/pdf/marksheet.js";
import { render as renderReg } from "../utils/pdf/registration-card.js";

const out = process.cwd();
const common = {
  serialNo: "325699869",
  studentName: "Mst Farhana Rahaman",
  fatherName: "Md Anish Ur Rahaman",
  motherName: "Mst Rahana Parvin",
  rollNo: "7813",
  registrationNo: "239285",
  session: "January 2022 - December 2025",
  instituteName: "Youth Career & Skill Development Institute",
  courseTitle: "Diploma in Construction",
};

async function main() {
  const reg = await renderReg({
    ...common,
    gender: "Female",
    postOffice: "Mohanpur -5942",
    upazilla: "Akkelpur",
    district: "Joypurhat",
    courseCode: "DIC",
    courseDuration: "Six Months",
  });
  writeFileSync(resolve(out, "smoke-registration.pdf"), reg);

  const admit = await renderAdmit({
    ...common,
    dateOfBirth: new Date("2003-02-16"),
    subjectName: common.courseTitle,
    sex: "Female",
  });
  writeFileSync(resolve(out, "smoke-admit.pdf"), admit);

  const mark = await renderMark({
    ...common,
    courseDuration: "2 Years",
    subjects: [
      { name: "Construction Materials", fullMark: 100, obtainedMark: 85, letterGrade: "A+", gradePoint: 4.0 },
      { name: "Structural Engineering", fullMark: 100, obtainedMark: 78, letterGrade: "A", gradePoint: 3.75 },
      { name: "Surveying & Levelling", fullMark: 100, obtainedMark: 92, letterGrade: "A+", gradePoint: 4.0 },
      { name: "AutoCAD & Drafting", fullMark: 100, obtainedMark: 88, letterGrade: "A+", gradePoint: 4.0 },
      { name: "Estimating & Costing", fullMark: 100, obtainedMark: 71, letterGrade: "A-", gradePoint: 3.5 },
    ],
    totalFull: 500,
    totalObtained: 414,
    letterGrade: "A+",
    cgpa: 3.85,
  });
  writeFileSync(resolve(out, "smoke-marksheet.pdf"), mark);

  const cert = await renderCert({
    ...common,
    certificateNumber: "YCSDI-CERT-2025-0001",
    cgpa: 3.75,
    letterGrade: "A",
    examDate: new Date("2016-12-27"),
    issuedDate: new Date("2017-02-27"),
    centerCode: "5001",
    courseDuration: "Six Months",
  });
  writeFileSync(resolve(out, "smoke-certificate.pdf"), cert);

  console.log("OK: wrote 4 smoke PDFs to", out);
}

main().catch((e) => {
  console.error("SMOKE FAILED:", e);
  process.exit(1);
});
