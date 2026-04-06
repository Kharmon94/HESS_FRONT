import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Users, TrendingUp, Calendar, Phone, Mail, MessageSquare, CheckCircle, XCircle, Clock, Edit, X, UserPlus } from "lucide-react";
import { AdminCalendar } from "../components/AdminCalendar";
import { HoursWorked } from "../components/HoursWorked";
import { useInquiries, type Inquiry } from "../contexts/InquiryContext";
import { api } from "@/services/api";
import { formatDisplayDate } from "@/utils/localDate";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  joinDate: string;
  status: "active" | "inactive";
  sessionsCompleted: number;
  sessionsRemaining: number;
  lastActivity: string;
}

export function AdminDashboard() {
  const { inquiries, updateInquiryStatus, refetchInquiries, inquiryUpdateError, clearInquiryUpdateError } =
    useInquiries();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  /** API has no inactive flag yet; only "all" vs "active" (same data today) is meaningful. */
  const [filterStatus, setFilterStatus] = useState<"all" | "active">("all");
  const [activeTab, setActiveTab] = useState<"calendar" | "clients" | "inquiries" | "hours">("calendar");
  const [clients, setClients] = useState<Client[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    api
      .listAdminClients()
      .then((res) => {
        setClients(
          res.clients.map((u) => ({
            id: u.id,
            name: [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email,
            email: u.email,
            phone: u.phone || "",
            package: u.package || "",
            joinDate: u.member_since || "—",
            status: "active" as const,
            sessionsCompleted: u.sessions_completed ?? 0,
            sessionsRemaining: u.sessions_remaining ?? 0,
            lastActivity: "—",
          }))
        );
      })
      .catch(() => setClients([]));
  }, []);

  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "clients" || tabParam === "inquiries" || tabParam === "hours" || tabParam === "calendar") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "inquiries") {
      void refetchInquiries();
    }
  }, [activeTab, refetchInquiries]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || client.status === "active";
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by sessions remaining: 0 first, then 1, then others
    if (a.sessionsRemaining === 0 && b.sessionsRemaining !== 0) return -1;
    if (a.sessionsRemaining !== 0 && b.sessionsRemaining === 0) return 1;
    if (a.sessionsRemaining === 1 && b.sessionsRemaining > 1) return -1;
    if (a.sessionsRemaining > 1 && b.sessionsRemaining === 1) return 1;
    return 0;
  });

  const lowSessionsCount = clients.filter(c => c.sessionsRemaining === 0 || c.sessionsRemaining === 1).length;

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "active").length,
    totalSessions: clients.reduce((sum, c) => sum + c.sessionsCompleted, 0),
    newInquiries: inquiries.filter(i => i.status === "new").length
  };

  const handleInquiryStatusChange = (inquiryId: string, newStatus: "new" | "contacted" | "closed") => {
    updateInquiryStatus(inquiryId, newStatus);
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteFeedback(null);
    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      setInviteFeedback({ type: "err", text: "Enter an email address." });
      return;
    }
    setInviteLoading(true);
    try {
      await api.inviteAdmin(trimmed);
      setInviteFeedback({
        type: "ok",
        text: "Invitation sent. They will receive an email with a link to set their password.",
      });
      setInviteEmail("");
    } catch (err) {
      setInviteFeedback({
        type: "err",
        text: err instanceof Error ? err.message : "Could not send invitation.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  function openInviteModal() {
    setInviteFeedback(null);
    setShowInviteModal(true);
  }

  function closeInviteModal() {
    if (inviteLoading) return;
    setShowInviteModal(false);
    setInviteFeedback(null);
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl text-white mb-2">Admin Dashboard</h1>
            <p className="text-[#9B9B9B]">Manage client profiles and track progress</p>
          </div>
          <button
            type="button"
            onClick={openInviteModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#9B7E3A] text-[#1a1a1a] text-sm font-medium uppercase tracking-wider hover:bg-[#B8963E] transition-colors shrink-0"
          >
            <UserPlus className="w-5 h-5" aria-hidden />
            Invite admin
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          <div className="bg-[#2a2a2a] p-4 lg:p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 lg:w-5 h-4 lg:h-5 text-[#9B7E3A]" />
              <span className="text-xl lg:text-2xl text-white font-light">{stats.totalClients}</span>
            </div>
            <p className="text-[#9B9B9B] text-xs lg:text-sm">Total Clients</p>
          </div>

          <div className="bg-[#2a2a2a] p-4 lg:p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 lg:w-5 h-4 lg:h-5 text-[#9B7E3A]" />
              <span className="text-xl lg:text-2xl text-white font-light">{stats.activeClients}</span>
            </div>
            <p className="text-[#9B9B9B] text-xs lg:text-sm">Active Clients</p>
          </div>

          <div className="bg-[#2a2a2a] p-4 lg:p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-[#9B7E3A]" />
              <span className="text-xl lg:text-2xl text-white font-light">{stats.totalSessions}</span>
            </div>
            <p className="text-[#9B9B9B] text-xs lg:text-sm">Total Sessions</p>
          </div>

          <div className="bg-[#2a2a2a] p-4 lg:p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-4 lg:w-5 h-4 lg:h-5 text-[#9B7E3A]" />
              <span className="text-xl lg:text-2xl text-white font-light">{stats.newInquiries}</span>
            </div>
            <p className="text-[#9B9B9B] text-xs lg:text-sm">New Inquiries</p>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 lg:flex bg-[#2a2a2a] border border-[#9B7E3A]/20">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-lg flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 transition-colors flex-1 ${
                activeTab === "calendar"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white hover:bg-[#9B7E3A]/10"
              }`}
            >
              <Calendar className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden lg:inline">Schedule Calendar</span>
              <span className="lg:hidden">Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clients")}
              className={`px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-lg flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 transition-colors border-l lg:border-x border-[#9B7E3A]/20 flex-1 relative ${
                activeTab === "clients"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white hover:bg-[#9B7E3A]/10"
              }`}
            >
              <Users className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden lg:inline">Client Management</span>
              <span className="lg:hidden">Clients</span>
              {lowSessionsCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {lowSessionsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inquiries")}
              className={`px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-lg flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 transition-colors border-t lg:border-t-0 flex-1 ${
                activeTab === "inquiries"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white hover:bg-[#9B7E3A]/10"
              }`}
            >
              <MessageSquare className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden lg:inline">New Inquiries</span>
              <span className="lg:hidden">Inquiries</span>
              {stats.newInquiries > 0 && (
                <span className="bg-[#9B7E3A] text-white text-xs px-2 py-1 rounded-full">
                  {stats.newInquiries}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hours")}
              className={`px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-lg flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 transition-colors border-t border-l lg:border-t-0 border-[#9B7E3A]/20 flex-1 ${
                activeTab === "hours"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white hover:bg-[#9B7E3A]/10"
              }`}
            >
              <Clock className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden lg:inline">Hours Worked</span>
              <span className="lg:hidden">Hours</span>
            </button>
          </div>
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div>
            <AdminCalendar />
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div>
            {/* Search and Filter Bar */}
            <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a] mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#9B9B9B] focus:outline-none focus:border-[#9B7E3A]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "all"
                        ? "bg-[#9B7E3A] text-white"
                        : "bg-[#1a1a1a] text-[#9B9B9B] border border-[#3a3a3a]"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("active")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "active"
                        ? "bg-[#9B7E3A] text-white"
                        : "bg-[#1a1a1a] text-[#9B9B9B] border border-[#3a3a3a]"
                    }`}
                  >
                    Active
                  </button>
                </div>
              </div>
            </div>

            {/* Client List */}
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-[#2a2a2a] border border-[#3a3a3a]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a] border-b border-[#3a3a3a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Package</th>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3a]">
                    {filteredClients.map((client) => {
                      // Determine row background color based on sessions remaining
                      let rowBgClass = "hover:bg-[#1a1a1a]";
                      if (client.sessionsRemaining === 0) {
                        rowBgClass = "bg-red-900/20 hover:bg-red-900/30 border-l-4 border-l-red-600";
                      } else if (client.sessionsRemaining === 1) {
                        rowBgClass = "bg-orange-900/20 hover:bg-orange-900/30 border-l-4 border-l-orange-500";
                      }
                      
                      return (
                        <tr key={client.id} className={`${rowBgClass} transition-colors`}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-white">{client.name}</div>
                              <div className="text-sm text-[#9B9B9B]">Joined {formatDisplayDate(client.joinDate)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                                <Mail className="w-4 h-4" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{client.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white">{client.package}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white">
                              {client.sessionsCompleted} completed
                            </div>
                            <div className={`text-sm font-bold ${
                              client.sessionsRemaining === 0 ? "text-red-500" :
                              client.sessionsRemaining === 1 ? "text-orange-500" :
                              "text-[#9B9B9B]"
                            }`}>
                              {client.sessionsRemaining} remaining
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs uppercase tracking-wider ${
                                client.status === "active"
                                  ? "bg-[#9B7E3A]/20 text-[#9B7E3A]"
                                  : "bg-[#9B9B9B]/20 text-[#9B9B9B]"
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link
                                to={`/admin/client/${client.id}`}
                                className="text-[#9B7E3A] hover:text-white transition-colors text-sm uppercase tracking-wider"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredClients.map((client) => {
                // Determine card styling based on sessions remaining
                let cardBorderClass = "border-[#3a3a3a]";
                let cardBgClass = "bg-[#2a2a2a]";
                if (client.sessionsRemaining === 0) {
                  cardBorderClass = "border-l-4 border-l-red-600 border-t border-r border-b border-[#3a3a3a]";
                  cardBgClass = "bg-red-900/10";
                } else if (client.sessionsRemaining === 1) {
                  cardBorderClass = "border-l-4 border-l-orange-500 border-t border-r border-b border-[#3a3a3a]";
                  cardBgClass = "bg-orange-900/10";
                }
                
                return (
                  <div key={client.id} className={`${cardBgClass} ${cardBorderClass} p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white text-lg mb-1">{client.name}</h3>
                        <p className="text-[#9B9B9B] text-xs">Joined {formatDisplayDate(client.joinDate)}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs uppercase tracking-wider ${
                          client.status === "active"
                            ? "bg-[#9B7E3A]/20 text-[#9B7E3A]"
                            : "bg-[#9B9B9B]/20 text-[#9B9B9B]"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-[#3a3a3a]">
                      <div>
                        <p className="text-[#9B9B9B] text-xs mb-1">Package</p>
                        <p className="text-white text-sm">{client.package}</p>
                      </div>
                      <div>
                        <p className="text-[#9B9B9B] text-xs mb-1">Sessions</p>
                        <p className="text-white text-sm">{client.sessionsCompleted} / {client.sessionsCompleted + client.sessionsRemaining}</p>
                        <p className={`text-xs font-bold ${
                          client.sessionsRemaining === 0 ? "text-red-500" :
                          client.sessionsRemaining === 1 ? "text-orange-500" :
                          "text-[#9B9B9B]"
                        }`}>{client.sessionsRemaining} left</p>
                      </div>
                    </div>

                    <Link
                      to={`/admin/client/${client.id}`}
                      className="block w-full py-2 text-center bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#9B7E3A]/80 transition-colors text-sm uppercase tracking-wider"
                    >
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>

            {filteredClients.length === 0 && (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-12 text-center mt-8">
                <p className="text-[#9B9B9B]">No clients found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div>
            {inquiryUpdateError && (
              <div
                className="mb-4 flex items-start justify-between gap-4 border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                <p>{inquiryUpdateError}</p>
                <button
                  type="button"
                  onClick={clearInquiryUpdateError}
                  className="shrink-0 uppercase tracking-wider text-xs opacity-80 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="space-y-4">
              {inquiries.map((inquiry: Inquiry) => {
                const displayName = inquiry.name.trim() || inquiry.email;
                const phoneDigits = inquiry.phone.trim();
                const phoneForTel = phoneDigits.replace(/\D/g, "");
                return (
                <div key={inquiry.id} className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Inquiry Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white text-lg mb-1">{displayName}</h3>
                          <p className="text-[#9B9B9B] text-sm">
                            {formatDisplayDate(inquiry.submittedDate)} • Interested in:{" "}
                            {inquiry.interestedPackage.trim() || "—"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-2 ${
                            inquiry.status === "new"
                              ? "bg-[#9B7E3A]/20 text-[#9B7E3A]"
                              : inquiry.status === "contacted"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-[#9B9B9B]/20 text-[#9B9B9B]"
                          }`}
                        >
                          {inquiry.status === "new" && <Clock className="w-3 h-3" />}
                          {inquiry.status === "contacted" && <MessageSquare className="w-3 h-3" />}
                          {inquiry.status === "closed" && <CheckCircle className="w-3 h-3" />}
                          {inquiry.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${inquiry.email}`} className="hover:text-white transition-colors">
                            {inquiry.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-[#9B9B9B] text-sm">
                          <Phone className="w-4 h-4" />
                          {phoneDigits && phoneForTel.length >= 7 ? (
                            <a href={`tel:${phoneForTel}`} className="hover:text-white transition-colors">
                              {inquiry.phone}
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#1a1a1a] p-4 border border-[#3a3a3a] rounded">
                        <p className="text-[#9B9B9B] text-sm leading-relaxed">{inquiry.message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:w-44">
                      <button
                        type="button"
                        onClick={() => handleInquiryStatusChange(inquiry.id, "new")}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors whitespace-nowrap"
                        disabled={inquiry.status === "new"}
                      >
                        Mark New
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInquiryStatusChange(inquiry.id, "contacted")}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors whitespace-nowrap"
                        disabled={inquiry.status === "contacted" || inquiry.status === "closed"}
                      >
                        Mark Contacted
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInquiryStatusChange(inquiry.id, "closed")}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors whitespace-nowrap"
                        disabled={inquiry.status === "closed"}
                      >
                        Close
                      </button>
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors text-center whitespace-nowrap"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {inquiries.length === 0 && (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-12 text-center">
                <MessageSquare className="w-12 h-12 text-[#9B9B9B] mx-auto mb-4" />
                <p className="text-[#9B9B9B]">No inquiries at this time.</p>
              </div>
            )}
          </div>
        )}

        {/* Hours Worked Tab */}
        {activeTab === "hours" && (
          <div>
            <HoursWorked />
          </div>
        )}
      </div>

      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => closeInviteModal()}
          onKeyDown={(ev) => ev.key === "Escape" && closeInviteModal()}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md bg-[#2a2a2a] border border-[#9B7E3A]/30 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-admin-title"
          >
            <button
              type="button"
              onClick={() => closeInviteModal()}
              disabled={inviteLoading}
              className="absolute top-4 right-4 text-[#9B9B9B] hover:text-white transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="w-8 h-8 text-[#9B7E3A] shrink-0" aria-hidden />
                <h2 id="invite-admin-title" className="text-xl text-white font-medium pr-8">
                  Invite admin
                </h2>
              </div>
              <p className="text-[#9B9B9B] text-sm mb-6 leading-relaxed">
                Send an email with a link to set a password. New users are created as admins; existing clients are
                promoted.
              </p>

              <form onSubmit={handleInviteAdmin} className="space-y-4">
                <div>
                  <label htmlFor="invite-admin-email" className="block text-[#9B9B9B] text-xs uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    id="invite-admin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#9B7E3A]"
                  />
                </div>
                {inviteFeedback && (
                  <p
                    className={`text-sm ${inviteFeedback.type === "ok" ? "text-green-400" : "text-red-400"}`}
                    role={inviteFeedback.type === "err" ? "alert" : undefined}
                  >
                    {inviteFeedback.text}
                  </p>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => closeInviteModal()}
                    disabled={inviteLoading}
                    className="px-4 py-3 text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-6 py-3 bg-[#9B7E3A] text-[#1a1a1a] text-sm font-medium uppercase tracking-wider hover:bg-[#B8963E] transition-colors disabled:opacity-50"
                  >
                    {inviteLoading ? "Sending…" : "Send invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}