// src/pages/ProjectDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { projectsData, type Project } from "../services/projectsData";

const money = (n: number) => `₱ ${n.toLocaleString()}`;

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const pid = Number(id);
    const p = projectsData.find((x) => x.id === pid) || null;
    setProject(p);
  }, [id]);

  if (!project)
    return (
      <div className="p-8">
        Project not found.{" "}
        <Link to="/projects" className="text-blue-600">
          Back to Projects
        </Link>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/projects" className="text-blue-600 mb-4 inline-block">
        ← Back to Projects
      </Link>
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-blue-900">{project.title}</h1>
        <div className="flex gap-4 items-center mt-3">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
            {project.agency}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
            {project.lgu}
          </span>
          <span className="px-3 py-1 rounded-full bg-green-50 text-sm">
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Budget</div>
            <div className="text-lg font-semibold">{money(project.budget)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Start Date</div>
            <div className="text-lg">{project.startDate}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Completion</div>
            <div className="text-lg">{project.completion ?? "—"}%</div>
          </div>
        </div>

        <div className="mt-6 text-gray-700">
          <h3 className="font-semibold mb-2">Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Documents</h3>
          <ul className="list-disc pl-5 text-blue-600">
            {project.documents?.map((d, i) => (
              <li key={i}>
                <a href={d.url || "#"} className="hover:underline">
                  {d.name}
                </a>
              </li>
            ))}
            {!project.documents?.length && (
              <>
                <li>
                  <a href="#" className="hover:underline">
                    Project Brief (PDF)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Budget Breakdown (Excel)
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
