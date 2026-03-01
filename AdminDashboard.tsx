import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardStats {
  total_projects?: number;
  draft_projects?: number;
  pending_projects?: number;
  approved_projects?: number;
  archived_projects?: number;
  reviewed_projects?: number;
  validator_edited_projects?: number;
  users?: number;
}

interface ActivityItem {
  id: number;
  username: string;
  role: string;
  event: string;
  project_title?: string;
  ip_address?: string;
  location_hint?: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const data = await api.get("dashboard/");
        if (mounted) setStats(data);
        const feed = await api.get("admin/activity/?limit=10");
        if (mounted) setActivity(Array.isArray(feed) ? feed : []);
      } catch {
        if (mounted) {
          setStats({});
          setActivity([]);
        }
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

  const portfolioData = [
    { name: "Draft", value: stats.draft_projects || 0, color: "#f59e0b" },
    { name: "Pending", value: stats.pending_projects || 0, color: "#2563eb" },
    { name: "Approved", value: stats.approved_projects || 0, color: "#10b981" },
    { name: "Archived", value: stats.archived_projects || 0, color: "#64748b" },
  ];

  const opsData = [
    { label: "Projects", count: stats.total_projects || 0 },
    { label: "Users", count: stats.users || 0 },
    { label: "Pending", count: stats.pending_projects || 0 },
  ];

  return (
    <PortalLayout
      title="Admin Command Center"
      subtitle="Control access, deadlines, and full portal governance"
      role="admin"
      userName={user.username}
      topActions={
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const data = await api.get("dashboard/");
              setStats(data);
              const feed = await api.get("admin/activity/?limit=10");
              setActivity(Array.isArray(feed) ? feed : []);
            } finally {
              setLoading(false);
            }
          }}
          className="portal-btn portal-btn-ghost"
        >
          Refresh
        </button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-3 md:gap-4 mb-4">
        <div className="portal-stat"><p className="portal-stat-title">Total</p><p className="portal-stat-value">{loading ? "..." : stats.total_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Drafts</p><p className="portal-stat-value text-amber-600">{loading ? "..." : stats.draft_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Pending</p><p className="portal-stat-value text-blue-600">{loading ? "..." : stats.pending_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Approved</p><p className="portal-stat-value text-emerald-600">{loading ? "..." : stats.approved_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Archived</p><p className="portal-stat-value text-slate-600">{loading ? "..." : stats.archived_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Reviewed</p><p className="portal-stat-value text-violet-600">{loading ? "..." : stats.reviewed_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Validator Edited</p><p className="portal-stat-value text-indigo-600">{loading ? "..." : stats.validator_edited_projects || 0}</p></div>
        <div className="portal-stat"><p className="portal-stat-title">Users</p><p className="portal-stat-value">{loading ? "..." : stats.users || 0}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 mb-4">
        <div className="portal-card lg:col-span-2 2xl:col-span-2">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Operations Snapshot</h2>
          </div>
          <div className="portal-card-body h-[210px] md:h-[230px] 2xl:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f7" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="portal-card">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Portfolio Mix</h2>
          </div>
          <div className="portal-card-body h-[210px] md:h-[230px] 2xl:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={42}>
                  {portfolioData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        <div className="portal-card lg:col-span-2 2xl:col-span-2">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Administration Workflows</h2>
          </div>
          <div className="portal-card-body grid grid-cols-1 xl:grid-cols-3 gap-3">
            <Link to="/admin/users" className="portal-card p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold">User & Access Control</p>
              <p className="text-sm text-slate-500 mt-1">Approve requests, create users, set roles, manage deadlines.</p>
            </Link>
            <Link to="/admin/projects" className="portal-card p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold">Project Governance</p>
              <p className="text-sm text-slate-500 mt-1">View all projects, archive or delete with admin-only authority.</p>
            </Link>
            <Link to="/admin/validator-diffs" className="portal-card p-4 hover:shadow-md transition-shadow">
              <p className="font-semibold">Validator Diffs</p>
              <p className="text-sm text-slate-500 mt-1">Review edited fields, reviewed copies, and validator decisions.</p>
            </Link>
          </div>
        </div>

        <div className="portal-card">
          <div className="portal-card-header">
            <h2 className="text-lg font-semibold">Governance Notes</h2>
          </div>
          <div className="portal-card-body text-sm text-slate-600 space-y-2">
            <p>Only admin can archive/delete projects.</p>
            <p>Encoding schedule controls contributor edit/submit access.</p>
            <p>Submitted projects are contributor view-only.</p>
            <p>Use User & Access for activation and password reset.</p>
          </div>
        </div>
      </div>

      <div className="portal-card mt-4 portal-table-wrap">
        <div className="portal-card-header">
          <h2 className="text-lg font-semibold">User Activity Feed</h2>
        </div>
        <div className="portal-card-body p-0">
          {activity.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No recent user activity.</div>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th className="hidden md:table-cell">Role</th>
                  <th>Event</th>
                  <th className="hidden lg:table-cell">Project</th>
                  <th className="hidden xl:table-cell">IP / Location</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={item.id}>
                    <td>{item.username}</td>
                    <td className="hidden md:table-cell">{item.role === "staff" ? "contributor" : item.role}</td>
                    <td>{item.event.replaceAll("_", " ")}</td>
                    <td className="hidden lg:table-cell">{item.project_title || "-"}</td>
                    <td className="hidden xl:table-cell">
                      {[item.ip_address, item.location_hint].filter(Boolean).join(" | ") || "-"}
                    </td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;
