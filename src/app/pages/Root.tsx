import { Outlet, useLocation } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";

export function Root() {
  const { pathname } = useLocation();
  const hideFooter = pathname.startsWith("/admin") || pathname.startsWith("/portal/dashboard");

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <ScrollToTop />
      <Navigation />
      <Outlet />
      {!hideFooter && <Footer />}
    </div>
  );
}