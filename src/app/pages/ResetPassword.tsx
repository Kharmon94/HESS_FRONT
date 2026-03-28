import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { api, setStoredToken } from "@/services/api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setEmail(searchParams.get("email") || "");
    const tokenParam =
      searchParams.get("token") || searchParams.get("reset_password_token") || "";
    setToken(tokenParam);
    setError("");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    try {
      const res = await api.resetPassword({
        reset_password_token: token,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStoredToken(res.token);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-10 text-center">
            <div className="flex items-center justify-center p-6 bg-[#1a1a1a] border border-[#9B7E3A] rounded-lg mb-6">
              <CheckCircle className="w-16 h-16 text-[#9B7E3A]" />
            </div>
            
            <h2 className="text-2xl text-white mb-4">Password Reset Successful!</h2>
            <p className="text-[#6b6b6b] mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <Link
              to="/portal"
              className="inline-block w-full py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center p-6 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg mb-6 mx-auto w-fit">
              <Lock className="w-12 h-12 text-[#9B7E3A]" />
            </div>
            <h2 className="text-2xl text-white mb-2">Reset Your Password</h2>
            {email && (
              <p className="text-[#6b6b6b]">
                Setting new password for <span className="text-[#9B7E3A]">{email}</span>
              </p>
            )}
          </div>

          {!token && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 text-sm">
                    Invalid or expired reset link. Please request a new password reset.
                  </p>
                  <Link
                    to="/portal"
                    className="text-[#9B7E3A] text-sm hover:text-[#B8963E] transition-colors mt-2 inline-block"
                  >
                    Return to login page
                  </Link>
                </div>
              </div>
            </div>
          )}

          {token && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors pr-12"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#9B7E3A] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[#6b6b6b] text-xs mt-2">Must be at least 8 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors pr-12"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#9B7E3A] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Reset Password
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-[#9B7E3A]/20 text-center">
            <Link to="/portal" className="text-[#9B7E3A] hover:text-[#B8963E] transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
