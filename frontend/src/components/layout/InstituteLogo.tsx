import { Link } from "react-router-dom";

type InstituteLogoProps = {
  variant?: "header" | "footer";
};

export function InstituteLogo({ variant = "header" }: InstituteLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link className="inline-flex items-center gap-[22px]" to="/">
      <img src="/logo.png" alt="YCSDI logo" className="size-28 shrink-0 object-contain" />
      <span className="grid text-[26px] font-black uppercase leading-[1.15] tracking-normal">
        <span className={isFooter ? "text-white" : "text-theme-dark"}>Youth Career &</span>
        <span className={isFooter ? "text-white" : "text-theme-primary"}>Skill Development</span>
        <span className={isFooter ? "text-white" : "text-theme-accent"}>Institute</span>
      </span>
    </Link>
  );
}
