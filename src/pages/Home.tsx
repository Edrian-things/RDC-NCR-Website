// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsData, type Project } from "../services/projectsData";

type ProjectStatus = Project["status"];

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [lguFilter, setLguFilter] = useState<Project["lgu"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const filteredProjects = projects.filter((project) => {
    const statusMatch = filter === "all" || project.status === filter;
    const lguMatch = lguFilter === "all" || project.lgu === lguFilter;
    const searchMatch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && lguMatch && searchMatch;
  });

  const uniqueLGUs = Array.from(new Set(projects.map((p) => p.lgu)));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-blue-900 font-sans relative overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-blob1 z-0"></div>
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-green-200 rounded-full filter blur-3xl opacity-20 animate-blob2 z-0"></div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white overflow-hidden shadow-xl">
        <div className="relative container mx-auto px-4 py-16 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 animate-fade-in">
              <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg tracking-tight animate-slide-in">
                National Capital Region Project Transparency Portal
              </h2>
              <p className="text-xl mb-6 text-blue-100 animate-fade-in2">
                Tracking government projects across all NCR LGUs for
                accountability and transparency
              </p>
              <div className="flex gap-4">
                <Link
                  to="/projects"
                  className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-100 hover:scale-105 hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
                >
                  <span className="relative z-10">View Projects</span>
                  <span className="absolute left-0 top-0 w-0 h-full bg-blue-200 opacity-30 group-hover:w-full transition-all duration-300 rounded-lg"></span>
                </Link>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-white hover:text-blue-800 hover:scale-105 hover:shadow-xl transition-all duration-200 group relative overflow-hidden">
                  <span className="relative z-10">Download Reports</span>
                  <span className="absolute left-0 top-0 w-0 h-full bg-blue-100 opacity-20 group-hover:w-full transition-all duration-300 rounded-lg"></span>
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-end">
              <div className="relative h-64 w-full max-w-xl bg-white bg-opacity-10 rounded-lg p-4 overflow-hidden shadow-lg flex items-center justify-center">
                {/* Leave this area blank for client image */}
                {/* Example placeholder: */}
                {/* <img src="/client-image.png" alt="Client" className="h-48 object-contain" /> */}
              </div>
            </div>
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

      {/* Filters */}
      <main className="flex-grow container mx-auto px-4 py-8 z-10">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 transition"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="proposed">Proposed</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by LGU
              </label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-600 transition"
                value={lguFilter}
                onChange={(e) => setLguFilter(e.target.value as any)}
              >
                <option value="all">All LGUs</option>
                {uniqueLGUs.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Projects
              </label>
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-t-4 border-blue-100 hover:border-blue-600 animate-fade-in3"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-blue-900 group-hover:text-green-700 transition-colors duration-200 drop-shadow">
                    {p.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium shadow transition-all duration-200
                      ${
                        p.status === "ongoing"
                          ? "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200"
                          : p.status === "completed"
                          ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                          : "bg-blue-100 text-blue-800 group-hover:bg-blue-200"
                      }`}
                  >
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <span className="mr-4">LGU: {p.lgu}</span>
                  <span>Budget: ₱{p.budget.toLocaleString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{p.description}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Start: {p.startDate}</span>
                  {p.endDate && <span>End: {p.endDate}</span>}
                  {p.completion != null && (
                    <span>
                      Progress:{" "}
                      <span className="font-bold text-blue-800">
                        {p.completion}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <Link
                  to={`/projects/${p.id}`}
                  className="text-blue-700 font-medium hover:text-green-700 transition-colors duration-200 flex items-center gap-1 group"
                >
                  View Details & Documents
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <div className="flex items-center gap-2">
                  {p.status === "completed" && (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                  {p.status === "ongoing" && (
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 animate-fade-in2">
            <p className="text-gray-500">No projects match your filters.</p>
          </div>
        )}
      </main>

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
                  <Link
                    to="/projects"
                    className="hover:text-white transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/EmployesPortal"
                    className="hover:text-white transition-colors"
                  >
                    Employees Portal
                  </Link>
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
