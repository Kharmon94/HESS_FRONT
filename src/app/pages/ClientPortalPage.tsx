import { Lock, Calendar, BarChart3, MessageSquare, Mail, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api, setStoredToken } from "@/services/api";
import { userFromApi } from "@/utils/mapUser";

export function ClientPortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("elite-evaluation");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const packages = [
    { id: "elite-evaluation", name: "Elite Evaluation", price: "$350 one-time" },
    { id: "elite", name: "Elite", price: "$2,500 for 10-pack" },
    { id: "vip", name: "VIP", price: "Custom pricing - Call for details" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSignupError("");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setSignupError("Passwords do not match!");
        return;
      }

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const selectedPkg = packages.find((p) => p.id === selectedPackage);
      const packageName = selectedPkg?.name || "Elite Evaluation";
      const packagePrice = selectedPkg?.price || "$350 one-time";

      let sessionsTotal = 1;
      let sessionsRemaining = 1;
      if (selectedPackage === "elite") {
        sessionsTotal = 10;
        sessionsRemaining = 10;
      } else if (selectedPackage === "vip") {
        sessionsTotal = 25;
        sessionsRemaining = 25;
      }

      try {
        const res = await api.signUp({
          email,
          password,
          password_confirmation: confirmPassword,
          first_name: firstName,
          last_name: lastName,
          phone,
          package: packageName,
          package_price: packagePrice,
          sessions_remaining: sessionsRemaining,
          sessions_completed: 0,
          total_sessions_in_package: sessionsTotal,
          all_time_sessions: 0,
          member_since: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          payment_method: "•••• •••• •••• ••••",
          billing_address: "",
        });
        setStoredToken(res.token);
        login(userFromApi(res.user));
        navigate("/portal/dashboard");
      } catch (err) {
        setSignupError(err instanceof Error ? err.message : "Sign up failed.");
      }
    } else {
      try {
        const res = await api.signIn(email, password);
        setStoredToken(res.token);
        const u = userFromApi(res.user);
        login(u);
        if (u.role === "admin") navigate("/admin");
        else navigate("/portal/dashboard");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const looksLikeBadCredentials =
          /invalid|incorrect|unauthorized/i.test(msg) || /\b401\b/.test(msg);
        setLoginError(
          looksLikeBadCredentials
            ? "The email or password you entered is incorrect. Please try again."
            : msg || "Unable to sign in. Check your connection and that the app was built with VITE_API_URL pointing at your API."
        );
      }
    }
  };

  const portalFeatures = [
    {
      icon: Calendar,
      title: "Schedule Sessions",
      description: "Book and manage your training appointments"
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "View detailed analytics and performance metrics"
    },
    {
      icon: Lock,
      title: "Secure Access",
      description: "Protected portal for your personal data"
    }
  ];

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await api.forgotPassword(resetEmail);
      setEmailSent(true);
    } catch {
      setEmailSent(true);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setResetEmail("");
    setEmailSent(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Login Hero Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Portal Features - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
                <span className="text-[#9B7E3A] tracking-widest text-sm">CLIENT PORTAL</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl text-white mb-6">
                Your Personal Dashboard
              </h1>
              
              <p className="text-xl text-[#6b6b6b] mb-12">
                Access your customized training programs, track your progress, and stay connected with your coach 24/7
              </p>

              <div className="space-y-6">
                {portalFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-3 bg-[#9B7E3A]/10 border border-[#9B7E3A]/30">
                        <Icon className="w-6 h-6 text-[#9B7E3A]" />
                      </div>
                      <div>
                        <h3 className="text-white text-xl mb-2">{feature.title}</h3>
                        <p className="text-[#6b6b6b]">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column for mobile and desktop */}
            <div>
              {/* Header - Only shown on mobile */}
              <div className="lg:hidden mb-12 text-center">
                <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
                  <span className="text-[#9B7E3A] tracking-widest text-sm">CLIENT PORTAL</span>
                </div>
                
                <h1 className="text-4xl text-white mb-6">
                  Your Personal Dashboard
                </h1>
                
                <p className="text-xl text-[#6b6b6b]">
                  Access your customized training programs, track your progress, and stay connected with your coach 24/7
                </p>
              </div>

              {/* Login Form */}
              <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-10">
                <div className="text-center mb-8">
                  <Lock className="w-12 h-12 text-[#9B7E3A] mx-auto mb-4" />
                  <h2 className="text-2xl text-white mb-2">{isSignUp ? "Create Account" : "Member Login"}</h2>
                  <p className="text-[#6b6b6b]">{isSignUp ? "Start your fitness journey today" : "Access your private dashboard"}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {isSignUp && (
                    <div>
                      <label htmlFor="name" className="block text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label htmlFor="phone" className="block text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                        placeholder="(123) 456-7890"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-white mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label htmlFor="package" className="block text-white mb-2">
                        Select Package
                      </label>
                      <select
                        id="package"
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#9B7E3A]/30 text-white focus:outline-none focus:border-[#9B7E3A] transition-colors"
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!isSignUp && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-[#6b6b6b] cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#9B7E3A]" />
                        Remember me
                      </label>
                      <a href="#" className="text-[#9B7E3A] hover:text-[#B8963E] transition-colors" onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPasswordModal(true);
                      }}>
                        Forgot password?
                      </a>
                    </div>
                  )}

                  {/* Error message display for login */}
                  {!isSignUp && loginError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 text-sm text-center">{loginError}</p>
                    </div>
                  )}

                  {/* Error message display for signup */}
                  {isSignUp && signupError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 text-sm text-center">{signupError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300"
                  >
                    {isSignUp ? "Sign Up" : "Access Portal"}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-[#9B7E3A]/20 text-center">
                  <p className="text-[#6b6b6b]">
                    {isSignUp ? "Already a member? " : "Not a member yet? "}{" "}
                    <button 
                      type="button"
                      className="text-[#9B7E3A] hover:text-[#B8963E] transition-colors" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSignUp(!isSignUp);
                        setLoginError(""); // Clear error when switching modes
                        setSignupError(""); // Clear error when switching modes
                      }}
                    >
                      {isSignUp ? "Login" : "Create Account"}
                    </button>
                  </p>
                </div>
              </div>

              {/* Portal Features - Only shown on mobile, below login form */}
              <div className="lg:hidden mt-12 space-y-6">
                {portalFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={`mobile-${index}`} className="flex items-start gap-4">
                      <div className="p-3 bg-[#9B7E3A]/10 border border-[#9B7E3A]/30">
                        <Icon className="w-6 h-6 text-[#9B7E3A]" />
                      </div>
                      <div>
                        <h3 className="text-white text-xl mb-2">{feature.title}</h3>
                        <p className="text-[#6b6b6b]">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeForgotPasswordModal}>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-8 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {!emailSent ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Password Reset</h3>
                  <button className="text-[#9B7E3A] hover:text-white transition-colors" onClick={closeForgotPasswordModal}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center p-6 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg mb-6">
                  <Mail className="w-12 h-12 text-[#9B7E3A]" />
                </div>

                <p className="text-[#9B9B9B] text-center mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label className="block text-[#9B9B9B] text-sm mb-2">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white placeholder-[#9B9B9B] focus:border-[#9B7E3A] focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      autoFocus
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#9B7E3A] text-white text-sm uppercase tracking-wider hover:bg-[#9B7E3A]/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#9B7E3A] uppercase tracking-wider text-sm">Email Sent</h3>
                  <button className="text-[#9B7E3A] hover:text-white transition-colors" onClick={closeForgotPasswordModal}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center p-6 bg-[#1a1a1a] border border-[#9B7E3A] rounded-lg mb-6">
                  <CheckCircle className="w-12 h-12 text-[#9B7E3A]" />
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-white text-center">
                    Password reset email sent!
                  </p>
                  <p className="text-[#9B9B9B] text-center text-sm">
                    We've sent a password reset link to <span className="text-[#9B7E3A]">{resetEmail}</span>
                  </p>
                  <p className="text-[#9B9B9B] text-center text-sm">
                    Check your inbox and click the link to reset your password.
                  </p>
                </div>

                <button
                  onClick={closeForgotPasswordModal}
                  className="w-full px-6 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#9B9B9B] text-sm uppercase tracking-wider hover:text-white hover:border-[#9B7E3A] transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}