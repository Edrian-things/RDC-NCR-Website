import React from "react";

type Row = {
  id: number;
  name: string;
  agency: string;
  status: "Planning" | "Proposed" | "Ongoing" | "Completed";
  budget: string;
  completion: number;
  createdAt: string;
  updatedAt: string;
};

interface ProjectsPageProps {
  projects: Row[];
  onEdit: (project: Row) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  freezeMode: boolean;
  filteredProjects: Row[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  handleResetDemo: () => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onEdit,
  onDelete,
  onAdd,
  freezeMode,
  filteredProjects,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  handleResetDemo,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-800">All Projects</h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Proposed">Proposed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>

            <button
              onClick={onAdd}
              disabled={freezeMode}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                freezeMode
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Add Project
            </button>

            <button
              onClick={handleResetDemo}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Agency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Completion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {project.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{project.agency}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                <td className="px-6 py-4 text-sm text-gray-500">
                  {project.budget}
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {project.completion}%
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-3">
                  <button
                    onClick={() => onEdit(project)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
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
  );
};

export default ProjectsPage;
