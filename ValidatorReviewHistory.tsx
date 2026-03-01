import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";

type ApiProject = {
  id: number;
  title?: string;
  name?: string;
  agency?: string;
  budget?: number;
  status?: string;
  updated_at?: string;
  submitted_by_name?: string;
  submitted_by?: {
    username?: string;
  };
  profile_data?: Record<string, unknown>;
};

const statusLabel = (status?: string) => {
  switch (status) {
    case "planning":
      return "Draft";
    case "proposed":
      return "Submitted";
    case "completed":
      return "Approved";
    case "ongoing":
      return "Ongoing";
    default:
      return status || "N/A";
  }
};

const statusBadge = (status?: string) => {
  switch (status) {
    case "planning":
      return "bg-amber-100 text-amber-700";
    case "proposed":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getSubmissionType = (p: ApiProject): "simplified" | "detailed" => {
  const pd = p.profile_data as Record<string, unknown> | undefined;
  const st = String(pd?.submission_type || "").toLowerCase();
  const template = String(pd?.templateName || "").toLowerCase();
  if (st === "simplified" || template.includes("rdip")) return "simplified";
  return "detailed";
};

const submissionTypeLabel = (p: ApiProject) => (getSubmissionType(p) === "simplified" ? "Simplified" : "Detailed");

const getValidatorReview = (p: ApiProject) => {
  const pd = p.profile_data as Record<string, unknown> | undefined;
  const vr = pd?.validator_review;
  if (!vr || typeof vr !== "object") return null;
  return vr as Record<string, unknown>;
};

const reviewStateLabel = (p: ApiProject) => {
  const vr = getValidatorReview(p);
  const status = String(vr?.review_status || "").toLowerCase();
  if (status === "reviewed") return "Reviewed";
  if (status === "validated") return "Validated";
  if (status === "rejected") return "Rejected";
  return "Not Reviewed";
};

const reviewStateBadge = (p: ApiProject) => {
  const vr = getValidatorReview(p);
  const status = String(vr?.review_status || "").toLowerCase();
  if (status === "reviewed") return "bg-violet-100 text-violet-700";
  if (status === "validated") return "bg-emerald-100 text-emerald-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

const ValidatorReviewHistory: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get("validator/projects/?scope=history");
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load validator history:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProjects();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "projects_last_update") loadProjects();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      `${p.title || p.name || ""} ${p.agency || ""} ${p.submitted_by_name || p.submitted_by?.username || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [projects, query]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <PortalLayout
      title="Reviewed & Validated"
      subtitle="Projects you already reviewed or validated"
      role="validator"
      userName={user.username}
      topActions={<button onClick={loadProjects} className="portal-btn portal-btn-ghost">Refresh</button>}
    >
      <div className="portal-card mb-3">
        <div className="portal-card-body">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, agency, or contributor"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          />
        </div>
      </div>

      <div className="portal-card portal-table-wrap">
        {loading ? (
          <div className="portal-card-body text-slate-500">Loading reviewed history...</div>
        ) : filtered.length === 0 ? (
          <div className="portal-card-body text-slate-500">No reviewed/validated projects found yet.</div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="min-w-[160px]">Contributor</th>
                <th className="hidden lg:table-cell">Agency</th>
                <th className="hidden xl:table-cell">Budget</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Form Type</th>
                <th>Review State</th>
                <th className="hidden 2xl:table-cell">Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-[220px] truncate" title={p.title || p.name || "Untitled"}>{p.title || p.name || "Untitled"}</td>
                  <td className="max-w-[180px] truncate" title={p.submitted_by_name || p.submitted_by?.username || "Unknown"}>
                    {p.submitted_by_name || p.submitted_by?.username || "Unknown"}
                  </td>
                  <td className="hidden lg:table-cell max-w-[170px] truncate" title={p.agency || "N/A"}>{p.agency || "N/A"}</td>
                  <td className="hidden xl:table-cell">PHP {(p.budget || 0).toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSubmissionType(p) === "simplified" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {submissionTypeLabel(p)}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${reviewStateBadge(p)}`}>
                      {reviewStateLabel(p)}
                    </span>
                  </td>
                  <td className="hidden 2xl:table-cell">{p.updated_at ? new Date(p.updated_at).toLocaleString() : "-"}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/validator/projects/${p.id}/review`)}
                      className="text-blue-600 hover:underline whitespace-nowrap"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
};

export default ValidatorReviewHistory;

