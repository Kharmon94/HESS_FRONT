import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import hessEliteLogo from "figma:asset/011d0f406da2b3a0da52e3f965ca543ab2f6d899.png";

function adminMobileActiveSection(pathname: string, search: string): string {
  if (pathname === "/admin/settings") return "settings";
  const raw = new URLSearchParams(search).get("tab");
  if (raw === "clients" || raw === "inquiries" || raw === "finances" || raw === "calendar") return raw;
  if (raw === "hours") return "calendar";
  return "calendar";
}

const navLinkClass = "block text-white hover:text-[#9B7E3A] transition-colors duration-300";
const navLinkActiveClass = "block text-[#9B7E3A] transition-colors duration-300";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  const isAdmin = location.pathname.startsWith("/admin");
  const isPortalMemberArea =
    location.pathname === "/portal/dashboard" || location.pathname.startsWith("/portal/dashboard/");
  const showPortalNav = Boolean(currentUser && isPortalMemberArea);

  if (isAdmin) {
    const active = adminMobileActiveSection(location.pathname, location.search);

    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#9B7E3A]/20 bg-[#1a1a1a]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center">
            <button
              type="button"
              className="shrink-0 text-[#9B7E3A] lg:hidden"
              aria-expanded={isOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setIsOpen((o) => !o)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex flex-1 justify-center lg:justify-center">
              <Link to="/admin" className="block shrink-0" onClick={closeMenu}>
                <img src={hessEliteLogo} alt="Hess Elite Logo" className="h-12 w-auto" />
              </Link>
            </div>
            <div className="w-10 shrink-0 lg:hidden" aria-hidden />
          </div>

          {isOpen && (
            <div
              id="admin-mobile-nav"
              className="space-y-4 border-t border-[#9B7E3A]/20 pb-6 pt-4 lg:hidden"
            >
              <Link
                to="/admin?tab=calendar"
                className={active === "calendar" ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Schedule calendar
              </Link>
              <Link
                to="/admin?tab=clients"
                className={active === "clients" ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Client management
              </Link>
              <Link
                to="/admin?tab=inquiries"
                className={active === "inquiries" ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Inquiries
              </Link>
              <Link
                to="/admin?tab=finances"
                className={active === "finances" ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Finances
              </Link>
              <Link
                to="/admin/settings"
                className={active === "settings" ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Settings
              </Link>
              <button
                type="button"
                className="block w-full text-left text-white hover:text-red-300 transition-colors duration-300"
                onClick={() => {
                  logout();
                  navigate("/");
                  closeMenu();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  if (showPortalNav) {
    const profileActive = new URLSearchParams(location.search).get("tab") === "profile";
    const billingActive = location.pathname === "/portal/dashboard/billing";
    const dashboardActive = location.pathname === "/portal/dashboard" && !profileActive;

    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#9B7E3A]/20 bg-[#1a1a1a]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center">
            <button
              type="button"
              className="shrink-0 text-[#9B7E3A] lg:hidden"
              aria-expanded={isOpen}
              aria-controls="portal-mobile-nav"
              onClick={() => setIsOpen((o) => !o)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex flex-1 justify-center">
              <Link to="/portal/dashboard" className="block shrink-0" onClick={closeMenu}>
                <img src={hessEliteLogo} alt="Hess Elite Logo" className="h-12 w-auto" />
              </Link>
            </div>
            <div className="w-10 shrink-0 lg:hidden" aria-hidden />
          </div>

          {isOpen && (
            <div
              id="portal-mobile-nav"
              className="space-y-4 border-t border-[#9B7E3A]/20 pb-6 pt-4 lg:hidden"
            >
              <Link
                to="/portal/dashboard"
                className={dashboardActive ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/portal/dashboard?tab=profile"
                className={profileActive ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Profile
              </Link>
              <Link
                to="/portal/dashboard/billing"
                className={billingActive ? navLinkActiveClass : navLinkClass}
                onClick={closeMenu}
              >
                Billing
              </Link>
              <button
                type="button"
                className="block w-full text-left text-white hover:text-red-300 transition-colors duration-300"
                onClick={() => {
                  logout();
                  navigate("/portal");
                  closeMenu();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-[#9B7E3A]/20 bg-[#1a1a1a00]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <button
              className="text-[#9B7E3A]"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="hidden md:inline text-base tracking-wide text-[#9B7E3A] uppercase">
              Start your transformation
            </span>
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={hessEliteLogo} alt="Hess Elite Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {isOpen && (
          <div className="pb-6 space-y-4">
            <Link
              to="/"
              className="block text-white hover:text-[#9B7E3A] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-white hover:text-[#9B7E3A] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/portal"
              className="block px-6 py-2.5 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 text-center"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
