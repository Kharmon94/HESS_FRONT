import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Users, TrendingUp, Calendar, Phone, Mail, MessageSquare, CheckCircle, XCircle, Clock, Edit, X } from "lucide-react";
import { AdminCalendar } from "../components/AdminCalendar";
import { HoursWorked } from "../components/HoursWorked";
import { useInquiries } from "../contexts/InquiryContext";
import { api } from "@/services/api";

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

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  interestedPackage: string;
  submittedDate: string;
  status: "new" | "contacted" | "closed";
}


export function AdminDashboard() {
  const { inquiries, updateInquiryStatus } = useInquiries();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState<"calendar" | "clients" | "inquiries" | "hours">("calendar");
  const [clients, setClients] = useState<Client[]>([]);

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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
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

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Admin Dashboard</h1>
          <p className="text-[#9B9B9B]">Manage client profiles and track progress</p>
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
                    onClick={() => setFilterStatus("active")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "active"
                        ? "bg-[#9B7E3A] text-white"
                        : "bg-[#1a1a1a] text-[#9B9B9B] border border-[#3a3a3a]"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterStatus("inactive")}
                    className={`px-4 py-2 text-sm ${
                      filterStatus === "inactive"
                        ? "bg-[#9B7E3A] text-white"
                        : "bg-[#1a1a1a] text-[#9B9B9B] border border-[#3a3a3a]"
                    }`}
                  >
                    Inactive
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
                              <div className="text-sm text-[#9B9B9B]">Joined {new Date(client.joinDate).toLocaleDateString()}</div>
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
                        <p className="text-[#9B9B9B] text-xs">Joined {new Date(client.joinDate).toLocaleDateString()}</p>
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
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Inquiry Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white text-lg mb-1">{inquiry.name}</h3>
                          <p className="text-[#9B9B9B] text-sm">
                            {new Date(inquiry.submittedDate).toLocaleDateString()} • Interested in: {inquiry.interestedPackage}
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
                          <a href={`tel:${inquiry.phone}`} className="hover:text-white transition-colors">
                            {inquiry.phone}
                          </a>
                        </div>
                      </div>

                      <div className="bg-[#1a1a1a] p-4 border border-[#3a3a3a] rounded">
                        <p className="text-[#9B9B9B] text-sm leading-relaxed">{inquiry.message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:w-40">
                      <button
                        onClick={() => handleInquiryStatusChange(inquiry.id, "contacted")}
                        className="flex-1 lg:flex-none px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors whitespace-nowrap"
                        disabled={inquiry.status === "contacted" || inquiry.status === "closed"}
                      >
                        Mark Contacted
                      </button>
                      <button
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
              ))}
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
    </div>
  );
}