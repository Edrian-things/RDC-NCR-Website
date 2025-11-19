// src/pages/Directory.tsx
import React from "react";

const Directory: React.FC = () => {
  const contacts = [
    { agency: "DPWH", name: "Engr. Juan Dela Cruz", email: "juan@dpwh.gov.ph" },
    { agency: "DOH", name: "Dr. Maria Santos", email: "maria@doh.gov.ph" },
    { agency: "DICT", name: "Engr. Alan Reyes", email: "alan@dict.gov.ph" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Directory</h1>
      <div className="bg-white rounded shadow p-4">
        <table className="min-w-full">
          <thead className="text-left text-sm text-gray-500">
            <tr>
              <th className="p-2">Agency</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={i}>
                <td className="p-2">{c.agency}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Directory;
