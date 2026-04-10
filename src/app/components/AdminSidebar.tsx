import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Users,
  MessageSquare,
  Wallet,
  LogOut,
  Settings,
} from "lucide-react";

export type AdminNavSection = "calendar" | "clients" | "inquiries" | "finances" | "settings";

type AdminSidebarProps = {
  activeSection: AdminNavSection;
  lowSessionsCount: number;
  newInquiriesCount: number;
  onLogout: () => void;
};

export function AdminSidebar({ activeSection, lowSessionsCount, newInquiriesCount, onLogout }: AdminSidebarProps) {
  const tabLink = (tab: "calendar" | "finances", label: string, icon: ReactNode) => (
    <Link
      to={`/admin?tab=${tab}`}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm uppercase tracking-wider transition-colors ${
        activeSection === tab
          ? "bg-[#9B7E3A] text-[#1a1a1a]"
          : "text-[#9B9B9B] hover:bg-[#9B7E3A]/10 hover:text-white"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1">{label}</span>
    </Link>
  );

  return (
    <aside
      id="admin-sidebar"
      className="hidden min-h-[calc(100dvh-7rem)] w-60 shrink-0 flex-col border border-[#3a3a3a] bg-[#2a2a2a] p-3 lg:flex"
    >
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="Admin sections">
        {tabLink(
          "calendar",
          "Schedule calendar",
          <Calendar className="h-5 w-5 shrink-0" aria-hidden />
        )}
        <Link
          to="/admin?tab=clients"
          className={`relative flex w-full items-center gap-3 px-3 py-3 text-left text-sm uppercase tracking-wider transition-colors ${
            activeSection === "clients"
              ? "bg-[#9B7E3A] text-[#1a1a1a]"
              : "text-[#9B9B9B] hover:bg-[#9B7E3A]/10 hover:text-white"
          }`}
        >
          <Users className="h-5 w-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">Client management</span>
          {lowSessionsCount > 0 && (
            <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{lowSessionsCount}</span>
          )}
        </Link>
        <Link
          to="/admin?tab=inquiries"
          className={`relative flex w-full items-center gap-3 px-3 py-3 text-left text-sm uppercase tracking-wider transition-colors ${
            activeSection === "inquiries"
              ? "bg-[#9B7E3A] text-[#1a1a1a]"
              : "text-[#9B9B9B] hover:bg-[#9B7E3A]/10 hover:text-white"
          }`}
        >
          <MessageSquare className="h-5 w-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">Inquiries</span>
          {newInquiriesCount > 0 && (
            <span className="shrink-0 rounded-full bg-[#9B7E3A] px-2 py-0.5 text-xs text-[#1a1a1a]">{newInquiriesCount}</span>
          )}
        </Link>
        {tabLink("finances", "Finances", <Wallet className="h-5 w-5 shrink-0" aria-hidden />)}
        <Link
          to="/admin/settings"
          className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm uppercase tracking-wider transition-colors ${
            activeSection === "settings"
              ? "bg-[#9B7E3A] text-[#1a1a1a]"
              : "text-[#9B9B9B] hover:bg-[#9B7E3A]/10 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">Settings</span>
        </Link>
      </nav>
      <div className="mt-auto shrink-0 border-t border-[#3a3a3a] pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm uppercase tracking-wider text-[#9B9B9B] transition-colors hover:bg-red-950/40 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
