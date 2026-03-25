import { Lock, Calendar, BarChart3, MessageSquare } from "lucide-react";
import { useState } from "react";

export function ClientPortal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("elite-evaluation");

  const packages = [
    { id: "elite-evaluation", name: "Elite Evaluation", price: "$350 one-time" },
    { id: "elite", name: "Elite", price: "$2,500 for 10-pack" },
    { id: "vip", name: "VIP", price: "Custom pricing - Call for details" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Mock registration
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      const packageName = packages.find(p => p.id === selectedPackage)?.name;
      alert(`Account created successfully with ${packageName} package! In production, this would create your account and send a verification email.`);
    } else {
      // Mock login
      alert("This is a demo portal. In production, this would authenticate with your backend.");
    }
  };

  const features = [
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

  return (
    <section id="portal" className="py-32 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Portal Features */}
          <div>
            <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
              <span className="text-[#9B7E3A] tracking-widest text-sm">CLIENT PORTAL</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl text-white mb-6">
              Your Personal Dashboard
            </h2>
            
            <p className="text-xl text-[#6b6b6b] mb-12">
              Access your customized training programs, track your progress, and stay connected with your coach 24/7
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-[#9B7E3A]/10 border border-[#9B7E3A]/30">
                    <feature.icon className="w-6 h-6 text-[#9B7E3A]" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl mb-2">{feature.title}</h3>
                    <p className="text-[#6b6b6b]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-10">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-[#9B7E3A] mx-auto mb-4" />
              <h3 className="text-2xl text-white mb-2">{isSignUp ? "Create Account" : "Member Login"}</h3>
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
                  <a href="#" className="text-[#9B7E3A] hover:text-[#B8963E] transition-colors">
                    Forgot password?
                  </a>
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
                {isSignUp ? "Already a member?" : "Not a member yet?"}{" "}
                <button 
                  type="button"
                  className="text-[#9B7E3A] hover:text-[#B8963E] transition-colors" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignUp(!isSignUp);
                  }}
                >
                  {isSignUp ? "Login" : "Create Account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}