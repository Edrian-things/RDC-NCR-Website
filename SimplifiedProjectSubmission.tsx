import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";

type FormAction = "save" | "submit";
type YesNo = "Yes" | "No";

type SimplifiedForm = {
  agencyName: string;
  program: string;
  projectActivity: string;
  location: string;
  startYear: string;
  endYear: string;
  fr2022Prior: string;
  fr2023: string;
  fr2024: string;
  fr2025: string;
  fr2026: string;
  fr2027: string;
  fr2028: string;
  frContinuing: string;
  aa2022Prior: string;
  aa2023: string;
  aa2024: string;
  aa2025: string;
  aa2026: string;
  aa2027: string;
  aa2028: string;
  aaContinuing: string;
  fundingSource: string;
  uacsCode: string;
  rdcEndorsed: YesNo | "";
  pipIncluded: YesNo | "";
  arnipapIncluded: YesNo | "";
  ifpsIncluded: YesNo | "";
  developmentSector: string;
  rdpMainChapter: string;
  status: string;
  remarks: string;
};

type DiffField = {
  before: string;
  after: string;
};

const initialForm: SimplifiedForm = {
  agencyName: "",
  program: "",
  projectActivity: "",
  location: "",
  startYear: "2025",
  endYear: "2025",
  fr2022Prior: "",
  fr2023: "",
  fr2024: "",
  fr2025: "",
  fr2026: "",
  fr2027: "",
  fr2028: "",
  frContinuing: "",
  aa2022Prior: "",
  aa2023: "",
  aa2024: "",
  aa2025: "",
  aa2026: "",
  aa2027: "",
  aa2028: "",
  aaContinuing: "",
  fundingSource: "",
  uacsCode: "",
  rdcEndorsed: "",
  pipIncluded: "",
  arnipapIncluded: "",
  ifpsIncluded: "",
  developmentSector: "",
  rdpMainChapter: "",
  status: "",
  remarks: "",
};

const yesNoOptions = ["Yes", "No"];
const fundingSourceOptions = [
  "NG-Local Funds (GAA)",
  "ODA",
  "PPP",
  "Agency",
  "LGUs",
  "NGOs",
  "Special/Trust Fund",
  "NDRRM",
  "N/A",
  "Others",
];
const developmentSectorOptions = [
  "Sectoral Committee on Infrastructure Development (SCID)",
  "Sectoral Committee on Social Development (SCSD)",
  "Sectoral Committee on Economic and Environment Development (SCEED)",
  "Sectoral Committee on Finance and Development Administration (SCFDA)",
];
const rdpChapterOptions = [
  "4.1",
  "4.2",
  "4.3.1",
  "4.3.2",
  "5.0",
  "5.1",
  "5.2",
  "6.1",
  "6.2",
  "7.0",
  "8.0",
  "9.0",
  "10.0",
  "11.0",
  "12.0",
  "13.0",
  "14.1",
  "14.2",
  "15.0",
  "16.0",
];
const statusOptions = ["Completed", "New", "Updated", "Ongoing", "Discontinued", "Not Implemented", "N/A", "Dropped"];

const toNumber = (raw: string) => {
  const n = Number((raw || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const parseYear = (value: string): number | null => {
  const n = Number(String(value || "").trim());
  if (!Number.isInteger(n) || n < 1900 || n > 2200) return null;
  return n;
};

const fmtNumber = (n: number) => (n > 0 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0");

const stringifyDiffValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const normalizeSimplifiedDiffPath = (path: string) => {
  let next = String(path || "").trim();
  if (!next) return "";
  if (next.startsWith("profile_data.")) next = next.slice("profile_data.".length);
  if (next.startsWith("simplified_form.")) next = next.slice("simplified_form.".length);
  return next;
};

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  diffBefore?: string;
}> = ({ label, value, onChange, required, diffBefore }) => (
  <label className="block">
    <span className="text-sm text-slate-700">{label}{required ? " *" : ""}</span>
    <input
      className={`mt-1 w-full border rounded p-2 ${diffBefore !== undefined ? "border-amber-500 bg-amber-50" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
    {diffBefore !== undefined && (
      <p className="text-xs text-amber-700 mt-1">Original: {diffBefore || "(empty)"}</p>
    )}
  </label>
);

const NumberField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  diffBefore?: string;
}> = ({ label, value, onChange, required, disabled, diffBefore }) => (
  <label className="block">
    <span className="text-sm text-slate-700">{label}{required ? " *" : ""}</span>
    <input
      type="number"
      inputMode="decimal"
      step="any"
      min="0"
      className={`mt-1 w-full border rounded p-2 ${disabled ? "bg-slate-100 text-slate-400" : ""} ${diffBefore !== undefined ? "border-amber-500 bg-amber-50" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
    {diffBefore !== undefined && (
      <p className="text-xs text-amber-700 mt-1">Original: {diffBefore || "(empty)"}</p>
    )}
  </label>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  diffBefore?: string;
}> = ({ label, value, onChange, options, required, diffBefore }) => (
  <label className="block">
    <span className="text-sm text-slate-700">{label}{required ? " *" : ""}</span>
    <select
      className={`mt-1 w-full border rounded p-2 ${diffBefore !== undefined ? "border-amber-500 bg-amber-50" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">Choose</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    {diffBefore !== undefined && (
      <p className="text-xs text-amber-700 mt-1">Original: {diffBefore || "(empty)"}</p>
    )}
  </label>
);

const SimplifiedProjectSubmission: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const [form, setForm] = useState<SimplifiedForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [canEncode, setCanEncode] = useState(true);
  const [encodeMessage, setEncodeMessage] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("planning");
  const [formReady, setFormReady] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState("");
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState("");
  const [validatorNotes, setValidatorNotes] = useState("");
  const [diffMap, setDiffMap] = useState<Record<string, DiffField>>({});
  const [diffEntries, setDiffEntries] = useState<Array<{ field: string; before: string; after: string }>>([]);
  const isValidator = user?.role === "validator";
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";
  const isDiffMode = isAdmin && searchParams.get("mode") === "diff";

  const draftStorageKey = useMemo(() => {
    const identity =
      user?.username ||
      user?.email ||
      (user?.id ? String(user.id) : "") ||
      user?.role ||
      "";
    if (!identity) return "";
    return `simplified_submission_draft_v1_${identity}_${id || "new"}`;
  }, [user?.username, user?.email, user?.id, user?.role, id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const loadEncoding = async () => {
      try {
        const state = await api.get("encoding-window/");
        setCanEncode(Boolean(state?.can_encode));
        setEncodeMessage(state?.message || "");
      } catch {
        setCanEncode(true);
      }
    };
    loadEncoding();
  }, [navigate, user]);

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEditMode || !id) {
        setFormReady(true);
        return;
      }
      try {
        const base = isValidator ? "validator" : isAdmin ? "admin" : "employee";
        const data = await api.get(`${base}/projects/${id}/`);
        setProjectStatus(data?.status || "planning");
        const pd = (data?.profile_data || {}) as Record<string, unknown>;
        const validatorReview = pd?.validator_review as Record<string, unknown> | undefined;
        const contributorSnapshot =
          pd?.contributor_snapshot && typeof pd.contributor_snapshot === "object"
            ? (pd.contributor_snapshot as Record<string, unknown>)
            : pd;
        const workingCopy =
          validatorReview && typeof validatorReview.working_copy === "object"
            ? (validatorReview.working_copy as Record<string, unknown>)
            : contributorSnapshot;
        const sourceData = isValidator
          ? workingCopy
          : isAdmin
          ? (isDiffMode ? workingCopy : contributorSnapshot)
          : pd;
        const simplified = (sourceData.simplified_form || sourceData) as Partial<SimplifiedForm>;
        if (pd.submission_type && pd.submission_type !== "simplified") {
          if (isValidator) navigate(`/validator/projects/${id}/review/detailed`, { replace: true });
          else if (isAdmin) navigate(`/admin/projects/${id}/view/detailed${isDiffMode ? "?mode=diff" : ""}`, { replace: true });
          else navigate(`/employee/projects/${id}/edit/detailed`, { replace: true });
          return;
        }
        setForm({
          ...initialForm,
          ...simplified,
          agencyName: String(simplified.agencyName || data?.agency || ""),
          projectActivity: String(simplified.projectActivity || data?.title || data?.name || ""),
        });
        if (isValidator && validatorReview) {
          setValidatorNotes(String(validatorReview.review_notes || ""));
        }
        if (isAdmin && isDiffMode && Array.isArray(validatorReview?.edited_fields)) {
          const nextDiffs: Record<string, DiffField> = {};
          const nextEntries: Array<{ field: string; before: string; after: string }> = [];
          for (const raw of validatorReview.edited_fields as Array<Record<string, unknown>>) {
            const key = normalizeSimplifiedDiffPath(String(raw?.field || ""));
            if (!key) continue;
            const before = stringifyDiffValue(raw?.before);
            const after = stringifyDiffValue(raw?.after);
            nextDiffs[key] = {
              before,
              after,
            };
            nextEntries.push({ field: key, before, after });
          }
          setDiffMap(nextDiffs);
          setDiffEntries(nextEntries);
        } else {
          setDiffMap({});
          setDiffEntries([]);
        }
      } catch (error) {
        console.error("Failed to load simplified project:", error);
      } finally {
        setFormReady(true);
      }
    };
    loadExisting();
  }, [id, isEditMode, navigate, isValidator, isAdmin, isDiffMode]);

  useEffect(() => {
    if (!isEmployee || !formReady || !draftStorageKey) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { form?: Partial<SimplifiedForm>; savedAt?: string };
      if (!parsed?.form || typeof parsed.form !== "object") return;
      setForm((prev) => ({ ...prev, ...parsed.form }));
      if (parsed.savedAt) setLastLocalSaveAt(parsed.savedAt);
      setRestoreNotice("Recovered your unsaved local inputs from this browser.");
    } catch (error) {
      console.error("Failed to restore simplified local draft:", error);
    }
  }, [isEmployee, formReady, draftStorageKey]);

  useEffect(() => {
    if (!isEmployee || !formReady || !draftStorageKey) return;
    const timer = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            form,
            savedAt,
          }),
        );
        setLastLocalSaveAt(savedAt);
      } catch (error) {
        console.error("Failed to autosave simplified local draft:", error);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [isEmployee, form, draftStorageKey, formReady]);

  useEffect(() => {
    if (!isEmployee || !formReady || !draftStorageKey) return;
    const persistNow = () => {
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            form,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.error("Failed to persist simplified local draft before unload:", error);
      }
    };
    window.addEventListener("beforeunload", persistNow);
    return () => window.removeEventListener("beforeunload", persistNow);
  }, [isEmployee, form, draftStorageKey, formReady]);

  const startYearNum = useMemo(() => parseYear(form.startYear), [form.startYear]);
  const endYearNum = useMemo(() => parseYear(form.endYear), [form.endYear]);
  const fundingRange = useMemo(() => {
    if (startYearNum === null || endYearNum === null) return null;
    return {
      minYear: Math.min(startYearNum, endYearNum),
      maxYear: Math.max(startYearNum, endYearNum),
    };
  }, [startYearNum, endYearNum]);

  const canEditYear = (year: number) => {
    if (!fundingRange) return true;
    return year >= fundingRange.minYear && year <= fundingRange.maxYear;
  };
  const canEdit2022Prior = !fundingRange || fundingRange.minYear <= 2022;
  const canEditContinuing = !fundingRange || fundingRange.maxYear > 2028;

  useEffect(() => {
    if (!fundingRange) return;
    setForm((prev) => {
      const next = { ...prev };
      let changed = false;

      const clearIfDisabled = (enabled: boolean, key: keyof SimplifiedForm) => {
        if (!enabled && String(next[key] || "").trim()) {
          next[key] = "" as never;
          changed = true;
        }
      };

      clearIfDisabled(canEdit2022Prior, "fr2022Prior");
      clearIfDisabled(canEditYear(2023), "fr2023");
      clearIfDisabled(canEditYear(2024), "fr2024");
      clearIfDisabled(canEditYear(2025), "fr2025");
      clearIfDisabled(canEditYear(2026), "fr2026");
      clearIfDisabled(canEditYear(2027), "fr2027");
      clearIfDisabled(canEditYear(2028), "fr2028");
      clearIfDisabled(canEditContinuing, "frContinuing");

      clearIfDisabled(canEdit2022Prior, "aa2022Prior");
      clearIfDisabled(canEditYear(2023), "aa2023");
      clearIfDisabled(canEditYear(2024), "aa2024");
      clearIfDisabled(canEditYear(2025), "aa2025");
      clearIfDisabled(canEditYear(2026), "aa2026");
      clearIfDisabled(canEditYear(2027), "aa2027");
      clearIfDisabled(canEditYear(2028), "aa2028");
      clearIfDisabled(canEditContinuing, "aaContinuing");

      return changed ? next : prev;
    });
  }, [fundingRange, canEdit2022Prior, canEditContinuing]);

  const frTotal = useMemo(
    () =>
      toNumber(form.fr2022Prior) +
      toNumber(form.fr2023) +
      toNumber(form.fr2024) +
      toNumber(form.fr2025) +
      toNumber(form.fr2026) +
      toNumber(form.fr2027) +
      toNumber(form.fr2028) +
      toNumber(form.frContinuing),
    [form.fr2022Prior, form.fr2023, form.fr2024, form.fr2025, form.fr2026, form.fr2027, form.fr2028, form.frContinuing],
  );
  const aaTotal = useMemo(
    () =>
      toNumber(form.aa2022Prior) +
      toNumber(form.aa2023) +
      toNumber(form.aa2024) +
      toNumber(form.aa2025) +
      toNumber(form.aa2026) +
      toNumber(form.aa2027) +
      toNumber(form.aa2028) +
      toNumber(form.aaContinuing),
    [form.aa2022Prior, form.aa2023, form.aa2024, form.aa2025, form.aa2026, form.aa2027, form.aa2028, form.aaContinuing],
  );

  const isReadOnly = isAdmin || (isEmployee && !canEncode) || (isEmployee && isEditMode && projectStatus !== "planning");
  const diffOf = (field: keyof SimplifiedForm) => diffMap[field as string];

  const setField = <K extends keyof SimplifiedForm>(key: K, value: SimplifiedForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (e: React.FormEvent, action: FormAction) => {
    e.preventDefault();
    if (isReadOnly) {
      alert(isAdmin ? "Admin form view is read-only." : encodeMessage || "Encoding is closed. This form is view-only.");
      return;
    }
    if (isValidator && !id) {
      alert("Validator review requires an existing project.");
      return;
    }
    const required: Array<keyof SimplifiedForm> = [
      "agencyName",
      "program",
      "projectActivity",
      "location",
      "startYear",
      "endYear",
      "fundingSource",
      "rdcEndorsed",
      "pipIncluded",
      "arnipapIncluded",
      "ifpsIncluded",
      "developmentSector",
      "rdpMainChapter",
      "status",
    ];
    if (!isValidator && action === "submit") {
      const missing = required.filter((k) => !String(form[k] || "").trim());
      if (missing.length > 0) {
        alert("Please complete all required fields before submit.");
        return;
      }
    }

    setLoading(true);
    try {
      const normalizedProfileData = {
        submission_type: "simplified",
        templateName: "RDIP-NCR Simplified 2025",
        simplified_form: {
          ...form,
          fundingRequirementTotal: frTotal,
          actualApprovedTotal: aaTotal,
        },
      };

      if (isValidator && id) {
        await api.post(`validator/projects/${id}/validate/`, {
          action: action === "save" ? "save_reviewed" : "validate",
          notes: validatorNotes,
          edited_profile_data: normalizedProfileData,
        });
        localStorage.setItem("projects_last_update", Date.now().toString());
        alert(action === "save" ? "Saved as reviewed." : "Project validated.");
        navigate("/validator/projects");
        return;
      }

      const payload = {
        title: form.projectActivity || form.program || "Untitled Project",
        description: form.remarks || form.projectActivity || "",
        agency: form.agencyName,
        budget: Math.round(frTotal),
        completion: 0,
        status: action === "save" ? "draft" : "pending_validation",
        municipality: "NCR",
        profile_data: normalizedProfileData,
      };
      let targetId = id;
      if (isEditMode && id) {
        await api.put(`employee/projects/${id}/`, payload);
      } else {
        const created = await api.post("employee/projects/", payload);
        targetId = String(created?.id || "");
      }
      if (action === "submit" && targetId) {
        await api.post(`employee/projects/${targetId}/submit/`, {});
      }
      if (action === "submit" && draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }
      localStorage.setItem("projects_last_update", Date.now().toString());
      alert(action === "save" ? "Simplified draft saved." : "Simplified submission sent for validation.");
      navigate(isAdmin ? "/admin/projects" : "/employee/projects");
    } catch (error) {
      console.error(error);
      const detail = error instanceof Error ? error.message : "";
      alert(detail ? `Failed to save simplified form. ${detail}` : "Failed to save simplified form.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  const localSavedLabel = lastLocalSaveAt ? new Date(lastLocalSaveAt).toLocaleString() : "";

  return (
    <PortalLayout
      title={
        isValidator
          ? "Validator Simplified Review Form"
          : isAdmin
          ? "Admin Simplified Form View"
          : isEditMode
          ? "Simplified RDIP Submission Editor"
          : "New Simplified RDIP Submission"
      }
      subtitle={
        isValidator
          ? "Edit reviewer working copy without changing contributor original"
          : isAdmin
          ? isDiffMode
            ? "Read-only validator diff view with original contributor values"
            : "Read-only contributor submission view"
          : "RDIP monitoring matrix format for streamlined contributor encoding"
      }
      role={(user.role || "employee") as "admin" | "validator" | "employee"}
      userName={user.username}
      topActions={
        <>
          {isEmployee && (
            <button type="button" onClick={() => navigate("/employee/projects/new")} className="portal-btn portal-btn-ghost">Back to Form Type</button>
          )}
          <button type="button" onClick={() => navigate(isValidator ? "/validator/projects" : isAdmin ? "/admin/projects" : "/employee/projects")} className="portal-btn portal-btn-ghost">Back to Projects</button>
        </>
      }
    >
      {!canEncode && (
        <div className="portal-card p-3 mb-3 border-amber-200 bg-amber-50 text-amber-800">
          {encodeMessage || "Encoding is currently closed by admin."}
        </div>
      )}
      {isEditMode && isEmployee && projectStatus !== "planning" && (
        <div className="portal-card p-3 mb-3 border-blue-200 bg-blue-50 text-blue-800">
          This submission is already sent and is now view-only for contributors.
        </div>
      )}
      {(restoreNotice || localSavedLabel) && (
        <div className="portal-card p-3 mb-3 border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
          {restoreNotice || "Local draft autosave is active."}
          {localSavedLabel ? ` Last local save: ${localSavedLabel}` : ""}
        </div>
      )}
      {isValidator && (
        <div className="portal-card p-3 mb-3 border-indigo-200 bg-indigo-50 text-indigo-800 text-sm">
          You are editing a validator review copy. Contributor original form remains unchanged.
        </div>
      )}
      {isAdmin && (
        <div className={`portal-card p-3 mb-3 text-sm ${isDiffMode ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
          {isDiffMode
            ? `Diff mode is active. Highlighted fields were edited by validator. Changed fields: ${Object.keys(diffMap).length}.`
            : "Admin read-only mode. This shows the contributor's original submitted form values."}
        </div>
      )}
      {isAdmin && isDiffMode && diffEntries.length > 0 && (
        <div className="portal-card mb-3 border-amber-200">
          <div className="px-3 py-2 border-b border-amber-200 bg-amber-50 text-amber-900 text-sm font-semibold">
            Validator Edited Fields
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left">Field</th>
                  <th className="px-2 py-1 text-left">Original</th>
                  <th className="px-2 py-1 text-left">Validator Copy</th>
                </tr>
              </thead>
              <tbody>
                {diffEntries.slice(0, 200).map((entry, idx) => (
                  <tr key={`${entry.field}-${idx}`} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-1 font-mono">{entry.field}</td>
                    <td className="px-2 py-1 whitespace-pre-wrap break-words">{entry.before || "(empty)"}</td>
                    <td className="px-2 py-1 whitespace-pre-wrap break-words">{entry.after || "(empty)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <form onSubmit={(e) => save(e, "submit")} className="portal-card p-3 sm:p-4 lg:p-6 space-y-6">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div className="grid xl:grid-cols-2 gap-4">
            <TextField label="Responsible Agency/LGU" value={form.agencyName} onChange={(v) => setField("agencyName", v)} required diffBefore={diffOf("agencyName")?.before} />
            <TextField label="Program" value={form.program} onChange={(v) => setField("program", v)} required diffBefore={diffOf("program")?.before} />
            <TextField label="Project/Activity" value={form.projectActivity} onChange={(v) => setField("projectActivity", v)} required diffBefore={diffOf("projectActivity")?.before} />
            <TextField label="Location" value={form.location} onChange={(v) => setField("location", v)} required diffBefore={diffOf("location")?.before} />
            <TextField label="Start Year" value={form.startYear} onChange={(v) => setField("startYear", v)} required diffBefore={diffOf("startYear")?.before} />
            <TextField label="End Year" value={form.endYear} onChange={(v) => setField("endYear", v)} required diffBefore={diffOf("endYear")?.before} />
          </div>

          <div className="grid xl:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Funding Requirement (PHP)</h3>
              <div className="grid sm:grid-cols-3 gap-2">
                <NumberField label="2022 & Prior" value={form.fr2022Prior} onChange={(v) => setField("fr2022Prior", v)} disabled={!canEdit2022Prior} diffBefore={diffOf("fr2022Prior")?.before} />
                <NumberField label="2023" value={form.fr2023} onChange={(v) => setField("fr2023", v)} disabled={!canEditYear(2023)} diffBefore={diffOf("fr2023")?.before} />
                <NumberField label="2024" value={form.fr2024} onChange={(v) => setField("fr2024", v)} disabled={!canEditYear(2024)} diffBefore={diffOf("fr2024")?.before} />
                <NumberField label="2025" value={form.fr2025} onChange={(v) => setField("fr2025", v)} disabled={!canEditYear(2025)} diffBefore={diffOf("fr2025")?.before} />
                <NumberField label="2026" value={form.fr2026} onChange={(v) => setField("fr2026", v)} disabled={!canEditYear(2026)} diffBefore={diffOf("fr2026")?.before} />
                <NumberField label="2027" value={form.fr2027} onChange={(v) => setField("fr2027", v)} disabled={!canEditYear(2027)} diffBefore={diffOf("fr2027")?.before} />
                <NumberField label="2028" value={form.fr2028} onChange={(v) => setField("fr2028", v)} disabled={!canEditYear(2028)} diffBefore={diffOf("fr2028")?.before} />
                <NumberField label="Continuing" value={form.frContinuing} onChange={(v) => setField("frContinuing", v)} disabled={!canEditContinuing} diffBefore={diffOf("frContinuing")?.before} />
              </div>
              <p className="text-sm text-slate-600">Total: <strong>{fmtNumber(frTotal)}</strong></p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Actual/Approved Funding (PHP)</h3>
              <div className="grid sm:grid-cols-3 gap-2">
                <NumberField label="2022 & Prior" value={form.aa2022Prior} onChange={(v) => setField("aa2022Prior", v)} disabled={!canEdit2022Prior} diffBefore={diffOf("aa2022Prior")?.before} />
                <NumberField label="2023" value={form.aa2023} onChange={(v) => setField("aa2023", v)} disabled={!canEditYear(2023)} diffBefore={diffOf("aa2023")?.before} />
                <NumberField label="2024" value={form.aa2024} onChange={(v) => setField("aa2024", v)} disabled={!canEditYear(2024)} diffBefore={diffOf("aa2024")?.before} />
                <NumberField label="2025" value={form.aa2025} onChange={(v) => setField("aa2025", v)} disabled={!canEditYear(2025)} diffBefore={diffOf("aa2025")?.before} />
                <NumberField label="2026" value={form.aa2026} onChange={(v) => setField("aa2026", v)} disabled={!canEditYear(2026)} diffBefore={diffOf("aa2026")?.before} />
                <NumberField label="2027" value={form.aa2027} onChange={(v) => setField("aa2027", v)} disabled={!canEditYear(2027)} diffBefore={diffOf("aa2027")?.before} />
                <NumberField label="2028" value={form.aa2028} onChange={(v) => setField("aa2028", v)} disabled={!canEditYear(2028)} diffBefore={diffOf("aa2028")?.before} />
                <NumberField label="Continuing" value={form.aaContinuing} onChange={(v) => setField("aaContinuing", v)} disabled={!canEditContinuing} diffBefore={diffOf("aaContinuing")?.before} />
              </div>
              <p className="text-sm text-slate-600">Total: <strong>{fmtNumber(aaTotal)}</strong></p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Editable budget fields are controlled by Start Year and End Year.
            Current range: {fundingRange ? `${fundingRange.minYear} to ${fundingRange.maxYear}` : "not set"}.
          </p>

          <div className="grid xl:grid-cols-2 gap-4">
            <SelectField label="Funding Source" value={form.fundingSource} onChange={(v) => setField("fundingSource", v)} options={fundingSourceOptions} required diffBefore={diffOf("fundingSource")?.before} />
            <TextField label="UACS Code (if GAA-funded)" value={form.uacsCode} onChange={(v) => setField("uacsCode", v)} diffBefore={diffOf("uacsCode")?.before} />
            <SelectField label="RDC-NCR Endorsed" value={form.rdcEndorsed} onChange={(v) => setField("rdcEndorsed", v as YesNo)} options={yesNoOptions} required diffBefore={diffOf("rdcEndorsed")?.before} />
            <SelectField label="PIP Included" value={form.pipIncluded} onChange={(v) => setField("pipIncluded", v as YesNo)} options={yesNoOptions} required diffBefore={diffOf("pipIncluded")?.before} />
            <SelectField label="ARNIPAP Included" value={form.arnipapIncluded} onChange={(v) => setField("arnipapIncluded", v as YesNo)} options={yesNoOptions} required diffBefore={diffOf("arnipapIncluded")?.before} />
            <SelectField label="IFPs Included" value={form.ifpsIncluded} onChange={(v) => setField("ifpsIncluded", v as YesNo)} options={yesNoOptions} required diffBefore={diffOf("ifpsIncluded")?.before} />
            <SelectField label="RDC-NCR Development Sector" value={form.developmentSector} onChange={(v) => setField("developmentSector", v)} options={developmentSectorOptions} required diffBefore={diffOf("developmentSector")?.before} />
            <SelectField label="RDP-NCR Main Chapter" value={form.rdpMainChapter} onChange={(v) => setField("rdpMainChapter", v)} options={rdpChapterOptions} required diffBefore={diffOf("rdpMainChapter")?.before} />
            <SelectField label="Status" value={form.status} onChange={(v) => setField("status", v)} options={statusOptions} required diffBefore={diffOf("status")?.before} />
          </div>

          <label className="block">
            <span className="text-sm text-slate-700">Remarks</span>
            <textarea
              className={`mt-1 w-full border rounded p-2 ${diffOf("remarks") ? "border-amber-500 bg-amber-50" : ""}`}
              rows={5}
              value={form.remarks}
              onChange={(e) => setField("remarks", e.target.value)}
            />
            {diffOf("remarks") && (
              <p className="text-xs text-amber-700 mt-1">Original: {diffOf("remarks")?.before || "(empty)"}</p>
            )}
          </label>

          {isValidator && (
            <label className="block">
              <span className="text-sm text-slate-700">Validator Notes</span>
              <textarea
                className="mt-1 w-full border rounded p-2"
                rows={3}
                value={validatorNotes}
                onChange={(e) => setValidatorNotes(e.target.value)}
                placeholder="Optional notes for admin and audit trail"
              />
            </label>
          )}

          {!isAdmin && (
            <div className="pt-4 border-t flex flex-wrap gap-3 justify-end">
              <button type="button" onClick={(e) => save(e as unknown as React.FormEvent, "save")} className="portal-btn portal-btn-ghost" disabled={loading || isReadOnly}>
                {loading ? "Saving..." : isValidator ? "Save as Reviewed" : "Save Draft"}
              </button>
              <button type="submit" className="portal-btn portal-btn-primary" disabled={loading || isReadOnly}>
                {loading ? "Submitting..." : isValidator ? "Validated" : "Submit for Validation"}
              </button>
            </div>
          )}
        </fieldset>
      </form>
    </PortalLayout>
  );
};

export default SimplifiedProjectSubmission;
