import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";

export function Root() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <ScrollToTop />
      <Navigation />
      <Outlet />
      <Footer />
    </div>
  );
}