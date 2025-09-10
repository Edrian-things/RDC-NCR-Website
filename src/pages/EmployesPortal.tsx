// src/pages/EmployesPortal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm, { type ProjectPayload } from "../components/ProjectForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { projectsData } from "../services/projectsData";

/* internal row type */
type Row = {
  id: number;
  name: string;
  agency: string;
  status: "Planning" | "Proposed" | "Ongoing" | "Completed";
  budget: string;
  completion: number;
};

const initialProjects: Row[] = projectsData.map((p) => ({
  id: p.id,
  name: p.title,
  agency: p.agency || "Unknown",
  status: (p.status === "completed"
    ? "Completed"
    : p.status === "ongoing"
    ? "Ongoing"
    : p.status === "proposed"
    ? "Proposed"
    : "Planning") as any,
  budget: `₱ ${(p.budget || 0).toLocaleString()}`,
  completion: p.completion ?? 0,
}));

const STORAGE_KEY = "rdc_freeze_mode_v1";

const PIPManagementSystem: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [projects, setProjects] = useState<Row[]>(initialProjects);
  const [freezeMode, setFreezeMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  const navigate = useNavigate();

  // modals
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freezeMode));
    } catch {}
  }, [freezeMode]);

  const onAddClick = () => {
    if (freezeMode)
      return alert("Project submissions are currently frozen by Admin.");
    setEditing(null);
    setShowForm(true);
  };

  const onEditClick = (r: Row) => {
    if (freezeMode) return alert("System is frozen. Editing is restricted.");
    setEditing(r);
    setShowForm(true);
  };

  const onDeleteClick = (id: number) => {
    if (freezeMode) return alert("System is frozen. Deletion is restricted.");
    setToDeleteId(id);
    setShowConfirm(true);
  };

  const handleSave = (payload: ProjectPayload) => {
    if (payload.id) {
      setProjects((old) =>
        old.map((p) =>
          p.id === payload.id
            ? {
                ...p,
                name: payload.name,
                agency: payload.agency,
                status: payload.status,
                budget: payload.budget,
                completion: payload.completion,
              }
            : p
        )
      );
    } else {
      const newId = projects.length
        ? Math.max(...projects.map((p) => p.id)) + 1
        : 1;
      setProjects((old) => [
        {
          id: newId,
          name: payload.name,
          agency: payload.agency,
          status: payload.status,
          budget: payload.budget,
          completion: payload.completion,
        },
        ...old,
      ]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (toDeleteId == null) {
      setShowConfirm(false);
      return;
    }
    setProjects((old) => old.filter((p) => p.id !== toDeleteId));
    setToDeleteId(null);
    setShowConfirm(false);
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">PPG_PPDX_v3</h1>
          <p className="text-sm text-blue-200">Public Investment Program</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "dashboard"
                    ? "bg-blue-700"
                    : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveSection("dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "projects"
                    ? "bg-blue-700"
                    : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveSection("projects")}
              >
                Projects
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "reports"
                    ? "bg-blue-700"
                    : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveSection("reports")}
              >
                Reports
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "directory"
                    ? "bg-blue-700"
                    : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveSection("directory")}
              >
                Directory
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSection === "updates"
                    ? "bg-blue-700"
                    : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveSection("updates")}
              >
                System Updates
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-700 mt-4">
          <p className="text-sm text-blue-200">Last updated: Dec 15, 2024</p>
          <p className="text-sm text-blue-200 mt-2">Version: 3.2.1</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Public Investment Program Management System
            </h2>
            <p className="text-sm text-gray-600">
              Monitoring and management of government investment programs
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Freeze Submissions
                </span>
                <button
                  onClick={() => setFreezeMode((v) => !v)}
                  className={`px-3 py-1 rounded ${
                    freezeMode
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {freezeMode ? "ON" : "OFF"}
                </button>
              </div>

              {/* ✅ Logout Button */}
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {freezeMode && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4">
            Notice: Project submissions are currently frozen by Admin.
          </div>
        )}

        {/* 👇 your entire dashboard/projects/reports content stays here */}
        <main className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Total Projects
              </h3>
              <p className="text-3xl font-bold text-blue-800">
                {projects.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Total Budget
              </h3>
              <p className="text-3xl font-bold text-green-700">₱ — (mock)</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Ongoing Projects
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {projects.filter((p) => p.status === "Ongoing").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Completed Projects
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {projects.filter((p) => p.status === "Completed").length}
              </p>
            </div>
          </div>

          {/* Recent Projects Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                Recent Projects
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={onAddClick}
                  disabled={freezeMode}
                  className={`px-4 py-2 rounded text-white ${
                    freezeMode
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Add New Project
                </button>
                <button
                  onClick={() => {
                    setProjects(initialProjects);
                    alert("Reset demo projects");
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Reset Demo
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.agency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Ongoing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              project.completion === 100
                                ? "bg-green-600"
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${project.completion}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.completion}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => onEditClick(project)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteClick(project.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer content */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              WELCOME TO PUBLIC INVESTMENT PROGRAM (PIP/PPDX_v3) SYSTEM
            </h3>
            <p className="text-gray-700 mb-4">
              The PIP Portal (PPDX) System is a web-based project database
              system that facilitates the delivery of PIP and submission of
              updates from agency PIP focal persons...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Directory of NEDA PIP Focal Persons
              </h3>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Click here
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Updating of the PIP 2023-2025 ...
              </h3>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Click here
              </button>
            </div>
          </div>

          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              © 2025 by Information and Communications Technology Staff, ICTS
            </p>
          </footer>
        </main>
      </div>

      {/* Modals */}
      {showForm && (
        <ProjectForm
          initial={editing ?? undefined}
          onSave={(p) => handleSave(p as any)}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {showConfirm && (
        <ConfirmDialog
          message="Are you sure you want to delete this project?"
          onCancel={() => {
            setShowConfirm(false);
            setToDeleteId(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default PIPManagementSystem;
