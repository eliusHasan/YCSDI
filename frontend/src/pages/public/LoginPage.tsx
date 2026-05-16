export function LoginPage() {
  return (
    <section className="mx-auto grid min-h-[420px] w-[min(1280px,calc(100%-48px))] items-start justify-items-center py-[70px]">
      <div className="w-[min(560px,100%)] rounded-lg border border-theme-soft/70 bg-white p-6 shadow-[0_14px_36px_rgba(27,60,83,0.08)]">
        <h1 className="mb-5 text-[clamp(38px,5vw,68px)] leading-[1.08]">Login</h1>
        <form className="grid gap-[18px]">
          <label className="grid gap-2 font-bold text-theme-dark">
            Email
            <input className="min-h-[54px] w-full rounded-lg border border-theme-soft px-4 outline-theme-accent" type="email" placeholder="Enter your email" />
          </label>
          <label className="grid gap-2 font-bold text-theme-dark">
            Password
            <input className="min-h-[54px] w-full rounded-lg border border-theme-soft px-4 outline-theme-accent" type="password" placeholder="Enter your password" />
          </label>
          <button className="min-h-14 rounded-lg bg-theme-accent font-extrabold text-white" type="submit">Login</button>
        </form>
      </div>
    </section>
  );
}
