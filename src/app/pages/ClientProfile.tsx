import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api, type ApiAssessment, type ApiUser } from "@/services/api";
import { formatDisplayDate } from "@/utils/localDate";
import { ArrowLeft, Phone, Mail, Calendar, TrendingUp, Dumbbell, Target, FileText, Plus, CreditCard, MapPin } from "lucide-react";

interface WorkoutSession {
  id: string;
  date: string;
  type: string;
  duration: number;
}

interface Assessment {
  id: string;
  date: string;
  strength: number;
  mobility: number;
  endurance: number;
  notes: string;
}

function assessmentFromApi(a: ApiAssessment): Assessment {
  return {
    id: a.id,
    date: a.performed_on || "",
    strength: a.strength,
    mobility: a.mobility,
    endurance: a.endurance,
    notes: a.notes || "",
  };
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
  /** Non-sensitive summary from CRM (e.g. Stripe brand / last4); never full PAN or CVC. */
  paymentMethodSummary: string;
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
    paymentMethodSummary: u.payment_method?.trim() || "Not on file",
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
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [detailAssessment, setDetailAssessment] = useState<Assessment | null>(null);
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    performed_on: "",
    strength: 50,
    mobility: 50,
    endurance: 50,
    notes: "",
  });

  useEffect(() => {
    if (!id) {
      setClient(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getAdminClient(id)
      .then(async (clientRes) => {
        const c = clientFromApi(clientRes.client);
        try {
          const assessRes = await api.listAdminAssessments(id);
          c.assessments = assessRes.assessments.map(assessmentFromApi);
        } catch {
          c.assessments = [];
        }
        setClient(c);
      })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id]);

  function openNewAssessmentModal() {
    setNewAssessmentForm({
      performed_on: new Date().toISOString().slice(0, 10),
      strength: 50,
      mobility: 50,
      endurance: 50,
      notes: "",
    });
    setShowNewAssessment(true);
  }

  async function submitNewAssessment() {
    if (!id || !newAssessmentForm.performed_on.trim()) return;
    setAssessmentSaving(true);
    try {
      const { assessment } = await api.createAdminAssessment(id, {
        performed_on: newAssessmentForm.performed_on,
        strength: Math.min(100, Math.max(0, Math.round(Number(newAssessmentForm.strength)))),
        mobility: Math.min(100, Math.max(0, Math.round(Number(newAssessmentForm.mobility)))),
        endurance: Math.min(100, Math.max(0, Math.round(Number(newAssessmentForm.endurance)))),
        notes: newAssessmentForm.notes.trim() || undefined,
      });
      const row = assessmentFromApi(assessment);
      setClient((prev) =>
        prev ? { ...prev, assessments: [row, ...prev.assessments.filter((a) => a.id !== row.id)] } : null
      );
      setShowNewAssessment(false);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not save assessment");
    } finally {
      setAssessmentSaving(false);
    }
  }

  async function deleteAssessment(assessmentId: string) {
    if (!window.confirm("Delete this assessment?")) return;
    setAssessmentSaving(true);
    try {
      await api.deleteAdminAssessment(assessmentId);
      setClient((prev) =>
        prev ? { ...prev, assessments: prev.assessments.filter((a) => a.id !== assessmentId) } : null
      );
      setDetailAssessment(null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setAssessmentSaving(false);
    }
  }

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

  const packageSessionTotal = client.sessionsCompleted + client.sessionsRemaining;
  const packageProgressPercent =
    packageSessionTotal > 0 ? Math.round((client.sessionsCompleted / packageSessionTotal) * 100) : 0;
  const packageProgressWidth =
    packageSessionTotal > 0 ? (client.sessionsCompleted / packageSessionTotal) * 100 : 0;

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
                  <span>Joined {formatDisplayDate(client.joinDate)}</span>
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
              <a
                href={`mailto:${encodeURIComponent(client.email)}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white transition-colors"
              >
                Send Email
              </a>
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
                style={{ width: `${packageProgressWidth}%` }}
              />
            </div>
            <p className="text-[#9B9B9B] text-sm mt-2">
              {packageProgressPercent}% of package completed
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] mb-8">
          <div className="flex border-b border-[#3a3a3a]">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
                <CreditCard className="w-5 h-5 text-[#9B7E3A]" aria-hidden />
              </div>
              <div className="space-y-4">
                <div className="w-full flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#3a3a3a]">
                  <CreditCard className="w-5 h-5 text-[#9B7E3A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-1">On file (summary)</p>
                    <p className="text-white font-mono text-sm">{client.paymentMethodSummary}</p>
                    <p className="text-[#6b6b6b] text-xs mt-2">
                      Card details are managed in your payment processor. Full numbers are never shown here.
                    </p>
                  </div>
                </div>
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
                  <p className="text-white">
                    {client.lastActivity && client.lastActivity !== "—" && !Number.isNaN(Date.parse(client.lastActivity))
                      ? new Date(client.lastActivity).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Not available yet"
                  className="w-full mt-4 px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider opacity-50 cursor-not-allowed"
                >
                  Upgrade Package
                </button>
              </div>
            </div>

            {/* Medical Notes */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Medical Notes</h3>
                <button
                  type="button"
                  disabled
                  title="Not available yet"
                  className="text-[#9B7E3A] opacity-40 cursor-not-allowed"
                >
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
              <button
                type="button"
                disabled
                title="Not available yet — log sessions from the schedule calendar"
                className="px-4 py-2 bg-[#9B7E3A]/50 text-white text-sm uppercase tracking-wider cursor-not-allowed opacity-70"
              >
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
                    <button
                      type="button"
                      disabled
                      title="Not available yet"
                      className="text-[#9B9B9B] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-40 cursor-not-allowed transition-opacity"
                    >
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
              <button
                type="button"
                onClick={openNewAssessmentModal}
                className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#B8963E] transition-colors"
              >
                New Assessment
              </button>
            </div>
            {client.assessments.map((assessment) => (
              <div key={assessment.id} className="bg-[#2a2a2a] border border-[#3a3a3a] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white text-lg">
                    {assessment.date
                      ? new Date(assessment.date + "T12:00:00").toLocaleDateString()
                      : "—"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setDetailAssessment(assessment)}
                    className="text-[#9B7E3A] text-sm uppercase tracking-wider hover:text-white transition-colors"
                  >
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
                  <p className="text-[#9B9B9B]">{assessment.notes || "—"}</p>
                </div>
              </div>
            ))}
            {client.assessments.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-[#9B9B9B] mx-auto mb-4" />
                <p className="text-[#9B9B9B]">No assessments yet. Add one to track strength, mobility, and endurance.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showNewAssessment && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !assessmentSaving && setShowNewAssessment(false)}
          onKeyDown={(ev) => ev.key === "Escape" && !assessmentSaving && setShowNewAssessment(false)}
          role="presentation"
        >
          <div
            className="bg-[#2a2a2a] border border-[#3a3a3a] max-w-lg w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-assessment-title"
          >
            <h3 id="new-assessment-title" className="text-white text-xl mb-6">
              New assessment
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-[#9B9B9B] text-sm uppercase tracking-wider">Date</span>
                <input
                  type="date"
                  value={newAssessmentForm.performed_on}
                  onChange={(e) => setNewAssessmentForm((f) => ({ ...f, performed_on: e.target.value }))}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white px-3 py-2"
                />
              </label>
              {(["strength", "mobility", "endurance"] as const).map((field) => (
                <label key={field} className="block">
                  <span className="text-[#9B9B9B] text-sm capitalize">{field} (0–100)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newAssessmentForm[field]}
                    onChange={(e) =>
                      setNewAssessmentForm((f) => ({ ...f, [field]: Number(e.target.value) }))
                    }
                    className="mt-1 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white px-3 py-2"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-[#9B9B9B] text-sm uppercase tracking-wider">Notes</span>
                <textarea
                  value={newAssessmentForm.notes}
                  onChange={(e) => setNewAssessmentForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white px-3 py-2 resize-y"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                disabled={assessmentSaving}
                onClick={() => setShowNewAssessment(false)}
                className="px-4 py-2 text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assessmentSaving || !newAssessmentForm.performed_on}
                onClick={() => void submitNewAssessment()}
                className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#B8963E] disabled:opacity-50"
              >
                {assessmentSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailAssessment && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !assessmentSaving && setDetailAssessment(null)}
          role="presentation"
        >
          <div
            className="bg-[#2a2a2a] border border-[#3a3a3a] max-w-lg w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assessment-detail-title"
          >
            <h3 id="assessment-detail-title" className="text-white text-xl mb-2">
              Assessment
            </h3>
            <p className="text-[#9B9B9B] text-sm mb-6">
              {detailAssessment.date
                ? new Date(detailAssessment.date + "T12:00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {(["strength", "mobility", "endurance"] as const).map((field) => (
                <div key={field}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#9B9B9B] capitalize">{field}</span>
                    <span className="text-white">{detailAssessment[field]}%</span>
                  </div>
                  <div className="bg-[#1a1a1a] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9B7E3A]"
                      style={{ width: `${detailAssessment[field]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <h5 className="text-[#9B7E3A] text-sm uppercase tracking-wider mb-2">Notes</h5>
              <p className="text-[#9B9B9B] whitespace-pre-wrap">{detailAssessment.notes || "—"}</p>
            </div>
            <div className="flex justify-between gap-3">
              <button
                type="button"
                disabled={assessmentSaving}
                onClick={() => void deleteAssessment(detailAssessment.id)}
                className="px-4 py-2 text-red-400/90 text-sm uppercase tracking-wider hover:text-red-300 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                disabled={assessmentSaving}
                onClick={() => setDetailAssessment(null)}
                className="px-4 py-2 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#B8963E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}