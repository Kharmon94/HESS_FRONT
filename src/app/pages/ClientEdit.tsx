import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Save, CreditCard } from "lucide-react";
import { api, type ApiUser } from "@/services/api";

interface ClientEditData {
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
  progressScore: number;
  goals: string[];
  medicalNotes: string;
  // Payment information
  cardNumber: string;
  cardExpiration: string;
  cardCVV: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

function editFromApi(u: ApiUser): ClientEditData {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email;
  const addr = (u.billing_address || "").split(",").map((s) => s.trim());
  return {
    id: u.id,
    name,
    email: u.email,
    phone: u.phone || "",
    package: u.package || "",
    joinDate: u.member_since || "",
    status: "active",
    sessionsCompleted: u.sessions_completed ?? 0,
    sessionsRemaining: u.sessions_remaining ?? 0,
    lastActivity: "",
    progressScore: 0,
    goals: [],
    medicalNotes: "",
    cardNumber: u.payment_method || "",
    cardExpiration: "",
    cardCVV: "",
    billingAddress: addr[0] || "",
    billingCity: addr[1] || "",
    billingState: addr[2] || "",
    billingZip: addr[3] || "",
  };
}

export function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!id) {
      setClient(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getAdminClient(id)
      .then((res) => setClient(editFromApi(res.client)))
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleChange = (field: keyof ClientEditData, value: any) => {
    setClient({ ...client, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!client) return;
    const parts = client.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");
    try {
      await api.updateAdminClient(client.id, {
        first_name: firstName,
        last_name: lastName,
        email: client.email,
        phone: client.phone,
        package: client.package,
        sessions_completed: client.sessionsCompleted,
        sessions_remaining: client.sessionsRemaining,
        member_since: client.joinDate,
        payment_method: client.cardNumber,
        billing_address: [client.billingAddress, client.billingCity, client.billingState, client.billingZip]
          .filter(Boolean)
          .join(", "),
      });
      alert(`Client information updated successfully for ${client.name}`);
      setHasUnsavedChanges(false);
      navigate(`/admin/client/${client.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    navigate(`/admin/client/${client.id}`);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button - More Prominent */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-3 text-[#9B7E3A] hover:text-white transition-colors group"
          >
            <div className="p-2 border border-[#9B7E3A] group-hover:border-white group-hover:bg-[#9B7E3A]/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-lg font-light">Back to Client Profile</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white mb-2">Edit Client Profile</h1>
            <p className="text-[#9B9B9B]">{client.name}</p>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Personal Information */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 mb-8">
          <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Full Name</label>
              <input
                type="text"
                value={client.name}
                onChange={e => handleChange("name", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Email Address</label>
              <input
                type="email"
                value={client.email}
                onChange={e => handleChange("email", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Phone Number</label>
              <input
                type="tel"
                value={client.phone}
                onChange={e => handleChange("phone", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Start Date</label>
              <input
                type="date"
                value={client.joinDate}
                onChange={e => handleChange("joinDate", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
          </div>
        </div>

        {/* Package & Status Information */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 mb-8">
          <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-6">Package & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Package</label>
              <select
                value={client.package}
                onChange={e => handleChange("package", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              >
                <option value="Elite Evaluation">Elite Evaluation</option>
                <option value="Elite">Elite</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Status</label>
              <select
                value={client.status}
                onChange={e => handleChange("status", e.target.value as "active" | "inactive")}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Sessions Completed</label>
              <input
                type="number"
                value={client.sessionsCompleted}
                onChange={e => handleChange("sessionsCompleted", parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Sessions Remaining</label>
              <input
                type="number"
                value={client.sessionsRemaining}
                onChange={e => handleChange("sessionsRemaining", parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Progress Score (%)</label>
              <input
                type="number"
                value={client.progressScore}
                onChange={e => handleChange("progressScore", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Last Activity</label>
              <input
                type="date"
                value={client.lastActivity}
                onChange={e => handleChange("lastActivity", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-[#9B7E3A]" />
            <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Payment Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#9B9B9B] mb-2">Card Number</label>
              <input
                type="text"
                value={client.cardNumber}
                onChange={e => handleChange("cardNumber", e.target.value)}
                placeholder="•••• •••• •••• ••••"
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
              <p className="text-xs text-[#9B9B9B] mt-1">Card information is encrypted and stored securely</p>
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Expiration Date</label>
              <input
                type="text"
                value={client.cardExpiration}
                onChange={e => handleChange("cardExpiration", e.target.value)}
                placeholder="MM/YYYY"
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">Security Code (CVV)</label>
              <input
                type="text"
                value={client.cardCVV}
                onChange={e => handleChange("cardCVV", e.target.value)}
                placeholder="•••"
                maxLength={3}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 mb-8">
          <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-6">Billing Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#9B9B9B] mb-2">Street Address</label>
              <input
                type="text"
                value={client.billingAddress}
                onChange={e => handleChange("billingAddress", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">City</label>
              <input
                type="text"
                value={client.billingCity}
                onChange={e => handleChange("billingCity", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">State</label>
              <input
                type="text"
                value={client.billingState}
                onChange={e => handleChange("billingState", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9B9B9B] mb-2">ZIP Code</label>
              <input
                type="text"
                value={client.billingZip}
                onChange={e => handleChange("billingZip", e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
              />
            </div>
          </div>
        </div>

        {/* Medical Notes */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 mb-8">
          <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-6">Medical Notes</h2>
          <textarea
            value={client.medicalNotes}
            onChange={e => handleChange("medicalNotes", e.target.value)}
            rows={6}
            className="w-full p-3 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A] resize-none"
            placeholder="Enter any medical notes, restrictions, or important information..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-[#9B7E3A]/20 text-[#9B9B9B] hover:text-white hover:border-[#9B7E3A]/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}