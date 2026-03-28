import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import hessEliteLogo from "figma:asset/011d0f406da2b3a0da52e3f965ca543ab2f6d899.png";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-[#9B7E3A]/20 bg-[#1a1a1a00]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <button
              className="text-[#9B7E3A]"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="hidden md:inline text-base tracking-wide text-[#9B7E3A] uppercase">
              Start your transformation
            </span>
          </div>
          
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={hessEliteLogo} alt="Hess Elite Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {isOpen && (
          <div className="pb-6 space-y-4">
            <Link
              to="/"
              className="block text-white hover:text-[#9B7E3A] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-white hover:text-[#9B7E3A] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/portal"
              className="block px-6 py-2.5 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 text-center"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}