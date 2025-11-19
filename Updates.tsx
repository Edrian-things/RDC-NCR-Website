// src/pages/Updates.tsx
import React from "react";

const Updates: React.FC = () => {
  const updates = [
    { date: "2025-08-01", msg: "Added new reporting module" },
    { date: "2025-07-10", msg: "Security updates and minor bug fixes" },
  ];
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">System Updates</h1>
      <div className="space-y-3">
        {updates.map((u, i) => (
          <div key={i} className="bg-white rounded p-4 shadow">
            <div className="text-sm text-gray-500">{u.date}</div>
            <div className="mt-1">{u.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;
