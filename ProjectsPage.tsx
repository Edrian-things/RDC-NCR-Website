import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";

type ApiProject = {
  id: number;
  title?: string;
  name?: string;
  agency?: string;
  budget?: number;
  completion?: number;
  status?: string;
  updated_at?: string;
  submitted_by_name?: string;
  submitted_by?: {
    username?: string;
    email?: string;
    role?: string;
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

const ProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [canEncode, setCanEncode] = useState(true);
  const [encodeMessage, setEncodeMessage] = useState("");

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const role = user?.role as "admin" | "validator" | "employee" | undefined;

  const endpoint =
    role === "admin"
      ? "admin/projects/"
      : role === "validator"
      ? "validator/projects/?scope=queue"
      : "employee/projects/";

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get(endpoint);
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEncodingState = async () => {
    if (role !== "employee") return;
    try {
      const state = await api.get("encoding-window/");
      setCanEncode(Boolean(state?.can_encode));
      setEncodeMessage(state?.message || "");
    } catch (error) {
      console.error("Failed to load encoding state:", error);
      setCanEncode(true);
      setEncodeMessage("");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProjects();
    loadEncodingState();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "projects_last_update") loadProjects();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [role]);

  const selectedStatus = searchParams.get("status");
  const filtered = useMemo(() => {
    let list = projects;
    if (selectedStatus === "draft") list = list.filter((p) => p.status === "planning");
    else if (selectedStatus === "pending") list = list.filter((p) => p.status === "proposed");
    else if (selectedStatus === "approved") list = list.filter((p) => p.status === "completed");

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => `${p.title || p.name || ""} ${p.agency || ""}`.toLowerCase().includes(q));
  }, [projects, selectedStatus, query]);

  const handleSubmit = async (id: number) => {
    if (role === "employee" && !canEncode) return;
    await api.post(`employee/projects/${id}/submit/`);
    await loadProjects();
    localStorage.setItem("projects_last_update", Date.now().toString());
  };

  const handleArchive = async (id: number) => {
    await api.post(`admin/projects/${id}/archive/`);
    await loadProjects();
    localStorage.setItem("projects_last_update", Date.now().toString());
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const title = role === "admin" ? "Projects Governance" : role === "validator" ? "Validation Queue" : "My Projects";
  const subtitle =
    role === "admin"
      ? "Review all portal submissions, archive, and manage records"
      : role === "validator"
      ? "Process pending submissions and maintain review quality"
      : "Create, submit, view, and print your project records";

  return (
    <PortalLayout
      title={title}
      subtitle={subtitle}
      role={role || "employee"}
      userName={user.username}
      topActions={
        <>
          {role === "employee" && (
            <Link
              to={canEncode ? "/employee/projects/new" : "#"}
              onClick={(e) => !canEncode && e.preventDefault()}
              className={`portal-btn ${canEncode ? "portal-btn-primary" : "portal-btn-ghost opacity-70 cursor-not-allowed"}`}
            >
              + New Project
            </Link>
          )}
          <button onClick={loadProjects} className="portal-btn portal-btn-ghost">Refresh</button>
        </>
      }
    >
      {role === "employee" && !canEncode && (
        <div className="portal-card p-3 mb-3 border-amber-200 bg-amber-50 text-amber-800">
          {encodeMessage || "Encoding is currently closed by admin. You may view and print submissions only."}
        </div>
      )}

      <div className="portal-card mb-3">
        <div className="portal-card-body">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project title or agency"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
          />
        </div>
      </div>

      <div className="portal-card portal-table-wrap">
        {loading ? (
          <div className="portal-card-body text-slate-500">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="portal-card-body text-slate-500">No projects found.</div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Title</th>
                {(role === "admin" || role === "validator") && <th className="min-w-[160px]">Contributor</th>}
                <th className="hidden lg:table-cell">Agency</th>
                <th className="hidden xl:table-cell">Budget</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Form Type</th>
                {(role === "admin" || role === "validator") && <th className="hidden xl:table-cell">Review State</th>}
                <th className="hidden 2xl:table-cell">Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-[220px] truncate" title={p.title || p.name || "Untitled"}>{p.title || p.name || "Untitled"}</td>
                  {(role === "admin" || role === "validator") && (
                    <td className="max-w-[180px] truncate" title={p.submitted_by_name || p.submitted_by?.username || "Unknown"}>
                      {p.submitted_by_name || p.submitted_by?.username || "Unknown"}
                    </td>
                  )}
                  <td className="hidden lg:table-cell max-w-[170px] truncate" title={p.agency || "N/A"}>{p.agency || "N/A"}</td>
                  <td className="hidden xl:table-cell">PHP {(p.budget || 0).toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(p.status)}`}>{statusLabel(p.status)}</span>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSubmissionType(p) === "simplified" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {submissionTypeLabel(p)}
                    </span>
                  </td>
                  {(role === "admin" || role === "validator") && (
                    <td className="hidden xl:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${reviewStateBadge(p)}`}>
                        {reviewStateLabel(p)}
                      </span>
                    </td>
                  )}
                  <td className="hidden 2xl:table-cell">{p.updated_at ? new Date(p.updated_at).toLocaleString() : "-"}</td>
                  <td className="min-w-[150px]">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
                    {role === "employee" && (
                      <>
                        <button onClick={() => navigate(`/employee/projects/${p.id}/view`)} className="text-blue-700 hover:underline whitespace-nowrap">View</button>
                        <button
                          disabled={!canEncode || p.status !== "planning"}
                          onClick={() => navigate(`/employee/projects/${p.id}/edit/${getSubmissionType(p)}`)}
                          className={`whitespace-nowrap ${canEncode && p.status === "planning" ? "text-blue-600 hover:underline" : "text-slate-400 cursor-not-allowed"}`}
                        >
                          Edit
                        </button>
                        <button
                          disabled={!canEncode || p.status !== "planning"}
                          onClick={() => handleSubmit(p.id)}
                          className={`whitespace-nowrap ${canEncode && p.status === "planning" ? "text-indigo-600 hover:underline" : "text-slate-400 cursor-not-allowed"}`}
                        >
                          Submit
                        </button>
                      </>
                    )}
                    {role === "validator" && (
                      <>
                        <button
                          onClick={() =>
                            navigate(
                              getSubmissionType(p) === "simplified"
                                ? `/validator/projects/${p.id}/review/simplified`
                                : `/validator/projects/${p.id}/review/detailed`,
                            )
                          }
                          className="text-blue-600 hover:underline whitespace-nowrap"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {role === "admin" && (
                      <>
                        <button
                          onClick={() =>
                            navigate(
                              getSubmissionType(p) === "simplified"
                                ? `/admin/projects/${p.id}/view/simplified`
                                : `/admin/projects/${p.id}/view/detailed`,
                            )
                          }
                          className="text-blue-600 hover:underline whitespace-nowrap"
                        >
                          View
                        </button>
                        <button onClick={() => handleArchive(p.id)} className="text-amber-700 hover:underline whitespace-nowrap">Archive</button>
                      </>
                    )}
                    </div>
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

export default ProjectsPage;
