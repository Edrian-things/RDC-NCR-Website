// src/pages/Projects.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { projectsData, type Project } from "../services/projectsData";
import {
  FaSearch,
  FaBuilding,
  FaCheckCircle,
  FaHourglassHalf,
  FaLightbulb,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import NCRMap from "../components/NCRMap";
import { ncrCityCenters } from "../services/ncrCityCenters";

const COLORS: Record<string, string> = {
  ongoing: "#F59E0B",
  completed: "#10B981",
  proposed: "#3B82F6",
  planning: "#94A3B8",
};

const money = (n: number) => `₱ ${n.toLocaleString()}`;

const STATUS_ICONS: Record<string, JSX.Element> = {
  ongoing: <FaHourglassHalf className="text-yellow-500" />,
  completed: <FaCheckCircle className="text-green-500" />,
  proposed: <FaLightbulb className="text-blue-500" />,
  planning: <FaRegCalendarAlt className="text-slate-400" />,
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "all">(
    "all"
  );
  const [agencyFilter, setAgencyFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    undefined
  );
  const [municipalityFilter, setMunicipalityFilter] = useState<string>("all");

  useEffect(() => setProjects(projectsData), []);

  const yearOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.year))).sort(),
    [projects]
  );

  const agencyOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.agency || "Other"))),
    [projects]
  );

  const municipalityOptions = Object.keys(ncrCityCenters).sort();

  useEffect(() => {
    if (municipalityFilter === "all") {
      setSelectedCity(undefined);
    } else {
      setSelectedCity(municipalityFilter);
    }
  }, [municipalityFilter]);

  useEffect(() => {
    if (!selectedCity) {
      setMunicipalityFilter("all");
    } else {
      setMunicipalityFilter(selectedCity);
    }
  }, [selectedCity]);

  // Filter projects by year, status, agency, and search (NOT by municipality yet)
  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchYear = yearFilter === "all" || p.year === yearFilter;
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        const matchAgency =
          agencyFilter === "all" || (p.agency || "Other") === agencyFilter;
        const matchSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        return matchYear && matchStatus && matchAgency && matchSearch;
      }),
    [projects, yearFilter, statusFilter, agencyFilter, search]
  );

  // For displaying in the project list - apply city filter
  const displayProjects = useMemo(() => {
    if (selectedCity) {
      return filtered.filter((p) => p.lgu === selectedCity);
    } else if (municipalityFilter !== "all") {
      return filtered.filter((p) => p.lgu === municipalityFilter);
    }
    return filtered;
  }, [filtered, selectedCity, municipalityFilter]);

  const totals = useMemo(() => {
    const totalProjects = displayProjects.length;
    const totalBudget = displayProjects.reduce(
      (s, p) => s + (p.budget || 0),
      0
    );
    const byStatus = displayProjects.reduce<Record<string, number>>(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {}
    );
    return { totalProjects, totalBudget, byStatus };
  }, [displayProjects]);

  // --- ADDED: projects to send to the map
  // If a municipality is selected (via select or by clicking a marker),
  // only show projects for that municipality on the map.
  const mapProjects = useMemo(() => {
    if (selectedCity) {
      return filtered.filter((p) => p.lgu === selectedCity);
    }
    if (municipalityFilter !== "all") {
      return filtered.filter((p) => p.lgu === municipalityFilter);
    }
    return filtered;
  }, [filtered, selectedCity, municipalityFilter]);

  const statusPie = useMemo(
    () =>
      Object.keys(totals.byStatus).map((k) => ({
        name: k,
        value: totals.byStatus[k],
      })),
    [totals]
  );

  const agencyBar = useMemo(() => {
    const m = displayProjects.reduce<Record<string, number>>((acc, p) => {
      const a = p.agency || "Other";
      acc[a] = (acc[a] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(m)
      .map((k) => ({ agency: k, value: m[k] }))
      .sort((a, b) => b.value - a.value);
  }, [displayProjects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight animate-fade-in">
              Projects Dashboard
            </h1>
            <p className="text-blue-700 mt-1 text-sm md:text-base animate-fade-in2">
              Explore, filter, and visualize NCR projects
            </p>
          </div>
          <div className="flex gap-3 items-center animate-slide-in">
            <div className="relative w-full lg:w-auto">
              <input
                placeholder="Search projects..."
                className="w-full lg:w-64 border-2 border-blue-200 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 mb-8 shadow-lg animate-fade-in2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                Filter by Year
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={yearFilter}
                onChange={(e) =>
                  setYearFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <option value="all">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                Filter by Status
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="proposed">Proposed</option>
                <option value="planning">Planning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                Filter by Agency
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value as any)}
              >
                <option value="all">All Agencies</option>
                {agencyOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                Filter by Municipality
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition text-sm"
                value={municipalityFilter}
                onChange={(e) => setMunicipalityFilter(e.target.value)}
              >
                <option value="all">All Municipalities</option>
                {municipalityOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-blue-700 mb-1">
                Total Projects
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {totals.totalProjects}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-700 mb-1">
                Total Budget
              </div>
              <div className="text-lg md:text-xl font-bold text-green-900">
                {money(totals.totalBudget)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-yellow-700 mb-1">
                Ongoing
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {totals.byStatus.ongoing || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-purple-700 mb-1">
                Completed
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {totals.byStatus.completed || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in3">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="font-semibold mb-4 text-blue-800 flex items-center gap-2 text-base md:text-lg">
              <FaCheckCircle className="text-green-400" /> Projects by Status
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    innerRadius="40%"
                    labelLine={false}
                    label={(props: { name?: string; percent?: number }) =>
                      props.name
                        ? `${
                            props.name.charAt(0).toUpperCase() +
                            props.name.slice(1)
                          } ${Math.round((props.percent ?? 0) * 100)}%`
                        : ""
                    }
                    isAnimationActive
                  >
                    {statusPie.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} projects`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="font-semibold mb-4 text-blue-800 flex items-center gap-2 text-base md:text-lg">
              <FaBuilding className="text-blue-400" /> Projects by Agency
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agencyBar}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="agency"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[0, 8, 8, 0]}
                    isAnimationActive
                  >
                    {agencyBar.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(${200 + idx * 20}, 80%, 60%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* NCR Map - Shows all filtered markers */}
        <div className="mb-8 animate-fade-in3">
          <NCRMap
            projects={mapProjects}
            selectedCity={selectedCity}
            selectedStatus={statusFilter === "all" ? "all" : statusFilter}
            onCitySelect={(city) => setSelectedCity(city)}
            showCityMarker={true}
          />
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg animate-fade-in4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2">
              <FaBuilding className="text-blue-400" /> Projects
            </h3>
            {selectedCity && (
              <button
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-sm font-medium flex items-center gap-2"
                onClick={() => setSelectedCity(undefined)}
              >
                <FaMapMarkerAlt />
                Show All Cities
              </button>
            )}
          </div>

          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayProjects.map((p) => (
                <div
                  key={p.id}
                  className="border-2 border-blue-100 rounded-xl p-4 md:p-5 bg-white hover:shadow-xl transition-all duration-300 group relative overflow-hidden hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {STATUS_ICONS[p.status]}
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${
                        p.status === "completed"
                          ? "text-green-600"
                          : p.status === "ongoing"
                          ? "text-yellow-600"
                          : p.status === "proposed"
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h4 className="text-base md:text-lg font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition line-clamp-2">
                    {p.title}
                  </h4>

                  <div className="text-xs md:text-sm text-blue-700 mb-2 flex items-center gap-2">
                    <FaBuilding className="text-blue-300 flex-shrink-0" />
                    <span className="truncate">{p.agency}</span>
                  </div>

                  {p.lgu && (
                    <div className="text-xs text-gray-600 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                      <span>{p.lgu}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {p.description}
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg">
                      {money(p.budget)}
                    </div>
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                      View Details →
                    </Link>
                  </div>

                  <span className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 opacity-0 group-hover:opacity-60 rounded-full blur-2xl transition-all duration-500 -z-10"></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="text-gray-400 mb-4">
                <FaSearch className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl text-gray-500">No projects found</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
        .animate-fade-in { 
          animation: fadeIn 0.6s ease-out both; 
        }
        .animate-fade-in2 { 
          animation: fadeIn 0.8s ease-out both; 
        }
        .animate-fade-in3 { 
          animation: fadeIn 1s ease-out both; 
        }
        .animate-fade-in4 { 
          animation: fadeIn 1.2s ease-out both; 
        }
        .animate-slide-in { 
          animation: slideIn 0.7s ease-out both; 
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(40px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        `}
      </style>
    </div>
  );
};

export default Projects;
