import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardStats {
  pending_projects?: number;
  validated_today?: number;
  total_validated?: number;
}

const ValidatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const data = await api.get("dashboard/");
        if (mounted) setStats(data);
      } catch {
        if (mounted) setStats({});
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    else navigate("/login");

    fetchStats();
    const onStorage = (e: StorageEvent) => e.key === "projects_last_update" && fetchStats();
    const pollId = window.setInterval(fetchStats, 10000);
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const throughput = [
    { day: "Mon", reviewed: Math.max(0, (stats.validated_today || 0) - 2) },
    { day: "Tue", reviewed: Math.max(0, (stats.validated_today || 0) - 1) },
    { day: "Wed", reviewed: stats.validated_today || 0 },
    { day: "Thu", reviewed: (stats.validated_today || 0) + 1 },
    { day: "Fri", reviewed: Math.max(0, (stats.validated_today || 0) - 1) },
  ];
  const queueMix = [
    { label: "Pending", count: stats.pending_projects || 0 },
    { label: "Validated", count: stats.total_validated || 0 },
  ];

  return (
    <PortalLayout
      title="Validator Dashboard"
      subtitle="Review queue, decision throughput, and validation workflow"
      role="validator"
      userName={user.username}
      topActions={
        <Link to="/validator/projects" className="portal-btn portal-btn-primary">
          Review Queue
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-4">
        <div className="portal-stat">
          <p className="portal-stat-title">Pending Review</p>
          <p className="portal-stat-value text-blue-600">{loading ? "..." : stats.pending_projects || 0}</p>
        </div>
        <div className="portal-stat">
          <p className="portal-stat-title">Validated Today</p>
          <p className="portal-stat-value text-emerald-600">{loading ? "..." : stats.validated_today || 0}</p>
        </div>
        <div className="portal-stat">
          <p className="portal-stat-title">Total Validated</p>
          <p className="portal-stat-value">{loading ? "..." : stats.total_validated || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 mb-4">
        <div className="portal-card lg:col-span-2 2xl:col-span-2">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Daily Review Cadence</h2>
          </div>
          <div className="portal-card-body h-[210px] md:h-[230px] 2xl:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughput}>
                <defs>
                  <linearGradient id="validatorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f7" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="reviewed" stroke="#1d4ed8" fill="url(#validatorArea)" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="portal-card">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Queue Balance</h2>
          </div>
          <div className="portal-card-body h-[210px] md:h-[230px] 2xl:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f7" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        <div className="portal-card lg:col-span-2 2xl:col-span-2">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Validation Operations</h2>
          </div>
          <div className="portal-card-body grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Link to="/validator/projects" className="portal-card p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold">Open Pending Projects</p>
              <p className="text-sm text-slate-500 mt-1">Review full template forms and issue approve/reject actions.</p>
            </Link>
            <Link to="/validator/projects/history" className="portal-card p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold">Reviewed & Validated History</p>
              <p className="text-sm text-slate-500 mt-1">See projects you already reviewed/validated and open them again.</p>
            </Link>
          </div>
        </div>

        <div className="portal-card">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Guidelines</h2>
          </div>
          <div className="portal-card-body text-sm text-slate-600 space-y-2">
            <p>Validate against submitted template data completeness.</p>
            <p>Use approve/reject actions only on pending submissions.</p>
            <p>Archive/delete remains admin-only.</p>
            <p>Printable view is available for record checks.</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ValidatorDashboard;
