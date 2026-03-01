import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import PortalLayout from "../../components/portal/PortalLayout";

type FormAction = "save" | "submit";
type YesNo = "Yes" | "No";
type ProjectCostRow = {
  source: string;
  y2022Prior: string;
  y2023: string;
  y2024: string;
  y2025: string;
  y2026: string;
  y2027: string;
  y2028: string;
  y2029: string;
  continuingYears: string;
  overall: string;
};
type PipBudgetRow = { year: string; osbps: string; nep: string; gaa: string };
type ProvincialRow = {
  province: string;
  y2022Prior: string;
  y2023: string;
  y2024: string;
  y2025: string;
  y2026: string;
  y2027: string;
  y2028: string;
  y2029: string;
  continuingYears: string;
  overall: string;
};

type ProfileForm = {
  projectTitle: string;
  officeUnit: string;
  programOrProject: "Program" | "Project" | "";
  isRegularProgram: YesNo;
  isSubcomponent: YesNo;
  parentProgramTitle: string;
  parentProgramPipCode: string;
  subProgram: string;
  isConvergenceProgram: YesNo;
  convergenceProgramName: string;
  convergenceRegion: string;
  convergenceProvince: string;
  convergenceLgu: string;
  basisSelections: string[];
  basisRemarkMasterplan: string;
  basisRemarkSignedAgreements: string;
  basisRemarkRegularProgram: string;
  basisRemarkOtherLaws: string;
  objective: string;
  description: string;
  implementingAgency: string;
  startYear: string;
  completionYear: string;
  spatialCoverageByCost: string;
  spatialCoverageByImpact: string;
  coverageByCostType: string;
  coverageByImpactType: string;
  costRegions: string;
  costProvinces: string;
  costLocalities: string;
  impactRegions: string;
  impactProvinces: string;
  riverBasinIncluded: YesNo;
  majorRiverBasins: string;
  principalRiverBasins: string;
  inclusionProgramming: string;
  inclusionPip: string;
  inclusionCip: string;
  inclusionTrip: string;
  inclusionArnipap: string;
  inclusionRdProgram: string;
  includedInRdip: string;
  requiresRdcEndorsement: string;
  physicalFinancialStatus: string;
  categoryStatus: string;
  implementationReadinessLevel: string;
  riskAndMitigation: string;
  papCode: string;
  updatesAsOf: string;
  fundingSourcesAndMode: string;
  fundingSources: string[];
  mainFundingSources: string[];
  implementationModes: string[];
  projectCostMatrix: string;
  pipBudgetTracker: string;
  provincialBreakdownOption: string;
  provincialBreakdown: string;
  projectCostRows: ProjectCostRow[];
  pipBudgetRows: PipBudgetRow[];
  provincialRows: ProvincialRow[];
  levelOfApproval: string;
  mainPdpChapter: string;
  mainPdpOutcome: string;
  mainPdpSubOutcome: string;
  mainPdpIndicator: string;
  pdpMuChapter: string;
  otherPdpChapters: string;
  otherPdpChaptersList: string[];
  pdpOutcomeIndicators: string;
  pdpMuOutcome: string;
  pdpMuSubOutcome: string;
  pdpMuIndicator: string;
  pdpMuOutcomeIndicators: string;
  mainInfrastructureSector: string;
  mainInfrastructureSubsector: string;
  otherInfrastructureSectors: string[];
  infrastructureSector: string;
  projectReadiness: string;
  projectReadinessItems: string[];
  expectedOutputIndicator: string;
  expectedOutputValue: string;
  expectedOutputUnit: string;
  expectedOutputs: string;
  agendaAndSdg: string;
  agendaSelections: string[];
  sdgSelections: string[];
  gadResponsiveness: string;
  gadScore: string;
  employmentGeneration: string;
  employmentTotal: string;
  employmentMale: string;
  employmentFemale: string;
  remarks: string;
  focalPerson: string;
  alternateRepresentative: string;
  contactDetails: string;
  totalProjectCost: string;
};

const initialForm: ProfileForm = {
  projectTitle: "",
  officeUnit: "",
  programOrProject: "",
  isRegularProgram: "No",
  isSubcomponent: "No",
  parentProgramTitle: "",
  parentProgramPipCode: "",
  subProgram: "",
  isConvergenceProgram: "No",
  convergenceProgramName: "",
  convergenceRegion: "",
  convergenceProvince: "",
  convergenceLgu: "",
  basisSelections: [],
  basisRemarkMasterplan: "",
  basisRemarkSignedAgreements: "",
  basisRemarkRegularProgram: "",
  basisRemarkOtherLaws: "",
  objective: "",
  description: "",
  implementingAgency: "",
  startYear: "2025",
  completionYear: "2025",
  spatialCoverageByCost: "",
  spatialCoverageByImpact: "",
  coverageByCostType: "",
  coverageByImpactType: "",
  costRegions: "",
  costProvinces: "",
  costLocalities: "",
  impactRegions: "",
  impactProvinces: "",
  riverBasinIncluded: "No",
  majorRiverBasins: "",
  principalRiverBasins: "",
  inclusionProgramming: "",
  inclusionPip: "",
  inclusionCip: "",
  inclusionTrip: "",
  inclusionArnipap: "",
  inclusionRdProgram: "",
  includedInRdip: "",
  requiresRdcEndorsement: "",
  physicalFinancialStatus: "",
  categoryStatus: "",
  implementationReadinessLevel: "",
  riskAndMitigation: "",
  papCode: "",
  updatesAsOf: "",
  fundingSourcesAndMode: "",
  fundingSources: [],
  mainFundingSources: [],
  implementationModes: [],
  projectCostMatrix: "",
  pipBudgetTracker: "",
  provincialBreakdownOption: "With breakdown (Please fill the detail per district)",
  provincialBreakdown: "",
  projectCostRows: [{ source: "", y2022Prior: "", y2023: "", y2024: "", y2025: "", y2026: "", y2027: "", y2028: "", y2029: "", continuingYears: "", overall: "" }],
  pipBudgetRows: [{ year: "2025", osbps: "", nep: "", gaa: "" }],
  provincialRows: [{ province: "", y2022Prior: "", y2023: "", y2024: "", y2025: "", y2026: "", y2027: "", y2028: "", y2029: "", continuingYears: "", overall: "" }],
  levelOfApproval: "",
  mainPdpChapter: "",
  mainPdpOutcome: "",
  mainPdpSubOutcome: "",
  mainPdpIndicator: "",
  pdpMuChapter: "",
  otherPdpChapters: "",
  otherPdpChaptersList: [],
  pdpOutcomeIndicators: "",
  pdpMuOutcome: "",
  pdpMuSubOutcome: "",
  pdpMuIndicator: "",
  pdpMuOutcomeIndicators: "",
  mainInfrastructureSector: "",
  mainInfrastructureSubsector: "",
  otherInfrastructureSectors: [],
  infrastructureSector: "",
  projectReadiness: "",
  projectReadinessItems: [],
  expectedOutputIndicator: "",
  expectedOutputValue: "",
  expectedOutputUnit: "",
  expectedOutputs: "",
  agendaAndSdg: "",
  agendaSelections: [],
  sdgSelections: [],
  gadResponsiveness: "",
  gadScore: "",
  employmentGeneration: "",
  employmentTotal: "",
  employmentMale: "",
  employmentFemale: "",
  remarks: "",
  focalPerson: "",
  alternateRepresentative: "",
  contactDetails: "",
  totalProjectCost: "",
};

const stepTitles = [
  "Basic",
  "Implementation",
  "Coverage & Status",
  "Funding",
  "PDP & Outputs",
  "Contacts & Submit",
];

const yesNoOptions = ["Yes", "No"];
const yesNoNaOptions = ["Yes", "No", "Not Applicable"];
const coverageOptions = ["Nationwide", "Interregional", "Region-specific", "Abroad"];
const provincialBreakdownOptions = [
  "With breakdown (Please fill the detail per district)",
  "No available breakdown information (Kindly skip)",
];
const approvalOptions = [
  "Will require ICC/ ED Council Approval",
  "Yet to be submitted to the NEDA Secretariat",
  "Under NEDA review",
  "ICC-TB Endorsed",
  "ICC-CC Approved",
  "NB-Confirmed",
  "Not Applicable",
];
const categoryOptions = [
  "CIP - Locally-funded major capital program/project with total project cost of at least PHP 5 billion",
  "CIP - ODA grant-assisted program/project with total project cost of at least PHP 5 billion",
  "CIP - ODA loan-assisted program/project requiring NG guarantee",
  "CIP - Solicited national PPP project",
  "CIP - Joint Venture project with government contribution of at least PHP 150 million",
  "CIP - New program/project requiring ICC approval under existing rules",
  "CIP - Ongoing unsolicited national PPP project",
  "CIP - Ongoing program/project previously approved by NB/ICC",
  "Non-CIP - Proposed/Ongoing priority PAP not requiring ICC/NB review",
];
const pipTypologyOptions = [
  "Capital Investment Program/Project",
  "Technical Assistance Program/Project",
  "Relending Program/Project of GFIs to LGUs or target beneficiaries",
  "Government Facilities",
];
const inclusionSimpleOptions = yesNoNaOptions;
const rdcEndorsementOptions = ["Endorsed", "Yet to be Endorsed", "Not Applicable"];
const gadResponsivenessOptions = [
  "GAD is invisible in the program/project",
  "Program/Project has promising GAD prospects",
  "Program/Project is gender-sensitive",
  "Program/Project is gender-responsive",
];
const mainInfrastructureSectorOptions = [
  "Social Infrastructure",
  "Power-Electrification",
  "Transportation",
  "Water Resources",
  "Information and Communication Technology",
  "Other Development Projects",
];
const infrastructureSubsectorOptions = [
  "Health",
  "Education",
  "Solid Waste Management",
  "Housing",
  "Public Safety/Security",
  "Roads and Bridges",
  "Water Transportation",
  "Air Transportation",
  "Rail Transportation",
  "Urban Transportation",
  "Irrigation",
  "Water Supply",
  "Flood Management",
  "Sanitation/Sewerage/Septage",
  "Reclamation",
  "Government Building",
  "Multipurpose Facilities",
  "Research and Development Facilities",
  "Urban Heritage Renewal",
  "No subsector",
  "Others",
];
const infrastructureSubsectorBySector: Record<string, string[]> = {
  "Social Infrastructure": ["Health", "Education", "Solid Waste Management", "Housing", "Public Safety/Security", "No subsector", "Others"],
  "Power-Electrification": ["No subsector", "Others"],
  "Transportation": ["Roads and Bridges", "Water Transportation", "Air Transportation", "Rail Transportation", "Urban Transportation", "No subsector", "Others"],
  "Water Resources": ["Irrigation", "Water Supply", "Flood Management", "Sanitation/Sewerage/Septage", "Reclamation", "No subsector", "Others"],
  "Information and Communication Technology": ["No subsector", "Others"],
  "Other Development Projects": ["Government Building", "Multipurpose Facilities", "Research and Development Facilities", "Urban Heritage Renewal", "No subsector", "Others"],
};
const expectedOutputIndicatorsBySubsector: Record<string, string[]> = {
  "Roads and Bridges": ["Length of newly constructed roads", "Length of roads rehabilitated/improved", "Length of newly constructed bridges", "Length of bridges rehabilitated/improved", "Roads and Bridges (Others)"],
  "Water Transportation": ["Number of newly constructed/rehabilitated public ports", "Ports improved to international standards", "Water Transportation (Others)"],
  "Air Transportation": ["Number of newly constructed airports", "Airports improved to international standards", "Air Transportation (Others)"],
  "Rail Transportation": ["Length of newly constructed/rehabilitated railway", "Passenger trips via rail in Metro Manila increased", "Rail Transportation (Others)"],
  "Urban Transportation": ["Length of bicycle lanes constructed", "Transport terminals constructed/rehabilitated", "Urban Transportation (Others)"],
  "Irrigation": ["Irrigation canals constructed", "Irrigation canals rehabilitated", "Irrigation canals upgraded", "Irrigation (Others)"],
  "Water Supply": ["Level I/II water system installed", "Water treatment plant constructed", "Length of water pipes installed", "Water Supply (Others)"],
  "Flood Management": ["Box culverts constructed", "Drainage lines constructed", "River bank protection structures constructed", "Flood Management (Others)"],
  "Sanitation/Sewerage/Septage": ["Sewerage system constructed", "Septage treatment plant constructed", "Sanitation/Sewerage/Septage (Others)"],
  "Reclamation": ["Reclamation area developed", "Reclamation (Others)"],
  "Health": ["Hospitals constructed/rehabilitated", "Barangay Health Stations constructed/rehabilitated", "Rural Health Units/Health Centers constructed/rehabilitated", "Health (Others)"],
  "Education": ["Schools constructed/rehabilitated", "Classrooms constructed/rehabilitated", "Academic buildings/libraries constructed/rehabilitated", "Education (Others)"],
  "Solid Waste Management": ["Sanitary landfills constructed/rehabilitated", "Materials Recovery Facilities constructed", "Other SWM facilities constructed", "Solid Waste Management (Others)"],
  "Housing": ["Socialized housing constructed/rehabilitated", "Housing units started/financed", "Housing (Others)"],
  "Public Safety/Security": ["Prison/Jail facilities constructed/rehabilitated", "Evacuation centers constructed/rehabilitated", "Public Safety/Security (Others)"],
  "Government Building": ["Government/administrative buildings for frontline services constructed/rehabilitated", "Government Building (Others)"],
  "Multipurpose Facilities": ["Gymnasium/sports facilities constructed/rehabilitated", "Multipurpose facilities completed", "Multipurpose Facilities (Others)"],
  "Research and Development Facilities": ["Research and development facilities constructed/rehabilitated", "R&D facilities equipped", "Research and Development Facilities (Others)"],
  "Urban Heritage Renewal": ["Urban heritage sites restored", "Public realm upgraded", "Urban Heritage Renewal (Others)"],
  "No subsector": ["No Indicator applicable"],
  "Others": ["No Indicator applicable"],
};
const regionOptions = [
  "NCR - National Capital Region",
  "Region I - Ilocos Region",
  "Region II - Cagayan Valley",
  "Region III - Central Luzon",
  "Region IV-A - CALABARZON",
  "MIMAROPA Region",
  "Region V - Bicol Region",
  "Region VI - Western Visayas",
  "Region VII - Central Visayas",
  "Region VIII - Eastern Visayas",
  "Region IX - Zamboanga Peninsula",
  "Region X - Northern Mindanao",
  "Region XI - Davao Region",
  "Region XII - SOCCSKSARGEN",
  "Region XIII - Caraga",
  "CAR - Cordillera Administrative Region",
  "BARMM - Bangsamoro Autonomous Region in Muslim Mindanao",
];
const ncrProvinceDistrictOptions = [
  "NCR",
  "1st District (MNL)",
  "2nd District (MANDA, MRK, PSG, QC, SJ)",
  "3rd District (CAL, MAL, NAV, VAL)",
  "4th District (LSP, MAK, MUNTI, PRQ, PSY, PAT, TAG)",
];
const ncrLguOptions = [
  "Caloocan City (CAL)",
  "Las Pinas City (LSP)",
  "Makati City (MAK)",
  "Malabon City (MAL)",
  "Mandaluyong City (MANDA)",
  "City of Manila (MNL)",
  "Marikina City (MRK)",
  "Muntinlupa City (MUNTI)",
  "Navotas City (NAV)",
  "Paranaque City (PRQ)",
  "Pasay City (PSY)",
  "Pasig City (PSG)",
  "Municipality of Pateros (PAT)",
  "Quezon City (QC)",
  "San Juan City (SJ)",
  "Taguig City (TAG)",
  "Valenzuela City (VAL)",
];
const convergenceProgramOptions = [
  "National Program on Population and Family Planning (NPPFP)",
  "Zero Hunger Program (ZHP)",
  "Agricultural Development Program (ADP)",
  "Export Development Program (EDP)",
  "Tourism Development Program (TDP)",
  "Pasig River Urban Development (PRUD)",
  "Risk Resiliency Program (RRP)",
  "Justice Sector Convergence Program (JSCP)",
  "Philippine Anti-Illegal Drug Strategy (PADS)",
  "Water Resources Program (WRP)",
  "PCB on the Sustainable Development Goals (SDGs)",
  "PCB on Livelihood and Employment",
];
const majorRiverBasinOptions = ["Pasig-Laguna Bay", "Others, pls. specify"];
const principalRiverBasinOptions = ["Marikina", "Others, pls. specify"];

const basisOptionMasterplan = "Existing masterplan/sector studies/procurement plan";
const basisOptionSignedAgreements = "Signed Agreements/International Commitments";
const basisOptionRegularProgram = "Regular program (e.g. part of PAMANA, HFEP, etc.)";
const basisOptionOtherLaws = "Other existing laws, rules, or regulations";

const basisOptions = [
  "General Appropriations Act (GAA) for FY (Present year)",
  "National Expenditure Program (NEP) for FY (Next year)",
  "Multi-Year Obligational Authority (MYOA)",
  "Multi-Year Contracting Authority (MYCA)",
  basisOptionMasterplan,
  "List of RDC-endorsed programs/projects",
  basisOptionSignedAgreements,
  basisOptionRegularProgram,
  "List of ARNIPAPs agreed during the Regional-National Investment Programming Dialogue",
  basisOptionOtherLaws,
];

const basisRemarkConfig = [
  {
    option: basisOptionMasterplan,
    field: "basisRemarkMasterplan",
    label: "Remarks: Existing masterplan/sector studies/procurement plan",
  },
  {
    option: basisOptionSignedAgreements,
    field: "basisRemarkSignedAgreements",
    label: "Remarks: Signed Agreements/International Commitments",
  },
  {
    option: basisOptionRegularProgram,
    field: "basisRemarkRegularProgram",
    label: "Remarks: Regular program (e.g. part of PAMANA, HFEP, etc.)",
  },
  {
    option: basisOptionOtherLaws,
    field: "basisRemarkOtherLaws",
    label: "Remarks: Other existing laws, rules, or regulations",
  },
] as const;

const fundingOptions = ["NG", "LGU Counterpart", "ODA Loan", "ODA Grant", "GOCC/GFIs", "Private Sector", "Others"];
const implementationModeOptions = [
  "Through local funds under RA 9184",
  "Through ODA under RA 8182",
  "Through PPP under PD 1112/1113",
  "Through PPP under Amended BOT Law",
  "Through Joint Venture Arrangement",
  "Others",
];
const pdpChapterOptions = [
  "Chapter 2 Promote Human and Social Development",
  "Chapter 2.1 Boost Health",
  "Chapter 2.2 Improve Education and Lifelong Learning",
  "Chapter 2.3 Establish Livable Communities",
  "Chapter 3 Reduce Vulnerabilities and Protect Purchasing Power",
  "Chapter 3.1 Ensure Food Security and Proper Nutrition",
  "Chapter 3.2 Strengthen Social Protection",
  "Chapter 4 Increase Income Earning Ability",
  "Chapter 5 Modernize Agriculture and Agribusiness",
  "Chapter 6 Revitalize Industry",
  "Chapter 7 Reinvigorate Services",
  "Chapter 8 Advance Research & Development, Technology, and Innovation",
  "Chapter 9 Promote Trade and Investments",
  "Chapter 10 Promote Competition and Improve Regulatory Efficiency",
  "Chapter 11.1 Promote an Inclusive, Innovative, and Healthy Financial Sector",
  "Chapter 11.2 Ensure Sound Fiscal Management and Improve the Tax Regime",
  "Chapter 12 Expand and Upgrade Infrastructure",
  "Chapter 13.1 Ensure Peace, Security, and Public Safety",
  "Chapter 13.2 Enhance Administration of Justice",
  "Chapter 14 Practice Good Governance and Improve Bureaucratic Efficiency",
  "Chapter 15 Accelerate Climate Action and Strengthen Disaster Resilience",
];
const muPdpChapterOptions = pdpChapterOptions.map((chapter) => `MU ${chapter}`);
type PdpSubOutcomeNode = { label: string; indicators: string[] };
type PdpOutcomeNode = { label: string; subOutcomes: PdpSubOutcomeNode[] };

const defaultPdpFlow: PdpOutcomeNode[] = [
  {
    label: "No chapter-specific statement configured",
    subOutcomes: [
      {
        label: "Use PDP Results Matrix (RM) reference",
        indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
      },
    ],
  },
];

const pdpFlowByChapter: Partial<Record<string, PdpOutcomeNode[]>> = {
  "Chapter 2 Promote Human and Social Development": [
    {
      label: "Human and social development promoted",
      subOutcomes: [
        {
          label: "SO2.1 Health boosted",
          indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
        },
        {
          label: "SO2.2 Education and lifelong learning improved",
          indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
        },
        {
          label: "SO2.3 Livable communities established",
          indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 2.1 Boost Health": [
    {
      label: "Health Boosted",
      subOutcomes: [
        {
          label: "SO2.1 Health service and outcomes improved",
          indicators: [
            "Average life expectancy increased (years)",
            "Maternal mortality ratio decreased",
            "Neonatal mortality rate decreased",
            "Infant mortality rate decreased",
            "Under-5 mortality rate decreased",
            "Premature mortality rate decreased",
            "Tuberculosis incidence decreased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 2.2 Improve Education and Lifelong Learning": [
    {
      label: "Learning and skills outcomes improved",
      subOutcomes: [
        {
          label: "SO2.2 Education access and quality improved",
          indicators: [
            "Enrollment rate improved",
            "Completion rate improved",
            "Learning proficiency improved",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 2.3 Establish Livable Communities": [
    {
      label: "Livable communities established",
      subOutcomes: [
        {
          label: "SO2.3A Social environment promoted",
          indicators: [
            "Number of LGUs with Local Culture and Arts Councils increased",
            "Number of LGUs with community-driven sports/recreation activities increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO2.3B Environmental quality improved",
          indicators: [
            "Proportion of barangays served by MRFs increased",
            "Proportion of cities/municipalities served by SLFs increased",
            "Percentage of plastic product footprint recovered increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO2.3C Built environment upgraded",
          indicators: [
            "Area of green spaces increased",
            "Proportion of cities that adopted the City Biodiversity Index increased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 3 Reduce Vulnerabilities and Protect Purchasing Power": [
    {
      label: "Vulnerabilities reduced and purchasing power protected",
      subOutcomes: [
        {
          label: "SO3.1 Food security and proper nutrition ensured",
          indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
        },
        {
          label: "SO3.2 Social protection strengthened",
          indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 3.1 Ensure Food Security and Proper Nutrition": [
    {
      label: "Food security and proper nutrition ensured",
      subOutcomes: [
        {
          label: "Availability, accessibility, and affordability of food improved",
          indicators: [
            "Prevalence of undernourishment reduced",
            "Stunting among children reduced",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 3.2 Strengthen Social Protection": [
    {
      label: "Social protection strengthened",
      subOutcomes: [
        {
          label: "Coverage and adequacy of social protection improved",
          indicators: [
            "Social protection coverage of vulnerable sectors increased",
            "Poverty incidence among vulnerable groups reduced",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 4 Increase Income Earning Ability": [
    {
      label: "Income-earning ability increased",
      subOutcomes: [
        {
          label: "Productive employment and quality jobs expanded",
          indicators: [
            "Employment rate improved",
            "Labor force participation improved",
            "Real wages increased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 5 Modernize Agriculture and Agribusiness": [
    {
      label: "Agriculture and agribusiness modernized",
      subOutcomes: [
        {
          label: "Productivity and value-chain competitiveness enhanced",
          indicators: [
            "Agriculture productivity increased",
            "Farmers and fishers income improved",
            "Post-harvest losses reduced",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 6 Revitalize Industry": [
    {
      label: "Industry revitalized: science, technology and innovation-driven industrialization",
      subOutcomes: [
        {
          label: "Industrial capacity and competitiveness strengthened",
          indicators: [
            "Manufacturing value-added increased",
            "Industry employment increased",
            "Number of firms adopting innovation increased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 7 Reinvigorate Services": [
    {
      label: "Services reinvigorated",
      subOutcomes: [
        {
          label: "Efficiency and quality of services improved",
          indicators: [
            "Service sector output increased",
            "Tourism receipts/arrivals increased",
            "Business process cycle time reduced",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 8 Advance Research & Development, Technology, and Innovation": [
    {
      label: "Basic research and development and knowledge creation strengthened",
      subOutcomes: [
        {
          label: "Market-driven and customer-centered research and development advanced",
          indicators: [
            "R&D spending intensity improved",
            "Research outputs and publications increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "Technology adoption, utilization, and commercialization scaled up",
          indicators: [
            "Technology transfer/commercialization cases increased",
            "Adoption of new technologies by firms/agencies increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "Innovation and entrepreneurship accelerated",
          indicators: [
            "Startup and innovation ecosystem participation increased",
            "Patents/utility models/trademarks increased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 9 Promote Trade and Investments": [
    {
      label: "Promote trade and investments in goods and services",
      subOutcomes: [
        {
          label: "Trade competitiveness and investment climate improved",
          indicators: [
            "Exports increased",
            "FDI inflows increased",
            "Number/value of investments facilitated increased",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 10 Promote Competition and Improve Regulatory Efficiency": [
    {
      label: "Consumer welfare improved",
      subOutcomes: [
        {
          label: "Market efficiency improved",
          indicators: [
            "Compliance costs reduced",
            "Processing and permitting times reduced",
            "Competition policy outcomes improved",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 11.1 Promote an Inclusive, Innovative, and Healthy Financial Sector": [
    {
      label: "Promote an Inclusive, Innovative, and Healthy Financial Sector",
      subOutcomes: [
        {
          label: "Financial inclusion and resilience strengthened",
          indicators: [
            "Access to formal financial services increased",
            "Digital financial transactions increased",
            "Financial sector stability indicators maintained",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 11.2 Ensure Sound Fiscal Management and Improve the Tax Regime": [
    {
      label: "Ensure Sound Fiscal Management and Improve the Tax Regime",
      subOutcomes: [
        {
          label: "Public resources mobilization and utilization improved",
          indicators: ["Public infrastructure spending increased (% share in GDP)", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 12 Expand and Upgrade Infrastructure": [
    {
      label: "Sustainable, resilient, integrated, and modernized infrastructure facilities and services delivered",
      subOutcomes: [
        {
          label: "SO12A Seamless and inclusive connectivity achieved",
          indicators: [
            "Travel time via land per key corridor decreased",
            "Length of newly constructed roads",
            "Length of roads rehabilitated/improved",
            "Length of newly constructed/rehabilitated railway",
            "Passengers transported via air and sea increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO12B Water security and ecological integrity attained",
          indicators: [
            "Safe water supply coverage",
            "Access to basic sanitation",
            "Zero open defecation municipalities increased",
            "Cropping intensity increased",
            "Ratio of actual irrigated area to total potential irrigable area increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO12C Planning, programming, and asset management enhanced",
          indicators: [
            "Percentage implementation of programs/projects in IRBMP",
            "Percentage of major river basins with updated IRBMP",
            "Percentage of river basins with established RBO",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
  "Chapter 13.1 Ensure Peace, Security, and Public Safety": [
    {
      label: "Peace and Security Ensured",
      subOutcomes: [
        {
          label: "Public safety and institutional capability improved",
          indicators: ["Crime incidence reduced", "Response time improved", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 13.2 Enhance Administration of Justice": [
    {
      label: "Administration of justice enhanced",
      subOutcomes: [
        {
          label: "Justice systems accessibility and efficiency improved",
          indicators: ["Case disposition rate improved", "Justice service accessibility improved", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 14 Practice Good Governance and Improve Bureaucratic Efficiency": [
    {
      label: "Practice good governance and improve bureaucratic efficiency",
      subOutcomes: [
        {
          label: "Responsive governance advanced",
          indicators: ["Citizen satisfaction improved", "Service delivery lead-time reduced", "No Indicator applicable"],
        },
      ],
    },
  ],
  "Chapter 15 Accelerate Climate Action and Strengthen Disaster Resilience": [
    {
      label: "Adaptive capacity and resilience of communities and ecosystems to climate change and natural hazards enhanced",
      subOutcomes: [
        {
          label: "SO15A Climate and disaster risk resilience of communities and institutions increased",
          indicators: [
            "Number of deaths attributed to disasters per 100,000 population decreased",
            "Number of missing persons attributed to disasters per 100,000 population decreased",
            "Number of directly affected persons attributed to disasters per 100,000 population decreased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO15B Ecosystem resilience enhanced",
          indicators: [
            "Forest cover increased",
            "Coverage of protected areas in relation to marine areas increased",
            "Employment generated from resource-based enterprises increased",
            "No Indicator applicable",
          ],
        },
        {
          label: "SO15C Low carbon economy transition enabled",
          indicators: [
            "Mitigated GHG emissions increased - Energy",
            "Mitigated GHG emissions increased - Industrial Process and Product Use",
            "Mitigated GHG emissions increased - Waste",
            "Mitigated GHG emissions increased - Transport",
            "No Indicator applicable",
          ],
        },
      ],
    },
  ],
};

const chapterOutcomeFallbacks: Partial<Record<string, string>> = {
  "Chapter 2 Promote Human and Social Development": "Human and social development promoted",
  "Chapter 3 Reduce Vulnerabilities and Protect Purchasing Power": "Vulnerabilities reduced and purchasing power protected",
  "Chapter 3.1 Ensure Food Security and Proper Nutrition": "Food security and proper nutrition ensured",
  "Chapter 3.2 Strengthen Social Protection": "Social protection strengthened",
  "Chapter 4 Increase Income Earning Ability": "Income-earning ability increased",
  "Chapter 5 Modernize Agriculture and Agribusiness": "Agriculture and agribusiness modernized",
  "Chapter 6 Revitalize Industry": "Industry revitalized",
  "Chapter 7 Reinvigorate Services": "Services reinvigorated",
  "Chapter 8 Advance Research & Development, Technology, and Innovation":
    "Basic research and development and knowledge creation strengthened",
  "Chapter 9 Promote Trade and Investments": "Trade and investments in goods and services promoted",
  "Chapter 10 Promote Competition and Improve Regulatory Efficiency": "Consumer welfare improved",
  "Chapter 11.1 Promote an Inclusive, Innovative, and Healthy Financial Sector":
    "Inclusive, innovative, and healthy financial sector promoted",
};

const getPdpFlow = (chapter: string): PdpOutcomeNode[] => {
  const exact = pdpFlowByChapter[chapter];
  if (exact) return exact;
  const fallbackLabel = chapterOutcomeFallbacks[chapter];
  if (fallbackLabel) {
    return [
      {
        label: fallbackLabel,
        subOutcomes: [
          {
            label: `${fallbackLabel} - please see PDP RM`,
            indicators: ["Please see PDP RM and specify", "No Indicator applicable"],
          },
        ],
      },
    ];
  }
  return defaultPdpFlow;
};

const readinessOptions = [
  "Pre-Feasibility Study/Business Case",
  "Feasibility Study",
  "Right-of-Way Acquisition",
  "Resettlement Action Plan",
  "Detailed Engineering Design",
  "Level of Approval",
  "Environment Compliance Certificate",
  "RDC Endorsement",
  "Other Pre-Investment Activities",
];
const agendaOptions = [
  "Protect purchasing power",
  "Reduce vulnerability and scarring",
  "Ensure sound macroeconomic fundamentals",
  "Create more jobs",
  "Create quality jobs",
  "Create green jobs",
  "Uphold public order and safety",
  "Ensure level playing field",
];
const sdgOptions = ["1-No poverty", "2-Zero hunger", "3-Good health", "4-Quality education", "5-Gender equality", "6-Clean water", "7-Clean energy", "8-Decent work", "9-Industry and infrastructure", "10-Reduced inequalities", "11-Sustainable cities", "12-Responsible consumption", "13-Climate action", "14-Life below water", "15-Life on land", "16-Peace and justice", "17-Partnerships"];

const stepRequiredFields: Record<number, Array<keyof ProfileForm>> = {
  1: ["projectTitle", "officeUnit", "programOrProject"],
  2: ["objective", "description", "implementingAgency", "startYear", "completionYear"],
  3: ["spatialCoverageByCost", "coverageByCostType", "inclusionProgramming", "physicalFinancialStatus", "riskAndMitigation", "papCode"],
  4: ["fundingSourcesAndMode", "levelOfApproval", "totalProjectCost"],
  5: ["mainPdpChapter", "mainPdpOutcome", "mainInfrastructureSector", "mainInfrastructureSubsector", "expectedOutputIndicator"],
  6: ["gadResponsiveness", "employmentTotal", "focalPerson", "alternateRepresentative", "contactDetails"],
};

const requiredForSubmit: Array<keyof ProfileForm> = [
  "projectTitle",
  "officeUnit",
  "programOrProject",
  "objective",
  "description",
  "implementingAgency",
  "startYear",
  "completionYear",
  "spatialCoverageByCost",
  "inclusionProgramming",
  "physicalFinancialStatus",
  "riskAndMitigation",
  "papCode",
  "fundingSourcesAndMode",
  "levelOfApproval",
  "mainPdpChapter",
  "mainPdpOutcome",
  "mainInfrastructureSector",
  "mainInfrastructureSubsector",
  "expectedOutputIndicator",
  "gadResponsiveness",
  "employmentTotal",
  "focalPerson",
  "alternateRepresentative",
  "contactDetails",
  "totalProjectCost",
];

const fieldLabels: Record<keyof ProfileForm, string> = {
  projectTitle: "Project Title",
  officeUnit: "MMDA Office/Unit-in-Charge",
  programOrProject: "Program or Project",
  isRegularProgram: "Is it a regular program?",
  isSubcomponent: "Is it a subcomponent of a program?",
  parentProgramTitle: "Parent Program Title",
  parentProgramPipCode: "Parent Program PIP Code",
  subProgram: "Sub Program",
  isConvergenceProgram: "Convergence Program",
  convergenceProgramName: "Convergence Program Name",
  convergenceRegion: "Convergence Region",
  convergenceProvince: "Convergence Province/District",
  convergenceLgu: "Convergence LGU",
  basisSelections: "Basis for Implementation Checklist",
  basisRemarkMasterplan: "Remarks: Existing masterplan/sector studies/procurement plan",
  basisRemarkSignedAgreements: "Remarks: Signed Agreements/International Commitments",
  basisRemarkRegularProgram: "Remarks: Regular program",
  basisRemarkOtherLaws: "Remarks: Other existing laws/rules/regulations",
  objective: "Project Objective",
  description: "Project Description",
  implementingAgency: "Implementing Agency",
  startYear: "Start Year",
  completionYear: "Completion Year",
  spatialCoverageByCost: "Spatial Coverage by Cost",
  spatialCoverageByImpact: "Spatial Coverage by Impact",
  coverageByCostType: "Coverage Type by Cost",
  coverageByImpactType: "Coverage Type by Impact",
  costRegions: "Cost Coverage Regions",
  costProvinces: "Cost Coverage Provinces",
  costLocalities: "Cost Coverage Localities",
  impactRegions: "Impact Coverage Regions",
  impactProvinces: "Impact Coverage Provinces",
  riverBasinIncluded: "River Basin Included",
  majorRiverBasins: "Major River Basins",
  principalRiverBasins: "Principal River Basins",
  inclusionProgramming: "Inclusion in Programming Documents",
  inclusionPip: "PIP",
  inclusionCip: "CIP",
  inclusionTrip: "TRIP",
  inclusionArnipap: "ARNIPAP",
  inclusionRdProgram: "Research and Development Program/Project",
  includedInRdip: "Included in RDIP",
  requiresRdcEndorsement: "Requires RDC Endorsement",
  physicalFinancialStatus: "Physical and Financial Status",
  categoryStatus: "Category",
  implementationReadinessLevel: "Implementation Readiness Level",
  riskAndMitigation: "Implementation Risk / Mitigation",
  papCode: "PAP Code",
  updatesAsOf: "Updates as of",
  fundingSourcesAndMode: "Funding Sources and Mode",
  fundingSources: "Funding Sources",
  mainFundingSources: "Main Funding Sources",
  implementationModes: "Mode of Implementation",
  projectCostMatrix: "Project Cost Matrix",
  pipBudgetTracker: "PIP-Budget Tracker",
  provincialBreakdownOption: "Provincial/District Breakdown Option",
  provincialBreakdown: "Provincial/District Breakdown",
  projectCostRows: "Project Cost Matrix Rows",
  pipBudgetRows: "PIP Budget Rows",
  provincialRows: "Provincial Breakdown Rows",
  levelOfApproval: "Level of Approval",
  mainPdpChapter: "Main PDP Chapter",
  mainPdpOutcome: "Main PDP Outcome",
  mainPdpSubOutcome: "Main PDP Sub-outcome",
  mainPdpIndicator: "Main PDP Indicator",
  pdpMuChapter: "PDP Midterm Update Chapter",
  otherPdpChapters: "Other PDP Chapters",
  otherPdpChaptersList: "Other PDP Chapters Checklist",
  pdpOutcomeIndicators: "PDP Outcome/Indicators",
  pdpMuOutcome: "PDP Midterm Update Outcome",
  pdpMuSubOutcome: "PDP Midterm Update Sub-outcome",
  pdpMuIndicator: "PDP Midterm Update Indicator",
  pdpMuOutcomeIndicators: "PDP MU Outcome/Indicators",
  mainInfrastructureSector: "Main Infrastructure Sector",
  mainInfrastructureSubsector: "Main Infrastructure Subsector",
  otherInfrastructureSectors: "Other Infrastructure Sector/Subsector",
  infrastructureSector: "Infrastructure Sector",
  projectReadiness: "Project Readiness",
  projectReadinessItems: "Project Readiness Checklist",
  expectedOutputIndicator: "Expected Output Indicator",
  expectedOutputValue: "Expected Output Value",
  expectedOutputUnit: "Expected Output Unit",
  expectedOutputs: "Expected Outputs/Deliverables",
  agendaAndSdg: "Agenda and SDG Tags",
  agendaSelections: "8-Point Agenda",
  sdgSelections: "Sustainable Development Goals",
  gadResponsiveness: "GAD Responsiveness",
  gadScore: "GAD Score",
  employmentGeneration: "Employment Generation",
  employmentTotal: "Employment Total",
  employmentMale: "Employment Male",
  employmentFemale: "Employment Female",
  remarks: "Remarks",
  focalPerson: "Focal Person",
  alternateRepresentative: "Alternative Representative",
  contactDetails: "Contact Details",
  totalProjectCost: "Total Project Cost",
};

const toNumber = (raw: string) => {
  const n = Number((raw || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const fmtNumber = (n: number) => (n > 0 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "");

const projectCostYearKeys: Array<
  "y2022Prior" | "y2023" | "y2024" | "y2025" | "y2026" | "y2027" | "y2028" | "y2029" | "continuingYears"
> = ["y2022Prior", "y2023", "y2024", "y2025", "y2026", "y2027", "y2028", "y2029", "continuingYears"];

const provincialYearKeys: Array<
  "y2022Prior" | "y2023" | "y2024" | "y2025" | "y2026" | "y2027" | "y2028" | "y2029" | "continuingYears"
> = ["y2022Prior", "y2023", "y2024", "y2025", "y2026", "y2027", "y2028", "y2029", "continuingYears"];

const fundingYearKeyToCalendarYear: Record<
  "y2022Prior" | "y2023" | "y2024" | "y2025" | "y2026" | "y2027" | "y2028" | "y2029",
  number
> = {
  y2022Prior: 2022,
  y2023: 2023,
  y2024: 2024,
  y2025: 2025,
  y2026: 2026,
  y2027: 2027,
  y2028: 2028,
  y2029: 2029,
};

const parseYear = (value: string): number | null => {
  const n = Number(String(value || "").trim());
  if (!Number.isInteger(n) || n < 1900 || n > 2200) return null;
  return n;
};

const stringifyDiffValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const normalizeDetailedDiffPath = (path: string) => {
  let next = String(path || "").trim();
  if (!next) return "";
  if (next.startsWith("profile_data.")) next = next.slice("profile_data.".length);
  if (next.startsWith("working_copy.")) next = next.slice("working_copy.".length);
  return next;
};

const normalizeProjectCostRow = (row: Record<string, unknown>): ProjectCostRow => {
  const normalized: ProjectCostRow = {
    source: String(row.source || ""),
    y2022Prior: String(row.y2022Prior || row.y2022AndPrior || ""),
    y2023: String(row.y2023 || ""),
    y2024: String(row.y2024 || ""),
    y2025: String(row.y2025 || ""),
    y2026: String(row.y2026 || ""),
    y2027: String(row.y2027 || ""),
    y2028: String(row.y2028 || ""),
    y2029: String(row.y2029 || ""),
    continuingYears: String(row.continuingYears || row.y2028Onwards || ""),
    overall: String(row.overall || row.total || ""),
  };
  const computedOverall = projectCostYearKeys.reduce((sum, key) => sum + toNumber(normalized[key]), 0);
  normalized.overall = fmtNumber(computedOverall);
  return normalized;
};

const normalizeProvincialRow = (row: Record<string, unknown>): ProvincialRow => {
  const normalized: ProvincialRow = {
    province: String(row.province || ""),
    y2022Prior: String(row.y2022Prior || row.y2022AndPrior || ""),
    y2023: String(row.y2023 || ""),
    y2024: String(row.y2024 || ""),
    y2025: String(row.y2025 || ""),
    y2026: String(row.y2026 || ""),
    y2027: String(row.y2027 || ""),
    y2028: String(row.y2028 || ""),
    y2029: String(row.y2029 || ""),
    continuingYears: String(row.continuingYears || row.y2028Onwards || ""),
    overall: String(row.overall || row.total || ""),
  };
  const computedOverall = provincialYearKeys.reduce((sum, key) => sum + toNumber(normalized[key]), 0);
  normalized.overall = fmtNumber(computedOverall);
  return normalized;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-lg font-semibold">{title}</h3>
    {children}
  </section>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, required, error }) => (
  <label className="block">
    <span className="text-sm text-gray-700">{label}{required ? " *" : ""}</span>
    {(() => {
      const isDiffHint = Boolean(error && error.startsWith("Original:"));
      return (
    <input
      className={`mt-1 w-full max-w-full box-border border rounded p-2 ${error ? (isDiffHint ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
      );
    })()}
    {error && <p className={`text-xs mt-1 ${error.startsWith("Original:") ? "text-amber-700" : "text-red-600"}`}>{error}</p>}
  </label>
);

const Area: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, rows = 3, required, error }) => (
  <label className="block">
    <span className="text-sm text-gray-700">{label}{required ? " *" : ""}</span>
    {(() => {
      const isDiffHint = Boolean(error && error.startsWith("Original:"));
      return (
    <textarea
      className={`mt-1 w-full max-w-full box-border border rounded p-2 ${error ? (isDiffHint ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : ""}`}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
      );
    })()}
    {error && <p className={`text-xs mt-1 ${error.startsWith("Original:") ? "text-amber-700" : "text-red-600"}`}>{error}</p>}
  </label>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}> = ({ label, value, onChange, options, required, error, placeholder = "Choose" }) => (
  <label className="block">
    <span className="text-sm text-gray-700">{label}{required ? " *" : ""}</span>
    {(() => {
      const isDiffHint = Boolean(error && error.startsWith("Original:"));
      return (
    <select
      className={`mt-1 w-full max-w-full box-border border rounded p-2 ${error ? (isDiffHint ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
      );
    })()}
    {error && <p className={`text-xs mt-1 ${error.startsWith("Original:") ? "text-amber-700" : "text-red-600"}`}>{error}</p>}
  </label>
);

const CheckboxGroup: React.FC<{
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}> = ({ label, options, values, onChange, error }) => (
  <div>
    <p className="text-sm text-gray-700 mb-1">{label}</p>
    <div className={`grid xl:grid-cols-2 gap-1 border rounded p-2 ${error ? (error.startsWith("Original:") ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : ""}`}>
      {options.map((option) => {
        const checked = values.includes(option);
        return (
          <label key={option} className="text-sm flex items-start gap-2 min-w-0">
            <input
              className="mt-0.5 shrink-0"
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                if (e.target.checked) onChange([...values, option]);
                else onChange(values.filter((v) => v !== option));
              }}
            />
            <span className="min-w-0 whitespace-normal break-words">{option}</span>
          </label>
        );
      })}
    </div>
    {error && <p className={`text-xs mt-1 ${error.startsWith("Original:") ? "text-amber-700" : "text-red-600"}`}>{error}</p>}
  </div>
);

const ProjectSubmission: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);

  const [user, setUser] = useState<{ username: string; role: "employee" | "validator" | "admin" } | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [canEncode, setCanEncode] = useState(true);
  const [encodeMessage, setEncodeMessage] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("planning");
  const [formReady, setFormReady] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState("");
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string>("");
  const [validatorNotes, setValidatorNotes] = useState("");
  const [diffHints, setDiffHints] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [diffCount, setDiffCount] = useState(0);
  const [diffEntries, setDiffEntries] = useState<Array<{ field: string; before: string; after: string }>>([]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(raw));
  }, [navigate]);

  const draftStorageKey = useMemo(() => {
    if (!user?.username) return "";
    return `project_submission_draft_v2_${user.username}_${id || "new"}`;
  }, [user?.username, id]);
  const isValidator = user?.role === "validator";
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";
  const isDiffMode = isAdmin && searchParams.get("mode") === "diff";

  const normalizeIncomingForm = (incomingRaw: Partial<ProfileForm>): ProfileForm => {
    const incoming = { ...initialForm, ...incomingRaw } as ProfileForm;
    if (!Array.isArray(incoming.projectCostRows) || incoming.projectCostRows.length === 0) {
      incoming.projectCostRows = initialForm.projectCostRows;
    } else {
      incoming.projectCostRows = incoming.projectCostRows.map((row: Record<string, unknown>) =>
        normalizeProjectCostRow(row),
      );
    }
    if (!Array.isArray(incoming.pipBudgetRows) || incoming.pipBudgetRows.length === 0) {
      incoming.pipBudgetRows = initialForm.pipBudgetRows;
    }
    if (!Array.isArray(incoming.provincialRows) || incoming.provincialRows.length === 0) {
      incoming.provincialRows = initialForm.provincialRows;
    } else {
      incoming.provincialRows = incoming.provincialRows.map((row: Record<string, unknown>) =>
        normalizeProvincialRow(row),
      );
    }
    if (!incoming.mainInfrastructureSector && incoming.infrastructureSector && incoming.infrastructureSector.includes(" - ")) {
      const [sector, subsector] = String(incoming.infrastructureSector).split(" - ");
      incoming.mainInfrastructureSector = sector || "";
      incoming.mainInfrastructureSubsector = subsector || "";
    }
    if (!incoming.pdpMuChapter && incoming.mainPdpChapter) {
      incoming.pdpMuChapter = `MU ${incoming.mainPdpChapter}`;
    }
    return incoming;
  };

  useEffect(() => {
    const loadEncoding = async () => {
      try {
        const state = await api.get("encoding-window/");
        setCanEncode(Boolean(state?.can_encode));
        setEncodeMessage(state?.message || "");
      } catch (error) {
        console.error("Failed to load encoding window:", error);
        setCanEncode(true);
        setEncodeMessage("");
      }
    };
    loadEncoding();
  }, []);

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
        if (data?.profile_data) {
          if (data.profile_data?.submission_type === "simplified") {
            if (isValidator) navigate(`/validator/projects/${id}/review/simplified`, { replace: true });
            else if (isAdmin) navigate(`/admin/projects/${id}/view/simplified${isDiffMode ? "?mode=diff" : ""}`, { replace: true });
            else navigate(`/employee/projects/${id}/edit/simplified`, { replace: true });
            return;
          }
          const rawProfile = data.profile_data as Record<string, unknown>;
          const validatorReview = rawProfile?.validator_review as Record<string, unknown> | undefined;
          const contributorSnapshot =
            rawProfile?.contributor_snapshot && typeof rawProfile.contributor_snapshot === "object"
              ? (rawProfile.contributor_snapshot as Record<string, unknown>)
              : (() => {
                  const { validator_review, contributor_snapshot, ...rest } = rawProfile;
                  return rest as Record<string, unknown>;
                })();
          const workingCopy =
            validatorReview &&
            typeof validatorReview === "object" &&
            validatorReview.working_copy &&
            typeof validatorReview.working_copy === "object"
              ? (validatorReview.working_copy as Record<string, unknown>)
              : contributorSnapshot;
          const sourceData = isValidator
            ? workingCopy
            : isAdmin
            ? (isDiffMode ? workingCopy : contributorSnapshot)
            : rawProfile;
          setForm(normalizeIncomingForm(sourceData));
          if (isValidator && validatorReview && typeof validatorReview === "object") {
            setValidatorNotes(String(validatorReview.review_notes || ""));
          }
          if (isAdmin && isDiffMode && validatorReview && Array.isArray(validatorReview.edited_fields)) {
            const nextHints: Partial<Record<keyof ProfileForm, string>> = {};
            let changed = 0;
            const nextEntries: Array<{ field: string; before: string; after: string }> = [];
            for (const rawItem of validatorReview.edited_fields as Array<Record<string, unknown>>) {
              const normalized = normalizeDetailedDiffPath(String(rawItem?.field || ""));
              if (!normalized) continue;
              const rootKey = normalized.split(".")[0] as keyof ProfileForm;
              if (!(rootKey in initialForm)) continue;
              changed += 1;
              nextEntries.push({
                field: normalized,
                before: stringifyDiffValue(rawItem?.before),
                after: stringifyDiffValue(rawItem?.after),
              });
              if (!nextHints[rootKey]) {
                nextHints[rootKey] = `Original: ${stringifyDiffValue(rawItem?.before) || "(empty)"}`;
              }
            }
            setDiffHints(nextHints);
            setDiffCount(changed);
            setDiffEntries(nextEntries);
          } else {
            setDiffHints({});
            setDiffCount(0);
            setDiffEntries([]);
          }
        } else {
          setForm((prev) => ({
            ...prev,
            projectTitle: data?.title || data?.name || "",
            officeUnit: data?.agency || "",
            description: data?.description || "",
            totalProjectCost: String(data?.budget || ""),
          }));
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setFormReady(true);
      }
    };
    loadExisting();
  }, [id, isEditMode, navigate, isValidator, isAdmin, isDiffMode]);

  const budget = useMemo(() => toNumber(form.totalProjectCost), [form.totalProjectCost]);
  const startYearNum = useMemo(() => parseYear(form.startYear), [form.startYear]);
  const completionYearNum = useMemo(() => parseYear(form.completionYear), [form.completionYear]);
  const fundingRange = useMemo(() => {
    if (startYearNum === null || completionYearNum === null) return null;
    return {
      minYear: Math.min(startYearNum, completionYearNum),
      maxYear: Math.max(startYearNum, completionYearNum),
    };
  }, [startYearNum, completionYearNum]);

  useEffect(() => {
    if (!isEmployee || !formReady || !draftStorageKey) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { form?: Partial<ProfileForm>; step?: number; savedAt?: string };
      if (!parsed?.form || typeof parsed.form !== "object") return;
      setForm(normalizeIncomingForm(parsed.form));
      if (parsed.step && parsed.step >= 1 && parsed.step <= stepTitles.length) {
        setStep(parsed.step);
      }
      if (parsed.savedAt) {
        setLastLocalSaveAt(parsed.savedAt);
      }
      setRestoreNotice("Recovered your unsaved local inputs from this browser.");
    } catch (error) {
      console.error("Failed to restore local draft:", error);
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
            step,
            savedAt,
          }),
        );
        setLastLocalSaveAt(savedAt);
      } catch (error) {
        console.error("Failed to autosave local draft:", error);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [isEmployee, form, step, draftStorageKey, formReady]);

  useEffect(() => {
    if (!isEmployee || !formReady || !draftStorageKey) return;
    const persistNow = () => {
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            form,
            step,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.error("Failed to persist local draft before unload:", error);
      }
    };
    window.addEventListener("beforeunload", persistNow);
    return () => window.removeEventListener("beforeunload", persistNow);
  }, [isEmployee, form, step, draftStorageKey, formReady]);

  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateProjectCostRow = (index: number, key: keyof ProjectCostRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      projectCostRows: prev.projectCostRows.map((row, i) => {
        if (i !== index) return row;
        const nextRow = { ...row, [key]: value } as ProjectCostRow;
        const computedOverall = projectCostYearKeys.reduce((sum, yearKey) => sum + toNumber(nextRow[yearKey]), 0);
        return { ...nextRow, overall: fmtNumber(computedOverall) };
      }),
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.projectCostRows;
      return next;
    });
  };

  const updatePipBudgetRow = (index: number, key: keyof PipBudgetRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      pipBudgetRows: prev.pipBudgetRows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.pipBudgetRows;
      return next;
    });
  };

  const updateProvincialRow = (index: number, key: keyof ProvincialRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      provincialRows: prev.provincialRows.map((row, i) => {
        if (i !== index) return row;
        const nextRow = { ...row, [key]: value } as ProvincialRow;
        const computedOverall = provincialYearKeys.reduce((sum, yearKey) => sum + toNumber(nextRow[yearKey]), 0);
        return { ...nextRow, overall: fmtNumber(computedOverall) };
      }),
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.provincialRows;
      return next;
    });
  };

  const hasProjectCostRow = form.projectCostRows.some((row) =>
    [row.source, row.y2022Prior, row.y2023, row.y2024, row.y2025, row.y2026, row.y2027, row.y2028, row.y2029, row.continuingYears, row.overall].some((v) => String(v).trim()),
  );
  const hasPipBudgetRow = form.pipBudgetRows.some((row) =>
    [row.year, row.osbps, row.nep, row.gaa].some((v) => String(v).trim()),
  );
  const hasProvincialRow = form.provincialRows.some((row) =>
    [row.province, row.y2022Prior, row.y2023, row.y2024, row.y2025, row.y2026, row.y2027, row.y2028, row.y2029, row.continuingYears, row.overall].some((v) => String(v).trim()),
  );
  const requiresProvincialBreakdown = form.provincialBreakdownOption !== "No available breakdown information (Kindly skip)";
  const isFundingYearEditable = (year: number) => {
    if (!fundingRange) return true;
    return year >= fundingRange.minYear && year <= fundingRange.maxYear;
  };
  const canEditContinuingYears = !fundingRange || fundingRange.maxYear > 2029;
  const pipTrackerYearOptions = useMemo(() => {
    const baseYears = ["2025", "2026", "2027", "2028", "2029"];
    if (!fundingRange) return baseYears;
    const filtered = baseYears.filter((year) => {
      const y = Number(year);
      return y >= fundingRange.minYear && y <= fundingRange.maxYear;
    });
    return filtered.length > 0 ? filtered : baseYears;
  }, [fundingRange]);

  const projectCostTotals = useMemo(() => {
    const totals = {
      y2022Prior: 0,
      y2023: 0,
      y2024: 0,
      y2025: 0,
      y2026: 0,
      y2027: 0,
      y2028: 0,
      y2029: 0,
      continuingYears: 0,
      overall: 0,
    };
    form.projectCostRows.forEach((row) => {
      projectCostYearKeys.forEach((key) => {
        totals[key] += toNumber(row[key]);
      });
    });
    totals.overall = projectCostYearKeys.reduce((sum, key) => sum + totals[key], 0);
    return totals;
  }, [form.projectCostRows]);

  const pipBudgetTotals = useMemo(() => {
    return form.pipBudgetRows.reduce(
      (acc, row) => ({
        osbps: acc.osbps + toNumber(row.osbps),
        nep: acc.nep + toNumber(row.nep),
        gaa: acc.gaa + toNumber(row.gaa),
      }),
      { osbps: 0, nep: 0, gaa: 0 },
    );
  }, [form.pipBudgetRows]);

  const provincialTotals = useMemo(() => {
    const totals = {
      y2022Prior: 0,
      y2023: 0,
      y2024: 0,
      y2025: 0,
      y2026: 0,
      y2027: 0,
      y2028: 0,
      y2029: 0,
      continuingYears: 0,
      overall: 0,
    };
    form.provincialRows.forEach((row) => {
      provincialYearKeys.forEach((key) => {
        totals[key] += toNumber(row[key]);
      });
    });
    totals.overall = provincialYearKeys.reduce((sum, key) => sum + totals[key], 0);
    return totals;
  }, [form.provincialRows]);

  useEffect(() => {
    const totalsBySource = new Map<string, number>();
    form.projectCostRows.forEach((row) => {
      const source = row.source.trim();
      if (!source) return;
      const amount = projectCostYearKeys.reduce((sum, key) => sum + toNumber(row[key]), 0);
      totalsBySource.set(source, (totalsBySource.get(source) || 0) + amount);
    });

    let nextMainSources: string[] = [];
    if (totalsBySource.size > 0) {
      const maxValue = Math.max(...Array.from(totalsBySource.values()));
      if (maxValue > 0) {
        nextMainSources = Array.from(totalsBySource.entries())
          .filter(([, value]) => value === maxValue)
          .map(([source]) => source);
      }
    }

    setForm((prev) => {
      const curr = [...prev.mainFundingSources].sort();
      const next = [...nextMainSources].sort();
      if (curr.length === next.length && curr.every((v, i) => v === next[i])) return prev;
      return { ...prev, mainFundingSources: nextMainSources };
    });
  }, [form.projectCostRows]);

  useEffect(() => {
    if (!fundingRange) return;
    const inRange = (year: number) => year >= fundingRange.minYear && year <= fundingRange.maxYear;
    setForm((prev) => {
      let changed = false;
      const nextProjectRows = prev.projectCostRows.map((row) => {
        const next = { ...row };
        (Object.entries(fundingYearKeyToCalendarYear) as Array<[keyof typeof fundingYearKeyToCalendarYear, number]>).forEach(([key, year]) => {
          if (!inRange(year) && next[key]) {
            next[key] = "";
            changed = true;
          }
        });
        if (!canEditContinuingYears && next.continuingYears) {
          next.continuingYears = "";
          changed = true;
        }
        const computedOverall = projectCostYearKeys.reduce((sum, yearKey) => sum + toNumber(next[yearKey]), 0);
        const formatted = fmtNumber(computedOverall);
        if (next.overall !== formatted) {
          next.overall = formatted;
          changed = true;
        }
        return next;
      });

      const nextProvincialRows = prev.provincialRows.map((row) => {
        const next = { ...row };
        (Object.entries(fundingYearKeyToCalendarYear) as Array<[keyof typeof fundingYearKeyToCalendarYear, number]>).forEach(([key, year]) => {
          if (!inRange(year) && next[key]) {
            next[key] = "";
            changed = true;
          }
        });
        if (!canEditContinuingYears && next.continuingYears) {
          next.continuingYears = "";
          changed = true;
        }
        const computedOverall = provincialYearKeys.reduce((sum, yearKey) => sum + toNumber(next[yearKey]), 0);
        const formatted = fmtNumber(computedOverall);
        if (next.overall !== formatted) {
          next.overall = formatted;
          changed = true;
        }
        return next;
      });

      const nextPipRows = prev.pipBudgetRows.map((row) => {
        if (!row.year || pipTrackerYearOptions.includes(row.year)) return row;
        changed = true;
        return { year: "", osbps: "", nep: "", gaa: "" };
      });

      if (!changed) return prev;
      return {
        ...prev,
        projectCostRows: nextProjectRows,
        provincialRows: nextProvincialRows,
        pipBudgetRows: nextPipRows,
      };
    });
  }, [fundingRange, canEditContinuingYears, pipTrackerYearOptions]);

  const validateCurrentStep = () => {
    const required = stepRequiredFields[step] || [];
    const errors: Partial<Record<keyof ProfileForm, string>> = {};
    required.forEach((key) => {
      if (!String(form[key] ?? "").trim()) {
        errors[key] = `${fieldLabels[key]} is required.`;
      }
    });
    if (step === 1) {
      if (form.isSubcomponent === "Yes") {
        if (!form.parentProgramTitle.trim()) errors.parentProgramTitle = `${fieldLabels.parentProgramTitle} is required when subcomponent is Yes.`;
        if (!form.parentProgramPipCode.trim()) errors.parentProgramPipCode = `${fieldLabels.parentProgramPipCode} is required when subcomponent is Yes.`;
      }
      if (form.isConvergenceProgram === "Yes") {
        if (!form.convergenceProgramName.trim()) errors.convergenceProgramName = `${fieldLabels.convergenceProgramName} is required when convergence is Yes.`;
        if (!form.convergenceRegion.trim()) errors.convergenceRegion = `${fieldLabels.convergenceRegion} is required when convergence is Yes.`;
      }
    }
    if (step === 2) {
      if (parseYear(form.startYear) === null) {
        errors.startYear = "Start Year must be a valid year (e.g., 2025).";
      }
      if (parseYear(form.completionYear) === null) {
        errors.completionYear = "Completion Year must be a valid year (e.g., 2026).";
      }
      basisRemarkConfig.forEach(({ option, field, label }) => {
        if (form.basisSelections.includes(option) && !String(form[field] || "").trim()) {
          errors[field] = `${label} is required when selected in the checklist.`;
        }
      });
    }
    if (step === 3) {
      if (form.coverageByCostType === "Interregional" || form.coverageByCostType === "Region-specific") {
        if (!form.costRegions.trim()) errors.costRegions = `${fieldLabels.costRegions} is required for selected coverage type.`;
      }
      if (form.coverageByImpactType === "Interregional" || form.coverageByImpactType === "Region-specific") {
        if (!form.impactRegions.trim()) errors.impactRegions = `${fieldLabels.impactRegions} is required for selected coverage type.`;
      }
      if (form.riverBasinIncluded === "Yes") {
        if (!form.majorRiverBasins.trim()) errors.majorRiverBasins = `${fieldLabels.majorRiverBasins} is required when River Basin is Yes.`;
        if (!form.principalRiverBasins.trim()) errors.principalRiverBasins = `${fieldLabels.principalRiverBasins} is required when River Basin is Yes.`;
      }
      if (!form.categoryStatus.trim()) errors.categoryStatus = `${fieldLabels.categoryStatus} is required.`;
      if (!form.implementationReadinessLevel.trim()) errors.implementationReadinessLevel = `${fieldLabels.implementationReadinessLevel} is required.`;
    }
    if (step === 5) {
      if (form.mainPdpOutcome !== "No Statement applicable" && !form.mainPdpSubOutcome.trim()) {
        errors.mainPdpSubOutcome = `${fieldLabels.mainPdpSubOutcome} is required unless outcome is marked No Statement applicable.`;
      }
      if (form.mainPdpSubOutcome !== "No Statement applicable" && !form.mainPdpIndicator.trim()) {
        errors.mainPdpIndicator = `${fieldLabels.mainPdpIndicator} is required unless sub-outcome is marked No Statement applicable.`;
      }
      if (!form.mainInfrastructureSector.trim()) errors.mainInfrastructureSector = `${fieldLabels.mainInfrastructureSector} is required.`;
      if (!form.mainInfrastructureSubsector.trim()) errors.mainInfrastructureSubsector = `${fieldLabels.mainInfrastructureSubsector} is required.`;
      if (!form.expectedOutputIndicator.trim()) errors.expectedOutputIndicator = `${fieldLabels.expectedOutputIndicator} is required.`;
      if (form.projectReadinessItems.length === 0) errors.projectReadinessItems = "Select at least one readiness item.";
    }
    if (step === 6) {
      const total = toNumber(form.employmentTotal);
      const male = toNumber(form.employmentMale);
      const female = toNumber(form.employmentFemale);
      if (male + female > 0 && total !== male + female) {
        errors.employmentTotal = "Employment total must match Male + Female counts.";
      }
    }
    if (step === 4) {
      if (!hasProjectCostRow) errors.projectCostRows = "Add at least one Project Cost Matrix row.";
      if (!hasPipBudgetRow) errors.pipBudgetRows = "Add at least one PIP-Budget Tracker row.";
      if (requiresProvincialBreakdown && !hasProvincialRow) errors.provincialRows = "Add at least one Provincial/District row.";
      const typedTotal = toNumber(form.totalProjectCost);
      if (projectCostTotals.overall > 0 && typedTotal > 0 && Math.abs(typedTotal - projectCostTotals.overall) > 0.5) {
        errors.totalProjectCost = "Total Project Cost must match the Project Cost Matrix total.";
      }
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onNextStep = () => {
    if (!isReadOnly) {
      validateCurrentStep();
    }
    setStep((s) => Math.min(stepTitles.length, s + 1));
  };

  const save = async (e: React.FormEvent, action: FormAction) => {
    e.preventDefault();
    if (isReadOnly) {
      alert(isAdmin ? "Admin form view is read-only." : encodeMessage || "Encoding is currently closed by admin. Submission is view-only.");
      return;
    }
    if (isValidator && !id) {
      alert("Validator review requires an existing project.");
      return;
    }
    if (!isValidator && action === "submit") {
      const missing = requiredForSubmit.filter((key) => !String(form[key] ?? "").trim());
      if (missing.length > 0) {
        const labels = missing.slice(0, 6).map((k) => fieldLabels[k]).join(", ");
        const suffix = missing.length > 6 ? ` and ${missing.length - 6} more fields` : "";
        alert(`Please complete required template fields before submit: ${labels}${suffix}.`);
        return;
      }
      const startYear = parseYear(form.startYear);
      const completionYear = parseYear(form.completionYear);
      if (startYear === null || completionYear === null) {
        alert("Start Year and Completion Year must both be valid years.");
        return;
      }
      const missingBasisRemarks = basisRemarkConfig
        .filter(({ option, field }) => form.basisSelections.includes(option) && !String(form[field] || "").trim())
        .map(({ label }) => label);
      if (missingBasisRemarks.length > 0) {
        alert(`Please add remarks for selected basis items: ${missingBasisRemarks.join(", ")}.`);
        return;
      }
      if (form.isSubcomponent === "Yes" && (!form.parentProgramTitle.trim() || !form.parentProgramPipCode.trim())) {
        alert("Parent Program Title and Parent Program PIP Code are required when subcomponent is Yes.");
        return;
      }
      if (form.isConvergenceProgram === "Yes" && (!form.convergenceProgramName.trim() || !form.convergenceRegion.trim())) {
        alert("Convergence Program Name and Region are required when convergence program is marked Yes.");
        return;
      }
      if (form.riverBasinIncluded === "Yes" && (!form.majorRiverBasins.trim() || !form.principalRiverBasins.trim())) {
        alert("Major and Principal River Basin are required when River Basin is marked Yes.");
        return;
      }
      if (form.mainPdpOutcome !== "No Statement applicable" && !form.mainPdpSubOutcome.trim()) {
        alert("PDP RM Sub-outcome is required unless Outcome is marked No Statement applicable.");
        return;
      }
      if (form.mainPdpSubOutcome !== "No Statement applicable" && !form.mainPdpIndicator.trim()) {
        alert("PDP RM Indicator is required unless Sub-outcome is marked No Statement applicable.");
        return;
      }
      if (!form.categoryStatus.trim() || !form.implementationReadinessLevel.trim()) {
        alert("Please complete Category and Implementation Readiness Level.");
        return;
      }
      if (!form.mainInfrastructureSector.trim() || !form.mainInfrastructureSubsector.trim() || !form.expectedOutputIndicator.trim() || form.projectReadinessItems.length === 0) {
        alert("Please complete infrastructure sector/subsector, expected output indicator, and at least one Project Readiness checklist item.");
        return;
      }
      const total = toNumber(form.employmentTotal);
      const male = toNumber(form.employmentMale);
      const female = toNumber(form.employmentFemale);
      if (male + female > 0 && total !== male + female) {
        alert("Employment Total must match Male + Female.");
        return;
      }
      if (budget <= 0) {
        alert("Total Project Cost must be greater than 0 before submission.");
        return;
      }
      if (projectCostTotals.overall > 0 && Math.abs(budget - projectCostTotals.overall) > 0.5) {
        alert("Total Project Cost must match the Project Cost Matrix total.");
        return;
      }
      if (!hasProjectCostRow || !hasPipBudgetRow || (requiresProvincialBreakdown && !hasProvincialRow)) {
        alert("Please complete required rows for Project Cost Matrix, PIP-Budget Tracker, and Provincial Breakdown (if applicable).");
        return;
      }
    }
    if (!isValidator && action === "save" && !form.projectTitle.trim()) {
      alert("Project Title is required to save a draft.");
      return;
    }
    setLoading(true);
    try {
      const normalizedProfileData = {
        submission_type: "detailed",
        ...form,
        otherPdpChapters:
          form.otherPdpChapters ||
          (form.otherPdpChaptersList.length ? form.otherPdpChaptersList.join(", ") : ""),
        pdpOutcomeIndicators:
          form.pdpOutcomeIndicators ||
          [form.mainPdpOutcome, form.mainPdpSubOutcome, form.mainPdpIndicator].filter(Boolean).join(" | "),
        infrastructureSector:
          [form.mainInfrastructureSector, form.mainInfrastructureSubsector].filter(Boolean).join(" - ") || form.infrastructureSector,
        projectReadiness:
          form.projectReadiness ||
          (form.projectReadinessItems.length ? form.projectReadinessItems.join(", ") : ""),
        agendaAndSdg:
          form.agendaAndSdg ||
          [
            form.agendaSelections.length ? `Agenda: ${form.agendaSelections.join(", ")}` : "",
            form.sdgSelections.length ? `SDG: ${form.sdgSelections.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        employmentGeneration:
          form.employmentGeneration ||
          `Total=${form.employmentTotal || 0}, Male=${form.employmentMale || 0}, Female=${form.employmentFemale || 0}`,
        projectCostMatrix:
          form.projectCostMatrix ||
          form.projectCostRows
            .map(
              (r) =>
                `${r.source}: 2022&prior=${r.y2022Prior}, 2023=${r.y2023}, 2024=${r.y2024}, 2025=${r.y2025}, 2026=${r.y2026}, 2027=${r.y2027}, 2028=${r.y2028}, 2029=${r.y2029}, continuing=${r.continuingYears}, total=${r.overall}`,
            )
            .join("\n"),
        pipBudgetTracker:
          form.pipBudgetTracker ||
          form.pipBudgetRows.map((r) => `${r.year}: OSBPS=${r.osbps}, NEP=${r.nep}, GAA=${r.gaa}`).join("\n"),
        provincialBreakdown:
          form.provincialBreakdown ||
          form.provincialRows
            .map(
              (r) =>
                `${r.province}: 2022&prior=${r.y2022Prior}, 2023=${r.y2023}, 2024=${r.y2024}, 2025=${r.y2025}, 2026=${r.y2026}, 2027=${r.y2027}, 2028=${r.y2028}, 2029=${r.y2029}, continuing=${r.continuingYears}, overall=${r.overall}`,
            )
            .join("\n"),
        pdpMuOutcomeIndicators:
          form.pdpMuOutcomeIndicators ||
          [form.pdpMuOutcome, form.pdpMuSubOutcome, form.pdpMuIndicator].filter(Boolean).join(" | "),
        expectedOutputs:
          form.expectedOutputs ||
          [form.expectedOutputIndicator, form.expectedOutputValue, form.expectedOutputUnit].filter(Boolean).join(" | "),
        templateName: "Project Profile 2025v1",
        uploadedFiles: files.map((f) => f.name),
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
        title: form.projectTitle,
        description: form.description || form.objective || "",
        agency: form.officeUnit,
        budget: Math.round(budget),
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
      alert(action === "save" ? "Draft saved." : "Submitted for validation.");
      navigate(isAdmin ? "/admin/projects" : "/employee/projects");
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const errorOf = (key: keyof ProfileForm) => stepErrors[key] || diffHints[key];
  const isDiffHint = (message?: string) => Boolean(message && message.startsWith("Original:"));
  const submittedLocked = isEmployee && isEditMode && projectStatus !== "planning";
  const isReadOnly = isAdmin || (isEmployee && !canEncode) || submittedLocked;
  const isProgram = form.programOrProject === "Program";
  const isProject = form.programOrProject === "Project";
  const isSubcomponent = form.isSubcomponent === "Yes";
  const hasRiverBasin = form.riverBasinIncluded === "Yes";
  const localSavedLabel = lastLocalSaveAt ? new Date(lastLocalSaveAt).toLocaleString() : "";
  const mainPdpFlow = useMemo(() => getPdpFlow(form.mainPdpChapter), [form.mainPdpChapter]);
  const mainOutcomeOptions = useMemo(() => [...mainPdpFlow.map((item) => item.label), "No Statement applicable"], [mainPdpFlow]);
  const mainSubOutcomeOptions = useMemo(() => {
    if (form.mainPdpOutcome === "No Statement applicable") return ["No Statement applicable"];
    const match = mainPdpFlow.find((item) => item.label === form.mainPdpOutcome);
    return match ? [...match.subOutcomes.map((sub) => sub.label), "No Statement applicable"] : [];
  }, [mainPdpFlow, form.mainPdpOutcome]);
  const mainIndicatorOptions = useMemo(() => {
    if (form.mainPdpSubOutcome === "No Statement applicable") return ["No Indicator applicable"];
    const outcomeMatch = mainPdpFlow.find((item) => item.label === form.mainPdpOutcome);
    const subMatch = outcomeMatch?.subOutcomes.find((sub) => sub.label === form.mainPdpSubOutcome);
    return subMatch ? [...subMatch.indicators, "No Indicator applicable"] : [];
  }, [mainPdpFlow, form.mainPdpOutcome, form.mainPdpSubOutcome]);

  const selectedMuChapter = form.pdpMuChapter.replace(/^MU\s+/, "");
  const muPdpFlow = useMemo(() => getPdpFlow(selectedMuChapter), [selectedMuChapter]);
  const muOutcomeOptions = useMemo(() => [...muPdpFlow.map((item) => item.label), "No Statement applicable"], [muPdpFlow]);
  const muSubOutcomeOptions = useMemo(() => {
    if (form.pdpMuOutcome === "No Statement applicable") return ["No Statement applicable"];
    const match = muPdpFlow.find((item) => item.label === form.pdpMuOutcome);
    return match ? [...match.subOutcomes.map((sub) => sub.label), "No Statement applicable"] : [];
  }, [muPdpFlow, form.pdpMuOutcome]);
  const muIndicatorOptions = useMemo(() => {
    if (form.pdpMuSubOutcome === "No Statement applicable") return ["No Indicator applicable"];
    const outcomeMatch = muPdpFlow.find((item) => item.label === form.pdpMuOutcome);
    const subMatch = outcomeMatch?.subOutcomes.find((sub) => sub.label === form.pdpMuSubOutcome);
    return subMatch ? [...subMatch.indicators, "No Indicator applicable"] : [];
  }, [muPdpFlow, form.pdpMuOutcome, form.pdpMuSubOutcome]);
  const mainInfraSubsectorOptions = useMemo(
    () => infrastructureSubsectorBySector[form.mainInfrastructureSector] || infrastructureSubsectorOptions,
    [form.mainInfrastructureSector],
  );
  const allSectorSubsectorOptions = useMemo(
    () =>
      mainInfrastructureSectorOptions.flatMap((sector) =>
        (infrastructureSubsectorBySector[sector] || infrastructureSubsectorOptions).map((sub) => `${sector} - ${sub}`),
      ),
    [],
  );
  const expectedOutputIndicatorOptions = useMemo(
    () => expectedOutputIndicatorsBySubsector[form.mainInfrastructureSubsector] || ["No Indicator applicable"],
    [form.mainInfrastructureSubsector],
  );

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <PortalLayout
      title={
        isValidator
          ? "Validator Detailed Review Form"
          : isAdmin
          ? "Admin Detailed Form View"
          : isEditMode
          ? "Project Submission Editor"
          : "New Project Submission"
      }
      subtitle={
        isValidator
          ? "Edit reviewer working copy without changing contributor original"
          : isAdmin
          ? isDiffMode
            ? "Read-only validator diff view with original contributor values"
            : "Read-only contributor submission view"
          : "Template-aligned project profile with strict validation"
      }
      role={user.role}
      userName={user.username}
      topActions={
        <button
          type="button"
          onClick={() => navigate(isValidator ? "/validator/projects" : isAdmin ? "/admin/projects" : "/employee/projects")}
          className="portal-btn portal-btn-ghost"
        >
          Back to Projects
        </button>
      }
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-1">Project Profile Template Form</h1>
        <p className="text-sm text-gray-600">Aligned to [TEMPLATE] Project Profile_2025v.1.pdf sections.</p>
        {!canEncode && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
            {encodeMessage || "Encoding is closed. You can review this form but cannot save or submit changes."}
          </div>
        )}
        {submittedLocked && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            This project is already submitted and is now view-only for contributors.
          </div>
        )}
        {(restoreNotice || localSavedLabel) && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm">
            {restoreNotice || "Local draft autosave is active."}
            {localSavedLabel ? ` Last local save: ${localSavedLabel}` : ""}
          </div>
        )}
        {isValidator && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-sm">
            You are editing a validator review copy. Contributor original form remains unchanged.
          </div>
        )}
        {isAdmin && (
          <div className={`mb-4 p-3 rounded-lg border text-sm ${isDiffMode ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
            {isDiffMode
              ? `Diff mode is active. Highlighted fields were edited by validator. Changed fields: ${diffCount}.`
              : "Admin read-only mode. This shows the contributor's original submitted form values."}
          </div>
        )}
        {isAdmin && isDiffMode && diffEntries.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-white">
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

        <div className="overflow-x-auto sm:overflow-visible">
          <div className="flex min-w-max sm:min-w-0 flex-nowrap sm:flex-wrap gap-2">
            {stepTitles.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setStepErrors({});
                  setStep(i + 1);
                }}
                className={`flex-none px-3 py-2 rounded text-sm whitespace-nowrap ${step === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
              >
                {i + 1}. {t}
              </button>
            ))}
          </div>
        </div>

        <div className={step === 4 ? "max-w-full min-w-0 pb-1" : "min-w-0"}>
        <form
          onSubmit={(e) => save(e, "submit")}
          className="portal-card p-3 sm:p-4 lg:p-6 space-y-8 w-full min-w-0 overflow-x-hidden"
        >
          <fieldset disabled={isReadOnly} className="space-y-8">
          {step === 1 && (
            <Section title="Program/Project Identity">
              <div className="grid xl:grid-cols-2 gap-4">
                <Field label="Project Title" value={form.projectTitle} onChange={(v) => setField("projectTitle", v)} required error={errorOf("projectTitle")} />
                <Field label="MMDA Office/Unit-in-Charge" value={form.officeUnit} onChange={(v) => setField("officeUnit", v)} required error={errorOf("officeUnit")} />
                <SelectField
                  label="Program or Project [2/4]"
                  value={form.programOrProject}
                  onChange={(v) => setField("programOrProject", v as ProfileForm["programOrProject"])}
                  options={["Program", "Project"]}
                  required
                  error={errorOf("programOrProject")}
                />
                {isProgram && (
                  <SelectField
                    label="Is it a regular program? [3]"
                    value={form.isRegularProgram}
                    onChange={(v) => setField("isRegularProgram", v as YesNo)}
                    options={yesNoOptions}
                  />
                )}
                {isProject && (
                  <SelectField
                    label="Is this a part/subcomponent/subproject of a Program? [5]"
                    value={form.isSubcomponent}
                    onChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        isSubcomponent: v as YesNo,
                        ...(v === "No"
                          ? { parentProgramTitle: "", parentProgramPipCode: "", subProgram: "" }
                          : {}),
                      }))
                    }
                    options={yesNoOptions}
                  />
                )}
                <SelectField
                  label="Is this a part of a convergence program (PCB)? [8]"
                  value={form.isConvergenceProgram}
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      isConvergenceProgram: v as YesNo,
                      ...(v === "No"
                        ? {
                            convergenceProgramName: "",
                            convergenceRegion: "",
                            convergenceProvince: "",
                            convergenceLgu: "",
                          }
                        : {}),
                    }))
                  }
                  options={yesNoOptions}
                />
                {isSubcomponent && (
                  <>
                    <Field label="Parent Program Title [6]" value={form.parentProgramTitle} onChange={(v) => setField("parentProgramTitle", v)} required error={errorOf("parentProgramTitle")} />
                    <Field label="Parent Program PIP Code" value={form.parentProgramPipCode} onChange={(v) => setField("parentProgramPipCode", v)} required error={errorOf("parentProgramPipCode")} />
                    <Field label="Sub Program [7]" value={form.subProgram} onChange={(v) => setField("subProgram", v)} />
                  </>
                )}
                {form.isConvergenceProgram === "Yes" && (
                  <>
                    <SelectField
                      label="Convergence Program (PCB)"
                      value={form.convergenceProgramName}
                      onChange={(v) => setField("convergenceProgramName", v)}
                      options={convergenceProgramOptions}
                      required
                      error={errorOf("convergenceProgramName")}
                    />
                    <SelectField
                      label="Convergence Region"
                      value={form.convergenceRegion}
                      onChange={(v) => setField("convergenceRegion", v)}
                      options={regionOptions}
                      required
                      error={errorOf("convergenceRegion")}
                    />
                    <SelectField
                      label="Convergence Province/District"
                      value={form.convergenceProvince}
                      onChange={(v) => setField("convergenceProvince", v)}
                      options={ncrProvinceDistrictOptions}
                    />
                    <SelectField
                      label="Convergence LGU"
                      value={form.convergenceLgu}
                      onChange={(v) => setField("convergenceLgu", v)}
                      options={ncrLguOptions}
                    />
                  </>
                )}
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section title="Basis, Objective, Description, Agencies, Period">
              <CheckboxGroup
                label="Basis for Implementation Checklist"
                options={basisOptions}
                values={form.basisSelections}
                onChange={(values) => setField("basisSelections", values)}
                error={errorOf("basisSelections")}
              />
              <div className="grid xl:grid-cols-2 gap-4">
                {basisRemarkConfig
                  .filter(({ option }) => form.basisSelections.includes(option))
                  .map(({ field, label }) => (
                    <Field
                      key={field}
                      label={label}
                      value={form[field]}
                      onChange={(v) => setField(field, v)}
                      required
                      error={errorOf(field)}
                    />
                  ))}
              </div>
              <Area label="Project Objective" value={form.objective} onChange={(v) => setField("objective", v)} required error={errorOf("objective")} />
              <Area label="Project Description" value={form.description} onChange={(v) => setField("description", v)} rows={4} required error={errorOf("description")} />
              <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                <Field label="Implementing Agency (Parent/Oversight/Co-Implementing)" value={form.implementingAgency} onChange={(v) => setField("implementingAgency", v)} required error={errorOf("implementingAgency")} />
                <Field label="Start Year" value={form.startYear} onChange={(v) => setField("startYear", v)} required error={errorOf("startYear")} />
                <Field label="Completion Year" value={form.completionYear} onChange={(v) => setField("completionYear", v)} required error={errorOf("completionYear")} />
              </div>
            </Section>
          )}

          {step === 3 && (
            <Section title="Coverage, Programming Inclusion, Status">
              <div className="grid xl:grid-cols-2 gap-4">
                <SelectField label="Coverage Type by Cost [13]" value={form.coverageByCostType} onChange={(v) => setField("coverageByCostType", v)} options={coverageOptions} required error={errorOf("coverageByCostType")} />
                <SelectField label="Coverage Type by Impact [14]" value={form.coverageByImpactType} onChange={(v) => setField("coverageByImpactType", v)} options={coverageOptions} />
                <SelectField label="Regions (Cost)" value={form.costRegions} onChange={(v) => setField("costRegions", v)} options={regionOptions} error={errorOf("costRegions")} />
                <Field label="Provinces (Cost)" value={form.costProvinces} onChange={(v) => setField("costProvinces", v)} />
                <Field label="Localities (Cost)" value={form.costLocalities} onChange={(v) => setField("costLocalities", v)} />
                <SelectField label="Regions (Impact)" value={form.impactRegions} onChange={(v) => setField("impactRegions", v)} options={regionOptions} error={errorOf("impactRegions")} />
                <Field label="Provinces (Impact)" value={form.impactProvinces} onChange={(v) => setField("impactProvinces", v)} />
                <SelectField label="River Basins Included? [15]" value={form.riverBasinIncluded} onChange={(v) => setField("riverBasinIncluded", v as YesNo)} options={yesNoOptions} />
                {hasRiverBasin && (
                  <>
                    <SelectField label="Major River Basins [16]" value={form.majorRiverBasins} onChange={(v) => setField("majorRiverBasins", v)} options={majorRiverBasinOptions} required error={errorOf("majorRiverBasins")} />
                    <SelectField label="Principal River Basins [17]" value={form.principalRiverBasins} onChange={(v) => setField("principalRiverBasins", v)} options={principalRiverBasinOptions} required error={errorOf("principalRiverBasins")} />
                  </>
                )}
              </div>
              <Area label="Spatial Coverage - By Cost (coverage type, regions, provinces, localities)" value={form.spatialCoverageByCost} onChange={(v) => setField("spatialCoverageByCost", v)} required error={errorOf("spatialCoverageByCost")} />
              <Area label="Spatial Coverage - By Impact (coverage, river basins)" value={form.spatialCoverageByImpact} onChange={(v) => setField("spatialCoverageByImpact", v)} />
              <div className="grid xl:grid-cols-2 gap-4">
                <SelectField label="PIP [18]" value={form.inclusionPip} onChange={(v) => setField("inclusionPip", v)} options={pipTypologyOptions} />
                <SelectField label="CIP [19]" value={form.inclusionCip} onChange={(v) => setField("inclusionCip", v)} options={inclusionSimpleOptions} />
                <SelectField label="TRIP [20]" value={form.inclusionTrip} onChange={(v) => setField("inclusionTrip", v)} options={mainInfrastructureSectorOptions} />
                <SelectField label="ARNIPAP [21]" value={form.inclusionArnipap} onChange={(v) => setField("inclusionArnipap", v)} options={inclusionSimpleOptions} />
                <SelectField label="Is R&D Program/Project?" value={form.inclusionRdProgram} onChange={(v) => setField("inclusionRdProgram", v)} options={inclusionSimpleOptions} />
                <SelectField label="Included in RDIP?" value={form.includedInRdip} onChange={(v) => setField("includedInRdip", v)} options={inclusionSimpleOptions} />
                <SelectField label="Requires RDC Endorsement?" value={form.requiresRdcEndorsement} onChange={(v) => setField("requiresRdcEndorsement", v)} options={rdcEndorsementOptions} />
              </div>
              <Area label="Inclusion in Programming Documents (PIP/CIP/TRIP/ARNIPAP/RDIP/RDC Endorsement)" value={form.inclusionProgramming} onChange={(v) => setField("inclusionProgramming", v)} required error={errorOf("inclusionProgramming")} />
              <div className="grid xl:grid-cols-2 gap-4">
                <SelectField label="Category [22/23]" value={form.categoryStatus} onChange={(v) => setField("categoryStatus", v)} options={categoryOptions} required error={errorOf("categoryStatus")} />
                <SelectField label="Implementation Readiness Level" value={form.implementationReadinessLevel} onChange={(v) => setField("implementationReadinessLevel", v)} options={["Level 1 CIP", "Level 2 CIP", "Level 3 CIP", "Level 1 Non-CIP", "Level 2 Non-CIP", "Level 3 Non-CIP"]} required error={errorOf("implementationReadinessLevel")} />
              </div>
              <Area label="Physical & Financial Status (category/readiness)" value={form.physicalFinancialStatus} onChange={(v) => setField("physicalFinancialStatus", v)} required error={errorOf("physicalFinancialStatus")} />
              <Area label="Implementation Risk and Mitigation Strategies" value={form.riskAndMitigation} onChange={(v) => setField("riskAndMitigation", v)} required error={errorOf("riskAndMitigation")} />
              <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                <Field label="PAP Code" value={form.papCode} onChange={(v) => setField("papCode", v)} required error={errorOf("papCode")} />
                <Field label="Updates as of" value={form.updatesAsOf} onChange={(v) => setField("updatesAsOf", v)} />
              </div>
            </Section>
          )}

          {step === 4 && (
            <Section title="Funding and Costing Tables">
              <div className={`rounded-xl border bg-white p-3 space-y-2 ${errorOf("fundingSources") ? (isDiffHint(errorOf("fundingSources")) ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : "border-slate-200"}`}>
                <p className="text-sm font-medium text-slate-700">Funding Sources</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {fundingOptions.map((option) => {
                    const checked = form.fundingSources.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm leading-snug break-words cursor-pointer transition-colors ${
                          checked
                            ? "border-blue-300 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          className="mt-0.5 shrink-0"
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setField("fundingSources", [...form.fundingSources, option]);
                            else setField("fundingSources", form.fundingSources.filter((v) => v !== option));
                          }}
                        />
                        <span className="min-w-0 break-words">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {errorOf("fundingSources") && <p className={`text-xs ${isDiffHint(errorOf("fundingSources")) ? "text-amber-700" : "text-red-600"}`}>{errorOf("fundingSources")}</p>}
              </div>
              <div className={`rounded border p-3 bg-slate-50 ${errorOf("mainFundingSources") ? (isDiffHint(errorOf("mainFundingSources")) ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : ""}`}>
                <p className="text-sm font-medium text-slate-700">Main Funding Sources (auto-computed)</p>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically selected from the highest total investment target in the Project Cost Matrix.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.mainFundingSources.length > 0 ? (
                    form.mainFundingSources.map((source) => (
                      <span key={source} className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium">
                        {source}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No auto-detected source yet.</span>
                  )}
                </div>
                {errorOf("mainFundingSources") && <p className={`text-xs mt-2 ${isDiffHint(errorOf("mainFundingSources")) ? "text-amber-700" : "text-red-600"}`}>{errorOf("mainFundingSources")}</p>}
              </div>
              <div className={`rounded-xl border bg-white p-3 space-y-2 ${errorOf("implementationModes") ? (isDiffHint(errorOf("implementationModes")) ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50") : "border-slate-200"}`}>
                <p className="text-sm font-medium text-slate-700">Mode of Implementation/Procurement</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {implementationModeOptions.map((option) => {
                    const checked = form.implementationModes.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm leading-snug break-words cursor-pointer transition-colors ${
                          checked
                            ? "border-blue-300 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          className="mt-0.5 shrink-0"
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setField("implementationModes", [...form.implementationModes, option]);
                            else setField("implementationModes", form.implementationModes.filter((v) => v !== option));
                          }}
                        />
                        <span className="min-w-0 break-words">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {errorOf("implementationModes") && <p className={`text-xs ${isDiffHint(errorOf("implementationModes")) ? "text-amber-700" : "text-red-600"}`}>{errorOf("implementationModes")}</p>}
              </div>
              <Area label="Funding Sources and Mode of Implementation/Procurement" value={form.fundingSourcesAndMode} onChange={(v) => setField("fundingSourcesAndMode", v)} required error={errorOf("fundingSourcesAndMode")} />
              <div className="space-y-2">
                <Field label="Total Project Cost (PHP)" value={form.totalProjectCost} onChange={(v) => setField("totalProjectCost", v)} required error={errorOf("totalProjectCost")} />
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>Matrix Total: <strong>{fmtNumber(projectCostTotals.overall) || "0"}</strong></span>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded"
                    onClick={() => setField("totalProjectCost", fmtNumber(projectCostTotals.overall))}
                    disabled={projectCostTotals.overall <= 0}
                  >
                    Use Matrix Total
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Editable funding year columns are based on Start Year and Completion Year. Current range:{" "}
                {fundingRange ? `${fundingRange.minYear} to ${fundingRange.maxYear}` : "not set"}.
              </p>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-medium">Project Cost Matrix</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        projectCostRows: [
                          ...prev.projectCostRows,
                          { source: "", y2022Prior: "", y2023: "", y2024: "", y2025: "", y2026: "", y2027: "", y2028: "", y2029: "", continuingYears: "", overall: "" },
                        ],
                      }))
                    }
                    className="px-2 py-1 text-sm border rounded"
                  >
                    + Add Row
                  </button>
                </div>
                <div className="space-y-3">
                  {form.projectCostRows.map((row, index) => (
                    <div key={`cost-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-600">Project Cost Row {index + 1}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              projectCostRows: prev.projectCostRows.length > 1 ? prev.projectCostRows.filter((_, i) => i !== index) : prev.projectCostRows,
                            }))
                          }
                          className={`text-sm ${form.projectCostRows.length > 1 ? "text-red-600 hover:underline" : "text-slate-300 cursor-not-allowed"}`}
                          disabled={form.projectCostRows.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                        <label className="block">
                          <span className="text-xs text-slate-600">Source</span>
                          <select className="mt-1 w-full border rounded px-2 py-1" value={row.source} onChange={(e) => updateProjectCostRow(index, "source", e.target.value)}>
                            <option value="">Choose source</option>
                            {fundingOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block"><span className="text-xs text-slate-600">2022 & Prior</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2022) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2022Prior} onChange={(e) => updateProjectCostRow(index, "y2022Prior", e.target.value)} disabled={!isFundingYearEditable(2022)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2023</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2023) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2023} onChange={(e) => updateProjectCostRow(index, "y2023", e.target.value)} disabled={!isFundingYearEditable(2023)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2024</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2024) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2024} onChange={(e) => updateProjectCostRow(index, "y2024", e.target.value)} disabled={!isFundingYearEditable(2024)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2025</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2025) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2025} onChange={(e) => updateProjectCostRow(index, "y2025", e.target.value)} disabled={!isFundingYearEditable(2025)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2026</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2026) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2026} onChange={(e) => updateProjectCostRow(index, "y2026", e.target.value)} disabled={!isFundingYearEditable(2026)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2027</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2027) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2027} onChange={(e) => updateProjectCostRow(index, "y2027", e.target.value)} disabled={!isFundingYearEditable(2027)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2028</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2028) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2028} onChange={(e) => updateProjectCostRow(index, "y2028", e.target.value)} disabled={!isFundingYearEditable(2028)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">2029</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2029) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2029} onChange={(e) => updateProjectCostRow(index, "y2029", e.target.value)} disabled={!isFundingYearEditable(2029)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">Continuing Years</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!canEditContinuingYears ? "bg-slate-100 text-slate-400" : ""}`} value={row.continuingYears} onChange={(e) => updateProjectCostRow(index, "continuingYears", e.target.value)} disabled={!canEditContinuingYears} /></label>
                        <label className="block"><span className="text-xs text-slate-600">Total</span><input className="mt-1 w-full border rounded px-2 py-1 bg-slate-50" value={row.overall} readOnly /></label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Project Cost Totals</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-10 gap-2 text-xs">
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2022 & Prior</span><strong>{fmtNumber(projectCostTotals.y2022Prior) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2023</span><strong>{fmtNumber(projectCostTotals.y2023) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2024</span><strong>{fmtNumber(projectCostTotals.y2024) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2025</span><strong>{fmtNumber(projectCostTotals.y2025) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2026</span><strong>{fmtNumber(projectCostTotals.y2026) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2027</span><strong>{fmtNumber(projectCostTotals.y2027) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2028</span><strong>{fmtNumber(projectCostTotals.y2028) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2029</span><strong>{fmtNumber(projectCostTotals.y2029) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">Continuing</span><strong>{fmtNumber(projectCostTotals.continuingYears) || "0"}</strong></div>
                    <div className="rounded border bg-blue-50 px-2 py-1"><span className="block text-slate-500">Overall</span><strong className="text-blue-700">{fmtNumber(projectCostTotals.overall) || "0"}</strong></div>
                  </div>
                </div>
                <Area label="Project Cost Matrix Notes (optional)" value={form.projectCostMatrix} onChange={(v) => setField("projectCostMatrix", v)} rows={3} />
                {errorOf("projectCostRows") && <p className="text-xs text-red-600">{errorOf("projectCostRows")}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-medium">PIP-Budget Tracker</h4>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, pipBudgetRows: [...prev.pipBudgetRows, { year: "", osbps: "", nep: "", gaa: "" }] }))}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    + Add Row
                  </button>
                </div>
                <div className="space-y-3">
                  {form.pipBudgetRows.map((row, index) => (
                    <div key={`pip-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-600">PIP Tracker Row {index + 1}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              pipBudgetRows: prev.pipBudgetRows.length > 1 ? prev.pipBudgetRows.filter((_, i) => i !== index) : prev.pipBudgetRows,
                            }))
                          }
                          className={`text-sm ${form.pipBudgetRows.length > 1 ? "text-red-600 hover:underline" : "text-slate-300 cursor-not-allowed"}`}
                          disabled={form.pipBudgetRows.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block">
                          <span className="text-xs text-slate-600">Year</span>
                          <select className="mt-1 w-full border rounded px-2 py-1" value={row.year} onChange={(e) => updatePipBudgetRow(index, "year", e.target.value)}>
                            <option value="">Year</option>
                            {pipTrackerYearOptions.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block"><span className="text-xs text-slate-600">OSBPS</span><input className="mt-1 w-full border rounded px-2 py-1" value={row.osbps} onChange={(e) => updatePipBudgetRow(index, "osbps", e.target.value)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">NEP</span><input className="mt-1 w-full border rounded px-2 py-1" value={row.nep} onChange={(e) => updatePipBudgetRow(index, "nep", e.target.value)} /></label>
                        <label className="block"><span className="text-xs text-slate-600">GAA</span><input className="mt-1 w-full border rounded px-2 py-1" value={row.gaa} onChange={(e) => updatePipBudgetRow(index, "gaa", e.target.value)} /></label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">PIP-Budget Totals</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">OSBPS</span><strong>{fmtNumber(pipBudgetTotals.osbps) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">NEP</span><strong>{fmtNumber(pipBudgetTotals.nep) || "0"}</strong></div>
                    <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">GAA</span><strong>{fmtNumber(pipBudgetTotals.gaa) || "0"}</strong></div>
                  </div>
                </div>
                <Area label="PIP-Budget Tracker Notes (optional)" value={form.pipBudgetTracker} onChange={(v) => setField("pipBudgetTracker", v)} rows={3} />
                {errorOf("pipBudgetRows") && <p className="text-xs text-red-600">{errorOf("pipBudgetRows")}</p>}
              </div>

              <div className="space-y-3">
                <SelectField
                  label="Provincial/District Breakdown"
                  value={form.provincialBreakdownOption}
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      provincialBreakdownOption: v,
                      ...(v === "No available breakdown information (Kindly skip)"
                        ? {
                            provincialRows: initialForm.provincialRows,
                            provincialBreakdown: "No available breakdown information.",
                          }
                        : {}),
                    }))
                  }
                  options={provincialBreakdownOptions}
                />
                {requiresProvincialBreakdown && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium">Provincial/District Breakdown</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            provincialRows: [
                              ...prev.provincialRows,
                              { province: "", y2022Prior: "", y2023: "", y2024: "", y2025: "", y2026: "", y2027: "", y2028: "", y2029: "", continuingYears: "", overall: "" },
                            ],
                          }))
                        }
                        className="px-2 py-1 text-sm border rounded"
                      >
                        + Add Row
                      </button>
                    </div>
                    <div className="space-y-3">
                      {form.provincialRows.map((row, index) => (
                        <div key={`prov-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-600">Provincial Row {index + 1}</p>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  provincialRows: prev.provincialRows.length > 1 ? prev.provincialRows.filter((_, i) => i !== index) : prev.provincialRows,
                                }))
                              }
                              className={`text-sm ${form.provincialRows.length > 1 ? "text-red-600 hover:underline" : "text-slate-300 cursor-not-allowed"}`}
                              disabled={form.provincialRows.length <= 1}
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                            <label className="block">
                              <span className="text-xs text-slate-600">Province/District</span>
                              <select className="mt-1 w-full border rounded px-2 py-1" value={row.province} onChange={(e) => updateProvincialRow(index, "province", e.target.value)}>
                                <option value="">Choose province/district</option>
                                {ncrProvinceDistrictOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </label>
                            <label className="block"><span className="text-xs text-slate-600">2022 & Prior</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2022) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2022Prior} onChange={(e) => updateProvincialRow(index, "y2022Prior", e.target.value)} disabled={!isFundingYearEditable(2022)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2023</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2023) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2023} onChange={(e) => updateProvincialRow(index, "y2023", e.target.value)} disabled={!isFundingYearEditable(2023)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2024</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2024) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2024} onChange={(e) => updateProvincialRow(index, "y2024", e.target.value)} disabled={!isFundingYearEditable(2024)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2025</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2025) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2025} onChange={(e) => updateProvincialRow(index, "y2025", e.target.value)} disabled={!isFundingYearEditable(2025)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2026</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2026) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2026} onChange={(e) => updateProvincialRow(index, "y2026", e.target.value)} disabled={!isFundingYearEditable(2026)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2027</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2027) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2027} onChange={(e) => updateProvincialRow(index, "y2027", e.target.value)} disabled={!isFundingYearEditable(2027)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2028</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2028) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2028} onChange={(e) => updateProvincialRow(index, "y2028", e.target.value)} disabled={!isFundingYearEditable(2028)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">2029</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!isFundingYearEditable(2029) ? "bg-slate-100 text-slate-400" : ""}`} value={row.y2029} onChange={(e) => updateProvincialRow(index, "y2029", e.target.value)} disabled={!isFundingYearEditable(2029)} /></label>
                            <label className="block"><span className="text-xs text-slate-600">Continuing Years</span><input className={`mt-1 w-full border rounded px-2 py-1 ${!canEditContinuingYears ? "bg-slate-100 text-slate-400" : ""}`} value={row.continuingYears} onChange={(e) => updateProvincialRow(index, "continuingYears", e.target.value)} disabled={!canEditContinuingYears} /></label>
                            <label className="block"><span className="text-xs text-slate-600">Overall</span><input className="mt-1 w-full border rounded px-2 py-1 bg-slate-50" value={row.overall} readOnly /></label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Provincial Totals</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-10 gap-2 text-xs">
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2022 & Prior</span><strong>{fmtNumber(provincialTotals.y2022Prior) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2023</span><strong>{fmtNumber(provincialTotals.y2023) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2024</span><strong>{fmtNumber(provincialTotals.y2024) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2025</span><strong>{fmtNumber(provincialTotals.y2025) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2026</span><strong>{fmtNumber(provincialTotals.y2026) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2027</span><strong>{fmtNumber(provincialTotals.y2027) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2028</span><strong>{fmtNumber(provincialTotals.y2028) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">2029</span><strong>{fmtNumber(provincialTotals.y2029) || "0"}</strong></div>
                        <div className="rounded border bg-white px-2 py-1"><span className="block text-slate-500">Continuing</span><strong>{fmtNumber(provincialTotals.continuingYears) || "0"}</strong></div>
                        <div className="rounded border bg-blue-50 px-2 py-1"><span className="block text-slate-500">Overall</span><strong className="text-blue-700">{fmtNumber(provincialTotals.overall) || "0"}</strong></div>
                      </div>
                    </div>
                    <Area label="Provincial/District Notes (optional)" value={form.provincialBreakdown} onChange={(v) => setField("provincialBreakdown", v)} rows={3} />
                    {errorOf("provincialRows") && <p className="text-xs text-red-600">{errorOf("provincialRows")}</p>}
                  </>
                )}
              </div>
              <SelectField label="Level of Approval" value={form.levelOfApproval} onChange={(v) => setField("levelOfApproval", v)} options={approvalOptions} required error={errorOf("levelOfApproval")} />
            </Section>
          )}

          {step === 5 && (
            <Section title="PDP/RM, Sector, Readiness, Outputs">
              <SelectField
                label="Main PDP Chapter"
                value={form.mainPdpChapter}
                onChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    mainPdpChapter: v,
                    pdpMuChapter: `MU ${v}`,
                    mainPdpOutcome: "",
                    mainPdpSubOutcome: "",
                    mainPdpIndicator: "",
                    pdpMuOutcome: "",
                    pdpMuSubOutcome: "",
                    pdpMuIndicator: "",
                  }));
                  setStepErrors((prev) => {
                    const next = { ...prev };
                    delete next.mainPdpChapter;
                    delete next.mainPdpOutcome;
                    delete next.mainPdpSubOutcome;
                    delete next.mainPdpIndicator;
                    return next;
                  });
                }}
                options={pdpChapterOptions}
                required
                error={errorOf("mainPdpChapter")}
              />
              <div className="grid xl:grid-cols-3 gap-4">
                <SelectField
                  label="PDP RM Outcome [33]"
                  value={form.mainPdpOutcome}
                  onChange={(v) => {
                    const noStatement = v === "No Statement applicable";
                    setForm((prev) => ({
                      ...prev,
                      mainPdpOutcome: v,
                      mainPdpSubOutcome: noStatement ? "No Statement applicable" : "",
                      mainPdpIndicator: noStatement ? "No Indicator applicable" : "",
                    }));
                    setStepErrors((prev) => {
                      const next = { ...prev };
                      delete next.mainPdpOutcome;
                      delete next.mainPdpSubOutcome;
                      delete next.mainPdpIndicator;
                      return next;
                    });
                  }}
                  options={mainOutcomeOptions}
                  required
                  error={errorOf("mainPdpOutcome")}
                />
                <SelectField
                  label="PDP RM Sub-outcome [34]"
                  value={form.mainPdpSubOutcome}
                  onChange={(v) => {
                    const noStatement = v === "No Statement applicable";
                    setForm((prev) => ({ ...prev, mainPdpSubOutcome: v, mainPdpIndicator: noStatement ? "No Indicator applicable" : "" }));
                    setStepErrors((prev) => {
                      const next = { ...prev };
                      delete next.mainPdpSubOutcome;
                      delete next.mainPdpIndicator;
                      return next;
                    });
                  }}
                  options={mainSubOutcomeOptions}
                  required
                  error={errorOf("mainPdpSubOutcome")}
                />
                <SelectField
                  label="PDP RM Indicator [35]"
                  value={form.mainPdpIndicator}
                  onChange={(v) => setField("mainPdpIndicator", v)}
                  options={mainIndicatorOptions}
                  required
                  error={errorOf("mainPdpIndicator")}
                />
              </div>
              <CheckboxGroup
                label="Other PDP Chapters [32]"
                options={pdpChapterOptions}
                values={form.otherPdpChaptersList}
                onChange={(values) => setField("otherPdpChaptersList", values)}
                error={errorOf("otherPdpChaptersList")}
              />
              <Area label="Other PDP Chapters (if any)" value={form.otherPdpChapters} onChange={(v) => setField("otherPdpChapters", v)} />
              <Area label="PDP RM Outcome/Indicator Notes (optional)" value={form.pdpOutcomeIndicators} onChange={(v) => setField("pdpOutcomeIndicators", v)} />
              <SelectField
                label="PDP Midterm Update Chapter"
                value={form.pdpMuChapter}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, pdpMuChapter: v, pdpMuOutcome: "", pdpMuSubOutcome: "", pdpMuIndicator: "" }));
                }}
                options={muPdpChapterOptions}
              />
              <div className="grid xl:grid-cols-3 gap-4">
                <SelectField
                  label="PDP MU Outcome"
                  value={form.pdpMuOutcome}
                  onChange={(v) => {
                    const noStatement = v === "No Statement applicable";
                    setForm((prev) => ({
                      ...prev,
                      pdpMuOutcome: v,
                      pdpMuSubOutcome: noStatement ? "No Statement applicable" : "",
                      pdpMuIndicator: noStatement ? "No Indicator applicable" : "",
                    }));
                  }}
                  options={muOutcomeOptions}
                />
                <SelectField
                  label="PDP MU Sub-outcome"
                  value={form.pdpMuSubOutcome}
                  onChange={(v) => {
                    const noStatement = v === "No Statement applicable";
                    setForm((prev) => ({ ...prev, pdpMuSubOutcome: v, pdpMuIndicator: noStatement ? "No Indicator applicable" : "" }));
                  }}
                  options={muSubOutcomeOptions}
                />
                <SelectField
                  label="PDP MU Indicator"
                  value={form.pdpMuIndicator}
                  onChange={(v) => setField("pdpMuIndicator", v)}
                  options={muIndicatorOptions}
                />
              </div>
              <Area label="PDP Midterm Update Outcome/Indicator Notes (optional)" value={form.pdpMuOutcomeIndicators} onChange={(v) => setField("pdpMuOutcomeIndicators", v)} />
              <div className="grid xl:grid-cols-2 gap-4">
                <SelectField
                  label="Main Infrastructure Sector [36]"
                  value={form.mainInfrastructureSector}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, mainInfrastructureSector: v, mainInfrastructureSubsector: "", expectedOutputIndicator: "" }));
                    setStepErrors((prev) => {
                      const next = { ...prev };
                      delete next.mainInfrastructureSector;
                      delete next.mainInfrastructureSubsector;
                      delete next.expectedOutputIndicator;
                      return next;
                    });
                  }}
                  options={mainInfrastructureSectorOptions}
                  required
                  error={errorOf("mainInfrastructureSector")}
                />
                <SelectField
                  label="Main Infrastructure Subsector"
                  value={form.mainInfrastructureSubsector}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, mainInfrastructureSubsector: v, expectedOutputIndicator: "" }));
                    setStepErrors((prev) => {
                      const next = { ...prev };
                      delete next.mainInfrastructureSubsector;
                      delete next.expectedOutputIndicator;
                      return next;
                    });
                  }}
                  options={mainInfraSubsectorOptions}
                  required
                  error={errorOf("mainInfrastructureSubsector")}
                />
              </div>
              <CheckboxGroup
                label="Other Infrastructure Sector/Subsector [37] (if applicable)"
                options={allSectorSubsectorOptions}
                values={form.otherInfrastructureSectors}
                onChange={(values) => setField("otherInfrastructureSectors", values)}
                error={errorOf("otherInfrastructureSectors")}
              />
              <CheckboxGroup
                label="Project Readiness Checklist [38]"
                options={readinessOptions}
                values={form.projectReadinessItems}
                onChange={(values) => setField("projectReadinessItems", values)}
                error={errorOf("projectReadinessItems")}
              />
              <Area label="Project Readiness" value={form.projectReadiness} onChange={(v) => setField("projectReadiness", v)} />
              <div className="grid xl:grid-cols-3 gap-4">
                <SelectField
                  label="Expected Output Indicator"
                  value={form.expectedOutputIndicator}
                  onChange={(v) => setField("expectedOutputIndicator", v)}
                  options={expectedOutputIndicatorOptions}
                  required
                  error={errorOf("expectedOutputIndicator")}
                />
                <Field label="Expected Output Value" value={form.expectedOutputValue} onChange={(v) => setField("expectedOutputValue", v)} />
                <Field label="Expected Output Unit" value={form.expectedOutputUnit} onChange={(v) => setField("expectedOutputUnit", v)} />
              </div>
              <Area label="Expected Outputs/Deliverables (additional notes)" value={form.expectedOutputs} onChange={(v) => setField("expectedOutputs", v)} />
            </Section>
          )}

          {step === 6 && (
            <Section title="Agenda, Employment, Contact Information">
              <CheckboxGroup
                label="8-Point Socioeconomic Agenda"
                options={agendaOptions}
                values={form.agendaSelections}
                onChange={(values) => setField("agendaSelections", values)}
                error={errorOf("agendaSelections")}
              />
              <CheckboxGroup
                label="Sustainable Development Goals"
                options={sdgOptions}
                values={form.sdgSelections}
                onChange={(values) => setField("sdgSelections", values)}
                error={errorOf("sdgSelections")}
              />
              <Area label="8-Point Agenda + SDG tags" value={form.agendaAndSdg} onChange={(v) => setField("agendaAndSdg", v)} />
              <Field label="GAD Checklist Score" value={form.gadScore} onChange={(v) => setField("gadScore", v)} />
              <SelectField
                label="GAD Responsiveness Level"
                value={form.gadResponsiveness}
                onChange={(v) => setField("gadResponsiveness", v)}
                options={gadResponsivenessOptions}
                required
                error={errorOf("gadResponsiveness")}
              />
              <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                <Field label="Employment Total" value={form.employmentTotal} onChange={(v) => setField("employmentTotal", v)} required error={errorOf("employmentTotal")} />
                <Field label="Employment Male" value={form.employmentMale} onChange={(v) => setField("employmentMale", v)} />
                <Field label="Employment Female" value={form.employmentFemale} onChange={(v) => setField("employmentFemale", v)} />
              </div>
              <Field label="Employment Generation (legacy text)" value={form.employmentGeneration} onChange={(v) => setField("employmentGeneration", v)} />
              <Area label="Remarks" value={form.remarks} onChange={(v) => setField("remarks", v)} />
              <Area label="Focal Person (name/designation/unit)" value={form.focalPerson} onChange={(v) => setField("focalPerson", v)} required error={errorOf("focalPerson")} />
              <Area label="Alternative Representative (name/designation/unit)" value={form.alternateRepresentative} onChange={(v) => setField("alternateRepresentative", v)} required error={errorOf("alternateRepresentative")} />
              <Area label="Contact Details (address/contact/email)" value={form.contactDetails} onChange={(v) => setField("contactDetails", v)} required error={errorOf("contactDetails")} />
              <label className="block">
                <span className="text-sm text-gray-700">Attachments</span>
                <input className="mt-1 block" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              </label>
              {files.length > 0 && (
                <ul className="text-sm text-gray-600">
                  {files.map((f) => <li key={f.name}>{f.name}</li>)}
                </ul>
              )}
            </Section>
          )}

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

          <div className="pt-4 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => { setStepErrors({}); setStep((s) => Math.max(1, s - 1)); }} className="px-4 py-2 border rounded-lg">
              Previous
            </button>
            <div className="flex flex-wrap gap-3">
              {!isAdmin && (
                <button type="button" onClick={(e) => save(e as unknown as React.FormEvent, "save")} className="px-4 py-2 border rounded-lg" disabled={loading || isReadOnly}>
                  {loading ? "Saving..." : isValidator ? "Save as Reviewed" : "Save Draft"}
                </button>
              )}
              {step < stepTitles.length ? (
                <button type="button" onClick={onNextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Next
                </button>
              ) : (
                !isAdmin && (
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg" disabled={loading || isReadOnly}>
                    {loading ? "Submitting..." : isValidator ? "Validated" : "Submit for Validation"}
                  </button>
                )
              )}
            </div>
          </div>
          </fieldset>
        </form>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ProjectSubmission;
