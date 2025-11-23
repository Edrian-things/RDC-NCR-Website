import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Dashboard" },
  { to: "/regional-profile", label: "RegionProfile" },
  { to: "/documents", label: "Publications" },
  { to: "/about", label: "Contact Us" },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 transition-shadow duration-300">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row: Logo, Title, and Buttons */}
        <div className="flex justify-between items-center">
          {/* Left: GOVPH Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <a
              href="https://www.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-800 text-white font-extrabold text-sm sm:text-xl px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
              tabIndex={0}
            >
              GOVPH
            </a>
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-800 via-green-700 to-blue-400 bg-clip-text text-transparent drop-shadow truncate">
              NCR Project Transparency Portal
            </h1>
          </div>

          {/* Right: Login Button and Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Login Button - Hidden on smallest screens, shown on sm+ */}
            <Link
              to="/login"
              className="hidden sm:flex relative bg-green-600 hover:bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg font-bold shadow-lg transition-all duration-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Login</span>
              </span>
              <span className="absolute left-0 top-0 w-0 h-full bg-green-800 opacity-20 group-hover:w-full transition-all duration-300 rounded-lg"></span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-blue-900 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition p-1"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile/tablet */}
        <nav className="hidden lg:flex gap-2 font-semibold mt-4 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 rounded-md transition-all duration-200 group ${
                location.pathname === link.to
                  ? "text-blue-700 font-bold"
                  : "text-blue-900"
              } hover:text-green-700 focus:text-green-700`}
            >
              <span className="relative z-10">{link.label}</span>
              <span
                className={`absolute left-2 right-2 -bottom-1 h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 opacity-0 group-hover:opacity-80 group-hover:h-2 group-hover:scale-x-105 transition-all duration-300 ${
                  location.pathname === link.to ? "opacity-100 h-2" : ""
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 mt-4" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-2 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-md transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-blue-100 text-blue-700 font-bold border-l-4 border-blue-700"
                    : "text-blue-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Login Button */}
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-bold shadow-lg transition-all duration-200 text-center"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
        .group:hover .group-hover\\:animate-bounce {
          animation: bounce 0.5s;
        }
        @keyframes bounce {
          0% { transform: translateY(0);}
          30% { transform: translateY(-7px);}
          60% { transform: translateY(2px);}
          100% { transform: translateY(0);}
        }
        `}
      </style>
    </header>
  );
};

export default Navbar;
