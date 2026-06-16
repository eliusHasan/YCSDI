import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import Header from "./Header";
import { NoticeBar } from "./NoticeBar";

export function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <NoticeBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
