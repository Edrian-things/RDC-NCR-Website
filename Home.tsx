// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

const Home: React.FC = () => {
  console.log("API URL:", import.meta.env.VITE_API_URL);
  const [backendMessage, setBackendMessage] = React.useState("Loading...");

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}test/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch(() => setBackendMessage("Failed to connect to backend"));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-blue-900 font-sans relative overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute -top-40   -left-40 w-[32rem] h-[32rem] bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-blob1 z-0"></div>
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-green-200 rounded-full filter blur-3xl opacity-20 animate-blob2 z-0"></div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white overflow-hidden shadow-xl">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg animate-fade-in">
            Welcome To The RDC-NCR Transparency Portal
          </h1>
          <p className="text-xl mb-8 text-blue-100 animate-fade-in2 max-w-2xl mx-auto">
            Empowering citizens through open information, transparency, and
            inclusive Regional Development Council for the National Capital
            Region.
          </p>
          {/* Modern CTA */}
          <Link
            to="/regional-profile"
            className="inline-flex items-center gap-3 bg-white/90 text-blue-800 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-100 hover:text-blue-900 transition-all duration-200 text-lg animate-fade-in3"
            style={{ boxShadow: "0 6px 24px 0 rgba(0,0,0,0.08)" }}
          >
            Learn more about RDC-NCR
            <svg
              className="w-5 h-5 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l-5 5-5-5"
              />
            </svg>
          </Link>
          {/* Scroll Down Indicator */}
          <div className="mt-16 flex flex-col items-center animate-float">
            <span className="text-blue-100 text-sm mb-2">
              Scroll down to explore
            </span>
            <FaChevronDown className="text-blue-100 text-2xl" />
          </div>
        </div>
        {/* Decorative Waves */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 text-blue-50 opacity-80"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,224L60,208C120,192,240,160,360,154.7C480,149,600,171,720,186.7C840,203,960,213,1080,197.3C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </section>

      {/* Info Cards */}
      <section className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-2 text-blue-800">
            What is RDC-NCR?
          </h3>
          <p className="text-gray-700">
            The Regional Development Council is the highest policy-making body
            in the region, guiding growth and progress for all.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-2 text-blue-800">
            Transparency & Accountability
          </h3>
          <p className="text-gray-700">
            We are committed to open governance. Explore our initiatives,
            reports, and updates for a transparent NCR.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold mb-2 text-blue-800">Get Involved</h3>
          <p className="text-gray-700">
            Have questions or suggestions? Reach out to us or participate in our
            programs for a better region.
          </p>
        </div>
      </section>

      {/* News/Announcements */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">
          Latest Announcements
        </h2>
        <ul className="space-y-4">
          <li className="bg-blue-50 rounded-lg p-4 shadow hover:bg-blue-100 transition">
            <strong>RDC-NCR 2025 Planning Conference</strong>{" "}
            <Link to="/documents" className="text-blue-700 underline">
              Read more
            </Link>
          </li>
          {/* Add more news items here */}
        </ul>
      </section>

      <div className="text-center py-8">
        <h2 className="text-xl font-bold mb-2 text-blue-800">
          Frontend → Backend Connection Test
        </h2>
        <p className="text-gray-700">{backendMessage}</p>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">
                NCR Project Transparency Portal
              </h3>
              <p className="text-blue-200">
                Promoting transparency and accountability in government projects
                across the National Capital Region.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-200">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a
                    href="https://mmda.gov.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    MMDA Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/RDCNCR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    RDC-NCR FB Page
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-blue-200">Email: rdc.ncr@mmda.gov.ph</p>
              <p className="text-blue-200">Phone: (02) 1234-5678</p>
            </div>
          </div>
          <div className="mt-8 text-center text-blue-200 text-xs">
            &copy; {new Date().getFullYear()} NCR Project Transparency Portal.
            All rights reserved.
          </div>
        </div>
      </footer>
      {/* Custom Animations */}
      <style>
        {`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(.39,.575,.565,1) both;
        }
        .animate-fade-in2 {
          animation: fadeIn 1.5s cubic-bezier(.39,.575,.565,1) both;
        }
        .animate-fade-in3 {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        .animate-slide-in {
          animation: slideIn 1.2s cubic-bezier(.39,.575,.565,1) both;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-blob1 {
          animation: blob1 12s infinite linear alternate;
        }
        .animate-blob2 {
          animation: blob2 14s infinite linear alternate;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(-40px);}
          100% { opacity: 1; transform: translateX(0);}
        }
        @keyframes float {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-16px);}
        }
        @keyframes blob1 {
          0% { transform: scale(1) translateY(0) translateX(0);}
          100% { transform: scale(1.15) translateY(30px) translateX(40px);}
        }
        @keyframes blob2 {
          0% { transform: scale(1) translateY(0) translateX(0);}
          100% { transform: scale(1.1) translateY(-20px) translateX(-30px);}
        }
        `}
      </style>
    </div>
  );
};

export default Home;
