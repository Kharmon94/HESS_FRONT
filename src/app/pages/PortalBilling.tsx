import { Link } from "react-router";
import { Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function PortalBilling() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10">
          <Link
            to="/portal/dashboard"
            className="text-sm uppercase tracking-wider text-[#9B7E3A] hover:text-white transition-colors"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-6 text-4xl md:text-5xl text-white mb-2 flex items-center gap-3">
            <CreditCard className="h-10 w-10 text-[#9B7E3A] shrink-0" aria-hidden />
            Billing
          </h1>
          <p className="text-[#6b6b6b]">Manage payment methods and invoices.</p>
        </div>

        <div className="border border-[#9B7E3A]/20 bg-[#2a2a2a] p-8 md:p-12 text-center mb-12">
          <p className="text-2xl text-white font-light mb-2">Coming soon</p>
          <p className="text-[#9B9B9B] text-sm max-w-md mx-auto leading-relaxed">
            Online billing and payment updates will be available here. For billing questions, reach out using the contact
            information below.
          </p>
        </div>

        <div className="border border-[#3a3a3a] bg-[#2a2a2a] p-8">
          <h2 className="text-[#9B7E3A] uppercase tracking-wider text-sm mb-6">Contact</h2>
          <ul className="space-y-4 text-[#6b6b6b]">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#9B7E3A] shrink-0 mt-0.5" aria-hidden />
              <a href="mailto:HessGamesLLC@Gmail.com" className="text-white hover:text-[#9B7E3A] transition-colors">
                HessGamesLLC@Gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#9B7E3A] shrink-0 mt-0.5" aria-hidden />
              <a href="tel:+13039099788" className="text-white hover:text-[#9B7E3A] transition-colors">
                (303) 909-9788
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-[#9B7E3A] shrink-0 mt-0.5" aria-hidden />
              <span>8755 E Orchard Rd Ste 605, Greenwood Village, CO 80111</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
