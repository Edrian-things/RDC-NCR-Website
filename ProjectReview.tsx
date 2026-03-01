import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import ProjectProfileReadOnly from "./ProjectProfileReadOnly";
import PortalLayout from "../../components/portal/PortalLayout";
import PrintAppendix from "./PrintAppendix";

type ApiProject = {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  agency?: string;
  budget?: number;
  status?: string;
  completion?: number;
  profile_data?: Record<string, any>;
  submitted_by_name?: string;
  submitted_by?: {
    username?: string;
    email?: string;
  };
};

const getSubmissionType = (project: ApiProject | null): "simplified" | "detailed" => {
  if (!project?.profile_data) return "detailed";
  const st = String(project.profile_data.submission_type || "").toLowerCase();
  const template = String(project.profile_data.templateName || "").toLowerCase();
  if (st === "simplified" || template.includes("rdip")) return "simplified";
  return "detailed";
};

const getValidatorReview = (project: ApiProject | null): Record<string, any> | null => {
  if (!project?.profile_data) return null;
  const vr = project.profile_data.validator_review;
  if (!vr || typeof vr !== "object") return null;
  return vr as Record<string, any>;
};

const ProjectReview: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeAppendix, setIncludeAppendix] = useState(false);
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const role = user?.role as "admin" | "validator" | "employee" | undefined;
  const isAdmin = role === "admin";
  const isValidator = role === "validator";

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const base =
        role === "admin"
          ? "admin"
          : role === "validator"
          ? "validator"
          : "employee";
      const data = await api.get(`${base}/projects/${id}/`);
      setProject(data);
    } catch (error) {
      console.error("Failed to load project review:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onArchive = async () => {
    if (!id || !isAdmin) return;
    await api.post(`admin/projects/${id}/archive/`, {});
    localStorage.setItem("projects_last_update", Date.now().toString());
    navigate("/admin/projects");
  };

  const onPrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8 text-red-600">Project not found.</div>;
  }

  const submissionType = getSubmissionType(project);
  const simplified = project.profile_data?.simplified_form as Record<string, any> | undefined;
  const validatorReview = getValidatorReview(project);

  return (
    <PortalLayout
      title="Project View & Review"
      subtitle="Template-aligned submitted profile with print/PDF export"
      role={(role || "employee") as "admin" | "validator" | "employee"}
      userName={user?.username || "User"}
      topActions={
        <button onClick={onPrint} className="portal-btn portal-btn-primary no-print">
          Print / Save PDF
        </button>
      }
    >
    <div className="p-1 max-w-5xl mx-auto printable-page">
      <div className="mb-4 border-b border-gray-300 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 text-center">PROJECT PROFILE FORM</h1>
        <p className="text-center text-sm text-gray-600">RDC-NCR Portal | Printable Submission Copy</p>
      </div>
      <div className="bg-white rounded-xl shadow p-6 space-y-4 print-shell">
        <div className="grid md:grid-cols-2 gap-4 border border-gray-300 p-3 rounded print:border-black print:rounded-none">
          <div>
            <p className="text-xs text-gray-500">Title</p>
            <p className="font-semibold">{project.title || project.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Agency</p>
            <p>{project.agency || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p>PHP {(project.budget || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="uppercase">{project.status || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Form Type</p>
            <p>{submissionType === "simplified" ? "Simplified (RDIP)" : "Detailed (Template 2025v1)"}</p>
          </div>
          {(isAdmin || isValidator) && (
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500">Contributor</p>
              <p>{project.submitted_by_name || project.submitted_by?.username || "Unknown"}</p>
            </div>
          )}
        </div>
        {(isAdmin || isValidator) && (
          <div className="border border-indigo-200 bg-indigo-50 rounded p-3 text-sm space-y-1">
            <p className="font-semibold text-indigo-900">Validator Review Metadata</p>
            <p>
              State:{" "}
              <span className="font-medium">
                {String(validatorReview?.review_status || "not reviewed").replaceAll("_", " ")}
              </span>
            </p>
            <p>Edited by validator: {validatorReview?.edited ? "Yes" : "No"}</p>
            <p>Edited fields count: {Number(validatorReview?.edited_fields_count || 0)}</p>
            <p>
              Reviewed by: {validatorReview?.reviewed_by_username || "-"} |{" "}
              {validatorReview?.reviewed_at ? new Date(validatorReview.reviewed_at).toLocaleString() : "-"}
            </p>
            {validatorReview?.review_notes ? <p>Review notes: {String(validatorReview.review_notes)}</p> : null}
          </div>
        )}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Complete Submitted Profile</h3>
          {submissionType === "simplified" ? (
            <div className="space-y-3 text-sm">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Responsible Agency/LGU</p><p>{simplified?.agencyName || project.agency || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Program</p><p>{simplified?.program || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Project/Activity</p><p>{simplified?.projectActivity || project.title || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Location</p><p>{simplified?.location || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Implementation Period</p><p>{simplified?.startYear || "-"} to {simplified?.endYear || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Funding Source</p><p>{simplified?.fundingSource || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">UACS Code</p><p>{simplified?.uacsCode || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">Status</p><p>{simplified?.status || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">RDC-NCR Development Sector</p><p>{simplified?.developmentSector || "-"}</p></div>
                <div className="border rounded p-3"><p className="text-xs text-slate-500">RDP-NCR Main Chapter</p><p>{simplified?.rdpMainChapter || "-"}</p></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <p className="font-medium mb-2">Funding Requirement</p>
                  <p>2022 & Prior: {simplified?.fr2022Prior || "0"} | 2023: {simplified?.fr2023 || "0"} | 2024: {simplified?.fr2024 || "0"}</p>
                  <p>2025: {simplified?.fr2025 || "0"} | 2026: {simplified?.fr2026 || "0"} | 2027: {simplified?.fr2027 || "0"}</p>
                  <p>2028: {simplified?.fr2028 || "0"} | Continuing: {simplified?.frContinuing || "0"}</p>
                  <p className="mt-1">Total: {Number(simplified?.fundingRequirementTotal || 0).toLocaleString()}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="font-medium mb-2">Actual/Approved Funding</p>
                  <p>2022 & Prior: {simplified?.aa2022Prior || "0"} | 2023: {simplified?.aa2023 || "0"} | 2024: {simplified?.aa2024 || "0"}</p>
                  <p>2025: {simplified?.aa2025 || "0"} | 2026: {simplified?.aa2026 || "0"} | 2027: {simplified?.aa2027 || "0"}</p>
                  <p>2028: {simplified?.aa2028 || "0"} | Continuing: {simplified?.aaContinuing || "0"}</p>
                  <p className="mt-1">Total: {Number(simplified?.actualApprovedTotal || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="border rounded p-3">
                <p className="font-medium mb-1">Flags</p>
                <p>RDC Endorsed: {simplified?.rdcEndorsed || "-"}</p>
                <p>PIP Included: {simplified?.pipIncluded || "-"}</p>
                <p>ARNIPAP Included: {simplified?.arnipapIncluded || "-"}</p>
                <p>IFPs Included: {simplified?.ifpsIncluded || "-"}</p>
              </div>
              <div className="border rounded p-3">
                <p className="font-medium mb-1">Remarks</p>
                <p>{simplified?.remarks || "-"}</p>
              </div>
            </div>
          ) : (
            <ProjectProfileReadOnly profileData={project.profile_data} />
          )}
          {(isAdmin || isValidator) && Array.isArray(validatorReview?.edited_fields) && validatorReview.edited_fields.length > 0 && (
            <div className="mt-4 border rounded p-3">
              <p className="font-semibold mb-2">Edited Fields by Validator</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">Field</th>
                      <th className="border px-2 py-1 text-left">Contributor Original</th>
                      <th className="border px-2 py-1 text-left">Validator Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatorReview.edited_fields.slice(0, 120).map((item: any, idx: number) => (
                      <tr key={`${item?.field || "field"}-${idx}`}>
                        <td className="border px-2 py-1 align-top">{String(item?.field || "-")}</td>
                        <td className="border px-2 py-1 align-top whitespace-pre-wrap break-words max-w-[340px]">{String(item?.before || "")}</td>
                        <td className="border px-2 py-1 align-top whitespace-pre-wrap break-words max-w-[340px]">{String(item?.after || "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 no-print">
          <label className="text-sm flex items-center gap-2 border rounded-lg px-3 py-2">
            <input type="checkbox" checked={includeAppendix} onChange={(e) => setIncludeAppendix(e.target.checked)} />
            Include guidance annex (pages 14-18 style)
          </label>
          {isValidator && (
            <button
              onClick={() =>
                navigate(
                  submissionType === "simplified"
                    ? `/validator/projects/${project.id}/review/simplified`
                    : `/validator/projects/${project.id}/review/detailed`,
                )
              }
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Open Editable Review Form
            </button>
          )}
          {isAdmin && (
            <button onClick={onArchive} className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700">
              Archive
            </button>
          )}
          <button
            onClick={() => navigate(isAdmin ? "/admin/projects" : isValidator ? "/validator/projects" : "/employee/projects")}
            className="px-4 py-2 rounded-lg border"
          >
            Back
          </button>
        </div>
      </div>
      {includeAppendix && (
        <div className="mt-3 print:block">
          <PrintAppendix />
        </div>
      )}
      <style>
        {`
          @page { size: A4; margin: 10mm; }
          @media print {
            .no-print { display: none !important; }
            .printable-page { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
            .print-shell { box-shadow: none !important; border: 1px solid #ddd !important; }
            body { background: #fff !important; }
            .portal-sidebar, .portal-topbar { display: none !important; }
          }
        `}
      </style>
    </div>
    </PortalLayout>
  );
};

export default ProjectReview;
