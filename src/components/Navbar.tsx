import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/lgus", label: "LGUs" },
  { to: "/documents", label: "Documents" },
  { to: "/about", label: "About" },
];

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 transition-shadow duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
        {/* GOVPH Logo */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-800 text-white font-extrabold text-xl px-3 py-2 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
          >
            GOVPH
          </a>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-800 via-green-700 to-blue-400 bg-clip-text text-transparent drop-shadow">
            NCR Project Transparency Portal
          </h1>
        </div>
        {/* Navigation Links */}
        <nav className="hidden md:flex gap-2 font-semibold ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 rounded-md transition-all duration-200
                group
                ${
                  location.pathname === link.to
                    ? "text-blue-700 font-bold"
                    : "text-blue-900"
                }
                hover:text-green-700 focus:text-green-700
              `}
            >
              <span className="relative z-10">{link.label}</span>
              {/* Animated underline */}
              <span
                className={`absolute left-2 right-2 -bottom-1 h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 opacity-0 group-hover:opacity-80 group-hover:h-2 group-hover:scale-x-105 transition-all duration-300
                  ${location.pathname === link.to ? "opacity-100 h-2" : ""}
                `}
              ></span>
            </Link>
          ))}
        </nav>
        {/* Employee Login Button */}
        <Link
          to="/login"
          className="relative bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all duration-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white group-hover:animate-bounce"
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
            Employee Login
          </span>
          {/* Animated background */}
          <span className="absolute left-0 top-0 w-0 h-full bg-green-800 opacity-20 group-hover:w-full transition-all duration-300 rounded-lg"></span>
        </Link>
        {/* Mobile menu icon */}
        <button
          className="md:hidden ml-4 text-blue-900 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
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
        </button>
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
