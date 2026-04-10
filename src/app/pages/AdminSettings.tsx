import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { useInquiries } from "../contexts/InquiryContext";
import { api } from "@/services/api";

export function AdminSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { inquiries } = useInquiries();
  const [lowSessionsCount, setLowSessionsCount] = useState(0);

  useEffect(() => {
    api
      .listAdminClients()
      .then((res) => {
        const n = res.clients.filter((u) => {
          const remaining = u.sessions_remaining ?? 0;
          return remaining === 0 || remaining === 1;
        }).length;
        setLowSessionsCount(n);
      })
      .catch(() => setLowSessionsCount(0));
  }, []);

  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-0 lg:flex-row lg:items-start lg:gap-8">
        <AdminSidebar
          activeSection="settings"
          lowSessionsCount={lowSessionsCount}
          newInquiriesCount={newInquiriesCount}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <h1 className="text-4xl text-white mb-2">Settings</h1>
              <p className="text-[#9B9B9B]">Admin preferences and workspace options.</p>
            </div>

            <div className="space-y-6">
              <div className="border border-[#3a3a3a] bg-[#2a2a2a] p-6">
                <h2 className="text-lg text-[#9B7E3A] uppercase tracking-wider mb-2">Workspace</h2>
                <p className="text-[#9B9B9B] text-sm leading-relaxed">
                  Additional admin settings (notifications, defaults, integrations) can be added here as your workflow
                  grows.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
