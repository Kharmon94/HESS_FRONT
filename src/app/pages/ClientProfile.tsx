import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api, type ApiUser } from "@/services/api";
import { ArrowLeft, Phone, Mail, Calendar, TrendingUp, Dumbbell, Target, FileText, Plus, CreditCard, MapPin, X, Lock } from "lucide-react";

interface WorkoutSession {
  id: string;
  date: string;
  type: string;
  duration: number;
}

interface Assessment {
  date: string;
  strength: number;
  mobility: number;
  endurance: number;
  notes: string;
}

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
  paymentMethod: {
    type: string;
    last4: string;
    fullNumber: string;
    expiryDate: string;
    cvc: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  medicalNotes: string;
  assessments: Assessment[];
  workoutHistory: WorkoutSession[];
}

function clientFromApi(u: ApiUser): Client {
  const addr = (u.billing_address || "").split(",").map((s) => s.trim());
  return {
    id: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email,
    email: u.email,
    phone: u.phone || "",
    package: u.package || "",
    joinDate: u.member_since || "",
    status: "active",
    sessionsCompleted: u.sessions_completed ?? 0,
    sessionsRemaining: u.sessions_remaining ?? 0,
    lastActivity: "—",
    paymentMethod: {
      type: "On file",
      last4: "—",
      fullNumber: u.payment_method || "—",
      expiryDate: "—",
      cvc: "—",
    },
    address: {
      street: addr[0] || "",
      city: addr[1] || "",
      state: addr[2] || "",
      zip: addr[3] || "",
    },
    medicalNotes: "",
    assessments: [],
    workoutHistory: [],
  };
}

export function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "assessments">("overview");
  const [showCardModal, setShowCardModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setClient(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getAdminClient(id)
      .then((res) => setClient(clientFromApi(res.client)))
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCardClick = () => {
    setShowCardModal(true);
    setPassword("");
    setPasswordError("");
    setIsUnlocked(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "FuckSnoopy") {
      setIsUnlocked(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const closeModal = () => {
    setShowCardModal(false);
    setPassword("");
    setPasswordError("");
    setIsUnlocked(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">Loading…</div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Client Not Found</h2>
          <Link to="/admin" className="text-[#9B7E3A] hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button - More Prominent */}
        <div className="mb-6">
          <Link
            to="/admin?tab=clients"
            className="inline-flex items-center gap-3 text-[#9B7E3A] hover:text-white transition-colors group"
          >
            <div className="p-2 border border-[#9B7E3A] group-hover:border-white group-hover:bg-[#9B7E3A]/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-lg font-light">Back to Client Management</span>
          </Link>
        </div>

        {/* Client Header */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl text-white mb-2">{client.name}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-[#9B9B9B]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(client.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                to={`/admin/client/${client.id}/edit`}
                className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors"
              >
                Edit Profile
              </Link>
              <button className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors">
                Message Client
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <Dumbbell className="w-5 h-5 text-[#9B7E3A]" />
              <span className="text-2xl text-white font-light">{client.sessionsCompleted}</span>
            </div>
            <p className="text-[#9B9B9B] text-sm">Sessions Completed</p>
          </div>

          <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-[#9B7E3A]" />
              <span className="text-2xl text-white font-light">{client.sessionsRemaining}</span>
            </div>
            <p className="text-[#9B9B9B] text-sm">Sessions Remaining</p>
          </div>

          <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#9B7E3A]" />
              <span className={`text-sm px-2 py-1 uppercase tracking-wider ${
                client.status === "active"
                  ? "bg-[#9B7E3A]/20 text-[#9B7E3A]"
                  : "bg-[#9B9B9B]/20 text-[#9B9B9B]"
              }`}>
                {client.status}
              </span>
            </div>
            <p className="text-[#9B9B9B] text-sm">Status</p>
          </div>
        </div>

        {/* Sessions Progress Bar */}
        <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a] mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Package Progress</h3>
            <span className="text-white text-sm">
              {client.sessionsCompleted} / {client.sessionsCompleted + client.sessionsRemaining} Sessions
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-[#1a1a1a] h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9B7E3A] transition-all duration-500"
                style={{ 
                  width: `${((client.sessionsCompleted / (client.sessionsCompleted + client.sessionsRemaining)) * 100)}%` 
                }}
              />
            </div>
            <p className="text-[#9B9B9B] text-sm mt-2">
              {Math.round((client.sessionsCompleted / (client.sessionsCompleted + client.sessionsRemaining)) * 100)}% of package completed
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] mb-8">
          <div className="flex border-b border-[#3a3a3a]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === "overview"
                  ? "text-[#9B7E3A] border-b-2 border-[#9B7E3A]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("workouts")}
              className={`px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === "workouts"
                  ? "text-[#9B7E3A] border-b-2 border-[#9B7E3A]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Workout History
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === "assessments"
                  ? "text-[#9B7E3A] border-b-2 border-[#9B7E3A]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Assessments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Information & Address */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Payment Information</h3>
                <button className="text-[#9B7E3A] hover:text-white">
                  <CreditCard className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={handleCardClick}
                  className="w-full flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#3a3a3a] hover:border-[#9B7E3A] transition-colors cursor-pointer text-left"
                >
                  <CreditCard className="w-5 h-5 text-[#9B7E3A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white">{client.paymentMethod.type}</p>
                    <p className="text-[#9B9B9B] text-sm">•••• •••• •••• {client.paymentMethod.last4}</p>
                    <p className="text-[#9B9B9B] text-sm">Expires {client.paymentMethod.expiryDate}</p>
                    <p className="text-[#9B7E3A] text-xs mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Click to view full details
                    </p>
                  </div>
                </button>
                <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#3a3a3a]">
                  <MapPin className="w-5 h-5 text-[#9B7E3A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white">{client.address.street}</p>
                    <p className="text-[#9B9B9B] text-sm">
                      {client.address.city}, {client.address.state} {client.address.zip}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
              <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-4">Package Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[#9B9B9B] text-sm">Current Package</span>
                  <p className="text-white text-lg">{client.package}</p>
                </div>
                <div>
                  <span className="text-[#9B9B9B] text-sm">Last Activity</span>
                  <p className="text-white">{new Date(client.lastActivity).toLocaleDateString()}</p>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors">
                  Upgrade Package
                </button>
              </div>
            </div>

            {/* Medical Notes */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Medical Notes</h3>
                <button className="text-[#9B7E3A] hover:text-white">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white leading-relaxed">{client.medicalNotes}</p>
            </div>
          </div>
        )}

        {activeTab === "workouts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-white text-xl">Attendance Tracker</h3>
                <p className="text-[#9B9B9B] text-sm mt-1">
                  {client.sessionsCompleted} total sessions on record
                </p>
              </div>
              <button className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors">
                Log Session
              </button>
            </div>

            {/* Timeline View */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
              <div className="space-y-4">
                {client.workoutHistory.map((session, index) => (
                  <div 
                    key={session.id} 
                    className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#3a3a3a] hover:border-[#9B7E3A] transition-colors group"
                  >
                    {/* Date Circle */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#9B7E3A]/10 border border-[#9B7E3A] flex-shrink-0">
                      <span className="text-[#9B7E3A] text-lg font-light">
                        {new Date(session.date).getDate()}
                      </span>
                      <span className="text-[#9B7E3A] text-xs uppercase">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-4 h-4 text-[#9B7E3A]" />
                        <h4 className="text-white font-light">{session.type}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[#9B9B9B] text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        <span className="text-[#3a3a3a]">•</span>
                        <span>{session.duration} minutes</span>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button className="text-[#9B9B9B] hover:text-[#9B7E3A] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              {client.workoutHistory.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-[#9B9B9B] mx-auto mb-4" />
                  <p className="text-[#9B9B9B]">No workout sessions recorded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "assessments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-xl">Performance Assessments</h3>
              <button className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors">
                New Assessment
              </button>
            </div>
            {client.assessments.map((assessment, index) => (
              <div key={index} className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white text-lg">{new Date(assessment.date).toLocaleDateString()}</h4>
                  <button className="text-[#9B7E3A] hover:text-white text-sm uppercase tracking-wider">
                    View Details
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#9B9B9B] text-sm">Strength</span>
                      <span className="text-white">{assessment.strength}%</span>
                    </div>
                    <div className="bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9B7E3A]"
                        style={{ width: `${assessment.strength}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#9B9B9B] text-sm">Mobility</span>
                      <span className="text-white">{assessment.mobility}%</span>
                    </div>
                    <div className="bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9B7E3A]"
                        style={{ width: `${assessment.mobility}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#9B9B9B] text-sm">Endurance</span>
                      <span className="text-white">{assessment.endurance}%</span>
                    </div>
                    <div className="bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9B7E3A]"
                        style={{ width: `${assessment.endurance}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-[#9B7E3A] text-sm uppercase tracking-wider mb-2">Notes</h5>
                  <p className="text-[#9B9B9B]">{assessment.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-8 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">
                {isUnlocked ? "Full Card Details" : "Restricted Access"}
              </h3>
              <button className="text-[#9B7E3A] hover:text-white transition-colors" onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="flex items-center justify-center p-6 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg">
                  <Lock className="w-12 h-12 text-[#9B7E3A]" />
                </div>
                <div>
                  <label className="block text-[#9B9B9B] text-sm mb-2">Enter Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#9B9B9B] focus:border-[#9B7E3A] focus:outline-none transition-colors"
                    placeholder="Enter password to unlock"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Unlock
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Full Card Details */}
                <div className="bg-[#1a1a1a] border border-[#9B7E3A] p-6 rounded-lg">
                  <CreditCard className="w-8 h-8 text-[#9B7E3A] mb-4" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-1">Card Type</p>
                      <p className="text-white text-lg">{client.paymentMethod.type}</p>
                    </div>
                    <div>
                      <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-1">Card Number</p>
                      <p className="text-white text-lg font-mono tracking-wider">{client.paymentMethod.fullNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-1">Expiration</p>
                        <p className="text-white">{client.paymentMethod.expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-1">CVC</p>
                        <p className="text-white font-mono">{client.paymentMethod.cvc}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white hover:border-[#9B7E3A] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}