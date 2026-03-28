import { Calendar, CheckCircle, Clock, User, CreditCard, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { Session } from "../data/sessions";
import { BookingModal } from "../components/BookingModal";
import { useAuth } from "../contexts/AuthContext";
import { api } from "@/services/api";

export function PortalDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = useCallback(() => {
    if (!currentUser) return;
    api
      .listTrainingSessions()
      .then((res) => {
        const mapped: Session[] = res.training_sessions.map((s) => ({
          id: s.id,
          clientId: s.client_id,
          clientName: s.client_name || "",
          date: (s.date || "").split("T")[0],
          startTime: s.start_time || "09:00",
          endTime: s.end_time || "10:00",
          sessionType: s.session_type === "MATrX" ? "MATrX" : "Training",
          notes: s.notes || "",
          status: s.status as Session["status"],
        }));
        setSessions(mapped);
      })
      .catch(() => setSessions([]));
  }, [currentUser]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const upcomingSessions = useMemo(() => {
    if (!currentUser) return [];
    const now = new Date();
    return sessions
      .filter((session) => {
        if (session.clientId !== currentUser.id) return false;
        if (!["scheduled", "pending", "pending_cancellation"].includes(session.status)) return false;
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= now;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
      );
  }, [sessions, currentUser]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

  const handleCancelSession = async (sessionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this session? The admin will need to approve the cancellation."
      )
    ) {
      return;
    }
    try {
      await api.updateTrainingSession(sessionId, { status: "pending_cancellation" });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: "pending_cancellation" } : s))
      );
      alert("Cancellation request submitted. The admin will review your request.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not submit cancellation.");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate current password (in production, this would be checked against the database)
    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    // Validate new passwords match
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Validate password strength (basic example)
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    // Mock password change - in production this would call an API
    alert("Password changed successfully!");
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
  };

  // Format sessions for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2026-01-01T${startTime}`);
    const end = new Date(`2026-01-01T${endTime}`);
    const diff = (end.getTime() - start.getTime()) / 1000 / 60;
    return `${diff} min`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Personalized Header */}
        <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl text-white mb-2">
              {currentUser.firstName} {currentUser.lastName} <span className="text-[#9B7E3A]">Kaboom Portal</span>
            </h1>
            <p className="text-[#6b6b6b]">Member since {currentUser.memberSince}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAccountInfo(!showAccountInfo)}
              className="px-6 py-3 border-2 border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300 flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Account Info
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border-2 border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Information Panel */}
        {showAccountInfo && (
          <div className="mb-12">
            <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-[#9B7E3A]" />
                  <h2 className="text-3xl text-white">Account Information</h2>
                </div>
                <button
                  onClick={() => setShowAccountInfo(false)}
                  className="text-[#6b6b6b] hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#9B7E3A]" />
                      Personal Information
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Full Name</p>
                        <p className="text-white">{currentUser.firstName} {currentUser.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </p>
                        <p className="text-white">{currentUser.email}</p>
                      </div>
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </p>
                        <p className="text-white">{currentUser.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div>
                    <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#9B7E3A]" />
                      Password
                    </h3>
                    <div className="pl-7">
                      {!isChangingPassword ? (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <p className="text-white font-mono">••••••••••••</p>
                          </div>
                          <button
                            onClick={() => setIsChangingPassword(true)}
                            className="px-6 py-2 border border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300 text-sm"
                          >
                            Change Password
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                            <label htmlFor="currentPassword" className="block text-[#6b6b6b] text-sm mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                              placeholder="Enter current password"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="newPassword" className="block text-[#6b6b6b] text-sm mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                              placeholder="Enter new password"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="confirmNewPassword" className="block text-[#6b6b6b] text-sm mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirmNewPassword"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>
                          {passwordError && (
                            <p className="text-red-500 text-sm">{passwordError}</p>
                          )}
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 text-sm"
                            >
                              Update Password
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelPasswordChange}
                              className="flex-1 px-4 py-2 border border-[#9B7E3A]/50 text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl text-white mb-4">Membership Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Current Package</p>
                        <p className="text-white">{currentUser.package}</p>
                        <p className="text-[#9B7E3A] text-sm">{currentUser.packagePrice}</p>
                      </div>
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Sessions Remaining</p>
                        <p className="text-white text-2xl">{currentUser.sessionsRemaining}</p>
                      </div>
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Member Since</p>
                        <p className="text-white">{currentUser.memberSince}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#9B7E3A]" />
                      Payment Information
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Payment Method</p>
                        <p className="text-white font-mono">{currentUser.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-[#6b6b6b] text-sm mb-1">Billing Address</p>
                        <p className="text-white">{currentUser.billingAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#9B7E3A]/20">
                    <button className="w-full py-3 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 mb-3">
                      Update Payment Method
                    </button>
                    <button className="w-full py-3 border border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300">
                      Edit Account Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Overview - Side by Side */}
        <div className="mb-12 grid lg:grid-cols-2 gap-8">
          {/* All Time Sessions Section */}
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-[#9B7E3A]" />
              <h2 className="text-3xl text-white">All Time Sessions</h2>
            </div>
            
            {/* Total Sessions Display */}
            <div className="text-center py-12">
              <div className="text-7xl lg:text-8xl text-[#9B7E3A] mb-4 font-light">
                {currentUser.allTimeSessions}
              </div>
              <div className="text-xl text-[#6b6b6b]">
                Total Training Sessions Completed
              </div>
            </div>
          </div>

          {/* Current Package Progress */}
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-[#9B7E3A]" />
              <h2 className="text-3xl text-white">Current Package Progress</h2>
            </div>
            
            {/* Package Progress Display */}
            <div className="py-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#6b6b6b] text-sm mb-1">Elite 10-Pack Sessions</p>
                  <p className="text-white text-3xl">
                    <span className="text-[#9B7E3A]">{currentUser.sessionsCompleted}</span> of {currentUser.totalSessionsInPackage} Completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#6b6b6b] text-sm mb-1">Sessions Remaining</p>
                  <p className="text-white text-3xl">{currentUser.sessionsRemaining}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1a1a1a] h-4 border border-[#9B7E3A]/20 overflow-hidden">
                <div 
                  className="h-full bg-[#9B7E3A] transition-all duration-500"
                  style={{ width: `${(currentUser.sessionsCompleted / currentUser.totalSessionsInPackage) * 100}%` }}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-[#9B7E3A]/20">
                <p className="text-[#6b6b6b] text-center">
                  You're making great progress! {currentUser.sessionsRemaining} more sessions to complete your package.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-[#9B7E3A]" />
              <h2 className="text-3xl text-white">Your Schedule</h2>
            </div>

            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 bg-[#1a1a1a] border border-[#9B7E3A]/20 hover:border-[#9B7E3A]/40 transition-colors"
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-[#9B7E3A]" />
                        <span className="text-white text-xl">{session.sessionType}</span>
                        <span className={`px-3 py-1 text-xs border ${
                          session.status === "pending"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            : "bg-[#9B7E3A]/20 text-[#9B7E3A] border-[#9B7E3A]/30"
                        }`}>
                          {session.status === "pending" ? "PENDING APPROVAL" : "SCHEDULED"}
                        </span>
                      </div>
                      <div className="text-[#6b6b6b] mb-1">
                        <span className="text-white">{formatDate(session.date)}</span> at {formatTime(session.startTime)}
                      </div>
                      <div className="text-[#6b6b6b] text-sm">
                        Duration: {calculateDuration(session.startTime, session.endTime)}
                      </div>
                      {session.notes && (
                        <div className="text-[#6b6b6b] text-sm mt-2">
                          Note: {session.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button className="px-5 py-2 border border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-colors">
                        Reschedule
                      </button>
                      <button
                        className="px-5 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingSessions.length === 0 && (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-[#6b6b6b] mx-auto mb-4" />
                  <p className="text-[#6b6b6b] text-lg">No upcoming sessions scheduled.</p>
                  <p className="text-[#6b6b6b] text-sm mt-2">Click "Book New Session" to schedule your next appointment.</p>
                </div>
              )}
            </div>

            <button
              className="w-full mt-8 py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 text-lg"
              onClick={() => setIsBookingModalOpen(true)}
            >
              Book New Session
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        clientId={currentUser.id}
        clientName={
          currentUser.firstName?.trim() && currentUser.lastName?.trim()
            ? `${currentUser.firstName.trim().charAt(0)}. ${currentUser.lastName.trim()}`
            : [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ").trim() ||
              currentUser.email
        }
        sessions={sessions}
        onBooked={loadSessions}
      />
    </div>
  );
}