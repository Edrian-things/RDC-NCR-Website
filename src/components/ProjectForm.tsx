// src/components/ProjectForm.tsx
import React, { useEffect, useState } from "react";

export type ProjectPayload = {
  id?: number;
  name: string;
  agency: string;
  status: "Planning" | "Proposed" | "Ongoing" | "Completed";
  budget: string;
  completion: number;
};

interface Props {
  initial?: Partial<ProjectPayload>;
  onSave: (data: ProjectPayload) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<Props> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<ProjectPayload>({
    id: initial?.id,
    name: initial?.name || "",
    agency: initial?.agency || "",
    status: (initial?.status as any) || "Planning",
    budget: initial?.budget || "",
    completion: initial?.completion ?? 0,
  });

  useEffect(() => {
    setForm({
      id: initial?.id,
      name: initial?.name || "",
      agency: initial?.agency || "",
      status: (initial?.status as any) || "Planning",
      budget: initial?.budget || "",
      completion: initial?.completion ?? 0,
    });
  }, [initial]);

  const update = (k: keyof ProjectPayload, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.agency)
      return alert("Please fill required fields.");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={submit}
        className="bg-white rounded shadow p-6 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold mb-4">
          {form.id ? "Edit Project" : "Add New Project"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Project Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Agency</label>
            <input
              value={form.agency}
              onChange={(e) => update("agency", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>Planning</option>
              <option>Proposed</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Budget (text)</label>
            <input
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Completion %</label>
            <input
              type="number"
              value={form.completion}
              onChange={(e) => update("completion", Number(e.target.value))}
              className="w-full border p-2 rounded"
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
