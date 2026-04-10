import { Mail, Phone, MapPin, Instagram, Facebook, X } from "lucide-react";
import footerLogo from "figma:asset/28506267c3262cff0dce64723e2cb1baca8b936e.png";

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#9B7E3A]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src={footerLogo} alt="Hess Elite" className="h-16 w-auto" />
            </div>
            <p className="text-[#6b6b6b] leading-relaxed">
              Transform your potential with elite training and personalized wellness programs.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-[#6b6b6b]">
                <Mail className="w-5 h-5 text-[#9B7E3A]" />
                HessGamesLLC@Gmail.com
              </li>
              <li className="flex items-center gap-3 text-[#6b6b6b]">
                <Phone className="w-5 h-5 text-[#9B7E3A]" />
                (303)909-9788
              </li>
              <li className="flex items-center gap-3 text-[#6b6b6b]">
                <MapPin className="w-6 h-6 text-[#9B7E3A]" />
                8755 E Orchard Rd Ste 605, Greenwood Village, CO 80111
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/steve13hess/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-[#9B7E3A]/30 hover:bg-[#9B7E3A]/10 hover:border-[#9B7E3A] transition-all duration-300"
              >
                <Instagram className="w-5 h-5 text-[#9B7E3A]" />
              </a>
              <a
                href="https://www.facebook.com/steve.hess.14473"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-[#9B7E3A]/30 hover:bg-[#9B7E3A]/10 hover:border-[#9B7E3A] transition-all duration-300"
              >
                <Facebook className="w-5 h-5 text-[#9B7E3A]" />
              </a>
              <a
                href="https://x.com/SteveHess1"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-[#9B7E3A]/30 hover:bg-[#9B7E3A]/10 hover:border-[#9B7E3A] transition-all duration-300"
              >
                <X className="w-5 h-5 text-[#9B7E3A]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#9B7E3A]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6b6b6b] text-sm">
            © 2026 Elite. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-[#6b6b6b] hover:text-[#9B7E3A] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#6b6b6b] hover:text-[#9B7E3A] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-[#6b6b6b] hover:text-[#9B7E3A] transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}