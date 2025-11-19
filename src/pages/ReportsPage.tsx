import React, { useMemo } from "react";

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

interface ReportsPageProps {
  projects: Row[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ projects }) => {
  const stats = useMemo(() => {
    const total = projects.length;
    const totalBudget = projects.reduce((sum, p) => {
      const budget = parseInt(p.budget.replace(/[₱,\s]/g, ""));
      return sum + budget;
    }, 0);
    const byStatus = {
      planning: projects.filter((p) => p.status === "Planning").length,
      proposed: projects.filter((p) => p.status === "Proposed").length,
      ongoing: projects.filter((p) => p.status === "Ongoing").length,
      completed: projects.filter((p) => p.status === "Completed").length,
    };
    const avgCompletion =
      total > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.completion, 0) / total)
        : 0;

    return {
      total,
      totalBudget,
      byStatus,
      avgCompletion,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Projects</h3>
          <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Budget</h3>
          <p className="text-2xl font-bold mt-2">
            ₱{stats.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Completion</h3>
          <p className="text-4xl font-bold mt-2">{stats.avgCompletion}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Completed</h3>
          <p className="text-4xl font-bold mt-2">{stats.byStatus.completed}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Projects by Status
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Planning",
                value: stats.byStatus.planning,
                color: "blue",
              },
              {
                label: "Proposed",
                value: stats.byStatus.proposed,
                color: "purple",
              },
              {
                label: "Ongoing",
                value: stats.byStatus.ongoing,
                color: "yellow",
              },
              {
                label: "Completed",
                value: stats.byStatus.completed,
                color: "green",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${item.color}-500`}
                      style={{
                        width: `${
                          stats.total > 0 ? (item.value / stats.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-8">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Budget Distribution by Status
          </h3>
          <div className="space-y-3">
            {[
              { label: "Planning", status: "Planning", color: "blue" },
              { label: "Proposed", status: "Proposed", color: "purple" },
              { label: "Ongoing", status: "Ongoing", color: "yellow" },
              { label: "Completed", status: "Completed", color: "green" },
            ].map((item) => {
              const statusProjects = projects.filter(
                (p) => p.status === item.status
              );
              const statusBudget = statusProjects.reduce((sum, p) => {
                const budget = parseInt(p.budget.replace(/[₱,\s]/g, ""));
                return sum + budget;
              }, 0);

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${item.color}-500`}
                        style={{
                          width: `${
                            stats.totalBudget > 0
                              ? (statusBudget / stats.totalBudget) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-20">
                      ₱{statusBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Projects Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Top Projects by Budget
          </h3>
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
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects
                .sort((a, b) => {
                  const budgetA = parseInt(a.budget.replace(/[₱,\s]/g, ""));
                  const budgetB = parseInt(b.budget.replace(/[₱,\s]/g, ""));
                  return budgetB - budgetA;
                })
                .slice(0, 5)
                .map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {project.agency}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.budget}
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
