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
} from "react-icons/fa";

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
  const [lguFilter, setLguFilter] = useState<Project["lgu"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "all">(
    "all"
  );
  const [agencyFilter, setAgencyFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => setProjects(projectsData), []);

  const lguOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.lgu))),
    [projects]
  );
  const agencyOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.agency || "Other"))),
    [projects]
  );

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const a = lguFilter === "all" || p.lgu === lguFilter;
        const b = statusFilter === "all" || p.status === statusFilter;
        const c =
          agencyFilter === "all" || (p.agency || "Other") === agencyFilter;
        const s =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        return a && b && c && s;
      }),
    [projects, lguFilter, statusFilter, agencyFilter, search]
  );

  const totals = useMemo(() => {
    const totalProjects = filtered.length;
    const totalBudget = filtered.reduce((s, p) => s + (p.budget || 0), 0);
    const byStatus = filtered.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    return { totalProjects, totalBudget, byStatus };
  }, [filtered]);

  const statusPie = useMemo(
    () =>
      Object.keys(totals.byStatus).map((k) => ({
        name: k,
        value: totals.byStatus[k],
      })),
    [totals]
  );
  const agencyBar = useMemo(() => {
    const m = filtered.reduce<Record<string, number>>((acc, p) => {
      const a = p.agency || "Other";
      acc[a] = (acc[a] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(m)
      .map((k) => ({ agency: k, value: m[k] }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);
  const lguBar = useMemo(() => {
    const m = filtered.reduce<Record<string, number>>((acc, p) => {
      acc[p.lgu] = (acc[p.lgu] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(m)
      .map((k) => ({ lgu: k, value: m[k] }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-0">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight animate-fade-in">
              Projects Dashboard
            </h1>
            <p className="text-blue-700 mt-1 animate-fade-in2">
              Explore, filter, and visualize NCR projects.
            </p>
          </div>
          <div className="flex gap-3 items-center animate-slide-in">
            <div className="relative">
              <input
                placeholder="Search projects..."
                className="border-2 border-blue-200 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 rounded-xl p-6 mb-10 shadow-lg backdrop-blur animate-fade-in2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-1">
                Filter by LGU
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition"
                value={lguFilter}
                onChange={(e) => setLguFilter(e.target.value as any)}
              >
                <option value="all">All LGUs</option>
                {lguOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-1">
                Filter by Status
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="proposed">Proposed</option>
                <option value="planning">Planning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-1">
                Filter by Agency
              </label>
              <select
                className="w-full border-2 border-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 transition"
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
            <div className="flex items-end">
              <div>
                <div className="text-xs text-blue-500 font-semibold">
                  Summary
                </div>
                <div className="mt-1 text-2xl font-extrabold text-blue-900 animate-count">
                  {totals.totalProjects}{" "}
                  <span className="text-base font-medium text-blue-700">
                    projects
                  </span>
                </div>
                <div className="mt-1 text-sm text-blue-700">
                  {money(totals.totalBudget)}{" "}
                  <span className="text-xs">total budget</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 animate-fade-in3">
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <h3 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Projects by Status
            </h3>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    labelLine={false}
                    label={({
                      name,
                      percent,
                    }: {
                      name?: string;
                      percent?: number;
                    }) =>
                      name
                        ? `${
                            name.charAt(0).toUpperCase() + name.slice(1)
                          } (${Math.round((percent ?? 0) * 100)}%)`
                        : ""
                    }
                    isAnimationActive
                  >
                    {statusPie.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[entry.name] || "#ccc"}
                        className="cursor-pointer"
                      />
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

          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group col-span-2">
            <h3 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <FaBuilding className="text-blue-400" /> Projects by Agency
            </h3>
            <div className="h-60 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agencyBar}
                  layout="vertical"
                  barCategoryGap="20%"
                >
                  <XAxis type="number" hide />
                  <YAxis dataKey="agency" type="category" width={150} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[8, 8, 8, 8]}
                    isAnimationActive
                  >
                    {agencyBar.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(${200 + idx * 20}, 80%, 60%)`}
                        className="group-hover:opacity-80 transition"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group lg:col-span-2">
            <h3 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <FaBuilding className="text-green-400" /> Projects by LGU
            </h3>
            <div className="h-56 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lguBar} barCategoryGap="20%">
                  <XAxis dataKey="lgu" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#10B981"
                    radius={[8, 8, 8, 8]}
                    isAnimationActive
                  >
                    {lguBar.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(${140 + idx * 15}, 60%, 55%)`}
                        className="group-hover:opacity-80 transition"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white/90 rounded-2xl p-6 shadow-xl animate-fade-in4">
          <h3 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
            <FaBuilding className="text-blue-400" /> Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="border border-blue-100 rounded-2xl p-5 bg-white shadow hover:shadow-2xl transition-all duration-300 group relative overflow-hidden hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 mb-2">
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
                <h4 className="text-lg font-bold text-blue-900 mb-1 group-hover:text-blue-700 transition">
                  {p.title}
                </h4>
                <div className="text-sm text-blue-700 my-1 flex items-center gap-2">
                  <FaBuilding className="text-blue-300" /> {p.agency} • {p.lgu}
                </div>
                <p className="text-gray-700 mb-3 line-clamp-3">
                  {p.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-blue-800 font-semibold bg-blue-50 px-2 py-1 rounded">
                    {money(p.budget)}
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition"
                  >
                    View Details
                  </Link>
                </div>
                {/* Animated background blob */}
                <span className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 opacity-0 group-hover:opacity-60 rounded-full blur-2xl transition-all duration-500 z-0"></span>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-blue-400 text-lg animate-fade-in">
              No projects found.
            </div>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
        .animate-fade-in { animation: fadeIn 0.7s both; }
        .animate-fade-in2 { animation: fadeIn 1.1s both; }
        .animate-fade-in3 { animation: fadeIn 1.5s both; }
        .animate-fade-in4 { animation: fadeIn 2s both; }
        .animate-slide-in { animation: slideIn 0.7s both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: none;}
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px);}
          to { opacity: 1; transform: none;}
        }
        `}
      </style>
    </div>
  );
};

export default Projects;
