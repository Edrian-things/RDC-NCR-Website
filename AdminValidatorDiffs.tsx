import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";

type ApiProject = {
  id: number;
  title?: string;
  name?: string;
  agency?: string;
  status?: string;
  updated_at?: string;
  submitted_by_name?: string;
  submitted_by?: {
    username?: string;
  };
  profile_data?: Record<string, unknown>;
};

type ReviewState = "all" | "reviewed" | "validated" | "rejected" | "not_reviewed";

const getSubmissionType = (p: ApiProject): "simplified" | "detailed" => {
  const pd = p.profile_data as Record<string, unknown> | undefined;
  const st = String(pd?.submission_type || "").toLowerCase();
  const template = String(pd?.templateName || "").toLowerCase();
  if (st === "simplified" || template.includes("rdip")) return "simplified";
  return "detailed";
};

const getValidatorReview = (p: ApiProject): Record<string, unknown> | null => {
  const pd = p.profile_data as Record<string, unknown> | undefined;
  const vr = pd?.validator_review;
  if (!vr || typeof vr !== "object") return null;
  return vr as Record<string, unknown>;
};

const stateLabel = (value: string) => {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "Not Reviewed";
  if (normalized === "reviewed") return "Reviewed";
  if (normalized === "validated") return "Validated";
  if (normalized === "rejected") return "Rejected";
  return normalized;
};

const stateBadge = (value: string) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "reviewed") return "bg-violet-100 text-violet-700";
  if (normalized === "validated") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

const AdminValidatorDiffs: React.FC = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : { username: "admin" };

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApiProject[]>([]);
  const [query, setQuery] = useState("");
  const [reviewState, setReviewState] = useState<ReviewState>("all");
  const [editedOnly, setEditedOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get("admin/projects/");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load validator diffs:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (reviewState !== "all") {
      list = list.filter((p) => {
        const vr = getValidatorReview(p);
        const status = String(vr?.review_status || "").toLowerCase();
        if (reviewState === "not_reviewed") return !status;
        return status === reviewState;
      });
    }
    if (editedOnly) {
      list = list.filter((p) => {
        const vr = getValidatorReview(p);
        return Boolean(vr?.edited);
      });
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const vr = getValidatorReview(p);
      return [
        p.title || p.name || "",
        p.agency || "",
        p.submitted_by_name || p.submitted_by?.username || "",
        String(vr?.reviewed_by_username || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, reviewState, editedOnly]);

  return (
    <PortalLayout
      title="Validator Diffs"
      subtitle="Track reviewed copies, edited fields, and validator decisions"
      role="admin"
      userName={user.username}
      topActions={<button onClick={load} className="portal-btn portal-btn-ghost">Refresh</button>}
    >
      <div className="portal-card mb-3">
        <div className="portal-card-body grid grid-cols-1 lg:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, contributor, agency, validator"
            className="border border-slate-200 rounded-xl px-3 py-2 lg:col-span-2"
          />
          <select
            value={reviewState}
            onChange={(e) => setReviewState(e.target.value as ReviewState)}
            className="border border-slate-200 rounded-xl px-3 py-2"
          >
            <option value="all">All states</option>
            <option value="reviewed">Reviewed</option>
            <option value="validated">Validated</option>
            <option value="rejected">Rejected</option>
            <option value="not_reviewed">Not Reviewed</option>
          </select>
          <label className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
            <input type="checkbox" checked={editedOnly} onChange={(e) => setEditedOnly(e.target.checked)} />
            <span className="text-sm">Edited only</span>
          </label>
        </div>
      </div>

      <div className="portal-card portal-table-wrap">
        {loading ? (
          <div className="portal-card-body text-slate-500">Loading validator diffs...</div>
        ) : filtered.length === 0 ? (
          <div className="portal-card-body text-slate-500">No records matched the current filters.</div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="hidden md:table-cell">Contributor</th>
                <th className="hidden lg:table-cell">Form Type</th>
                <th>Review State</th>
                <th className="hidden lg:table-cell">Edited Fields</th>
                <th className="hidden xl:table-cell">Validator</th>
                <th className="hidden 2xl:table-cell">Reviewed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const vr = getValidatorReview(p);
                const reviewStatus = String(vr?.review_status || "");
                const editedCount = Number(vr?.edited_fields_count || 0);
                return (
                  <tr key={p.id}>
                    <td className="max-w-[250px] truncate" title={p.title || p.name || "Untitled"}>
                      {p.title || p.name || "Untitled"}
                    </td>
                    <td className="hidden md:table-cell">{p.submitted_by_name || p.submitted_by?.username || "-"}</td>
                    <td className="hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSubmissionType(p) === "simplified" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                        {getSubmissionType(p) === "simplified" ? "Simplified" : "Detailed"}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stateBadge(reviewStatus)}`}>
                        {stateLabel(reviewStatus)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">{editedCount}</td>
                    <td className="hidden xl:table-cell">{String(vr?.reviewed_by_username || "-")}</td>
                    <td className="hidden 2xl:table-cell">
                      {vr?.reviewed_at ? new Date(String(vr.reviewed_at)).toLocaleString() : "-"}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(
                            getSubmissionType(p) === "simplified"
                              ? `/admin/projects/${p.id}/view/simplified?mode=diff`
                              : `/admin/projects/${p.id}/view/detailed?mode=diff`,
                          )
                        }
                        className="text-blue-600 hover:underline whitespace-nowrap"
                      >
                        View Diffs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
};

export default AdminValidatorDiffs;
