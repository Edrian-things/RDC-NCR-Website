// src/services/projectsData.ts
export type ProjectStatus = "ongoing" | "completed" | "proposed" | "planning";
export type LGU =
  | "Manila" | "Quezon City" | "Makati" | "Taguig" | "Pasig"
  | "Mandaluyong" | "San Juan" | "Caloocan" | "Valenzuela" | "Malabon"
  | "Navotas" | "Pasay" | "Parañaque" | "Las Piñas" | "Muntinlupa"
  | "Marikina" | "Pateros";

export interface Project {
  id: number;
  title: string;
  status: ProjectStatus;
  lgu: LGU;
  agency?: string;
  budget: number; // in PHP (integer)
  startDate: string;
  endDate?: string;
  completion?: number; // 0-100
  description: string;
  documents?: { name: string; url?: string }[];
}

export const projectsData: Project[] = [
  {
    id: 1,
    title: "Manila Bay Rehabilitation",
    status: "ongoing",
    lgu: "Manila",
    agency: "MMDA",
    budget: 2500000000,
    startDate: "2024-01-15",
    completion: 65,
    description: "Coastal cleanup and rehabilitation of Manila Bay waters.",
    documents: [{ name: "Project Brief (PDF)" }, { name: "Budget Breakdown (XLSX)" }],
  },
  {
    id: 2,
    title: "Quezon City Central Park",
    status: "completed",
    lgu: "Quezon City",
    agency: "CityGov QC",
    budget: 1200000000,
    startDate: "2023-06-10",
    endDate: "2024-08-20",
    completion: 100,
    description: "Development of a new central park with recreational facilities.",
    documents: [{ name: "Environmental Assessment (PDF)" }],
  },
  {
    id: 3,
    title: "Pasig River Ferry Expansion",
    status: "proposed",
    lgu: "Pasig",
    agency: "DOTr",
    budget: 850000000,
    startDate: "2025-03-01",
    description: "Expansion of ferry service along Pasig River with new stations.",
  },
  {
    id: 4,
    title: "Makati Financial District Road Widening",
    status: "ongoing",
    lgu: "Makati",
    agency: "DPWH",
    budget: 1800000000,
    startDate: "2024-03-22",
    completion: 40,
    description: "Road widening and infrastructure improvement in Makati CBD.",
  },
  {
    id: 5,
    title: "Taguig City Hospital Construction",
    status: "completed",
    lgu: "Taguig",
    agency: "DOH",
    budget: 3200000000,
    startDate: "2022-11-05",
    endDate: "2024-07-30",
    completion: 100,
    description: "Construction of a new tertiary hospital with 500-bed capacity.",
  },
  {
    id: 6,
    title: "Mandaluyong Bypass Road",
    status: "proposed",
    lgu: "Mandaluyong",
    agency: "DPWH",
    budget: 2100000000,
    startDate: "2025-06-01",
    description: "Construction of a bypass to ease traffic congestion.",
  },
  // add more sample projects if you want
];
