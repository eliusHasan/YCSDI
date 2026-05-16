import { Link } from "react-router-dom";

type InstituteLogoProps = {
  variant?: "header" | "footer";
};

export function InstituteLogo({ variant = "header" }: InstituteLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link className="inline-flex items-center gap-[22px]" to="/">
      <span
        className="grid size-28 shrink-0 place-items-center rounded-full border-[6px] border-theme-soft bg-[radial-gradient(circle_at_center,#ffffff_0_43%,transparent_44%),conic-gradient(#1B3C53,#234C6A,#456882,#D2C1B6,#1B3C53)]"
        aria-hidden="true"
      >
        <span className="grid size-[68px] place-items-center rounded-full border-[3px] border-theme-accent bg-white text-lg font-black text-theme-dark">
          YDI
        </span>
      </span>
      <span className="grid text-[26px] font-black uppercase leading-[1.15] tracking-normal">
        <span className={isFooter ? "text-white" : "text-theme-dark"}>Youth Career &</span>
        <span className={isFooter ? "text-white" : "text-theme-primary"}>Skill Development</span>
        <span className={isFooter ? "text-white" : "text-theme-accent"}>Institute</span>
      </span>
    </Link>
  );
}
