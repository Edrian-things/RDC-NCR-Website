import React, { useMemo, useState } from "react";

type LGU = {
  name: string;
  url?: string;
  note?: string;
};

const LGUS: LGU[] = [
  { name: "Manila", url: "https://manila.gov.ph/" },
  { name: "Makati", url: "https://www.makati.gov.ph/" },
  { name: "Quezon City", url: "https://quezoncity.gov.ph/" },
  { name: "Caloocan", url: "https://caloocancity.gov.ph/" },
  { name: "Pasig", url: "https://www.pasigcity.gov.ph/" },
  { name: "Taguig", url: "https://www.taguig.gov.ph/" },
  { name: "Pasay", url: "https://www.pasay.gov.ph/" },
  { name: "Parañaque", url: "https://paranaquecity.gov.ph/" },
  { name: "Las Piñas", url: "https://laspinascity.gov.ph/" },
  { name: "Mandaluyong", url: "https://mandaluyong.gov.ph/" },
  { name: "Marikina", url: "https://marikina.gov.ph/" },
  { name: "Muntinlupa", url: "https://www.muntinlupacity.gov.ph/" },
  { name: "Navotas", url: "https://navotas.gov.ph/" },
  { name: "San Juan", url: "https://www.sanjuancity.gov.ph/" },
  { name: "Valenzuela", url: "https://www.valenzuela.gov.ph/" },
  { name: "Malabon", url: "https://www.malabon.gov.ph/" },
  { name: "Pateros", url: "https://www.pateros.gov.ph/" },
];

const statCards = [
  {
    label: "Population (est.)",
    value: "≈ 13.5M",
    accent: "from-green-400 to-teal-500",
  },
  {
    label: "Land Area",
    value: "619.57 km²",
    accent: "from-blue-400 to-indigo-500",
  },
  {
    label: "Cities + Municipality",
    value: "16 + 1",
    accent: "from-amber-400 to-orange-500",
  },
  { label: "GDP Share", value: "≈ 30%+", accent: "from-pink-400 to-rose-500" },
];

function copy(text: string) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {
    // fallback
    // eslint-disable-next-line no-alert
    alert(text);
  });
}

export default function RegionalProfile(): JSX.Element {
  const [q, setQ] = useState("");
  const [selectedLGU, setSelectedLGU] = useState<LGU | null>(null);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return LGUS;
    return LGUS.filter((l) => l.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 font-sans">
      {/* HERO - high contrast, big typography, visible stat cards */}
      <header className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-visible">
          <div
            className="rounded-2xl shadow-lg overflow-hidden"
            aria-hidden="false"
          >
            <div
              className="h-56 sm:h-64 md:h-80 lg:h-96 bg-cover bg-center flex items-end"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(3,56,148,0.85), rgba(2,6,23,0.25)), url('https://images.unsplash.com/photo-1532581140116-9e7b8a7a2a1a?q=80&w=2000&auto=format&fit=crop')",
              }}
              role="img"
              aria-label="Regional Capitol banner"
            >
              <div className="w-full p-6 sm:p-8 lg:p-12">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src="/assets/logo-rdc.png"
                      alt="RDC Logo"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-white p-2 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="text-white">
                    <div className="inline-flex items-center gap-3 bg-white/10 px-3 py-1 rounded-full text-sm mb-3">
                      <svg
                        className="w-5 h-5 opacity-90"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 7h18M3 11h18M3 15h18"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Regional Profile • National Capital Region
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                      National Capital Region Report
                      <span className="block">— Profile</span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            {/* STAT CARDS (overlap hero for prominence) */}
            <div className="relative -mt-12 z-20">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {statCards.map((s, i) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-xl shadow-xl p-5 flex flex-col items-start gap-2 transform hover:-translate-y-1 transition"
                    >
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {s.label}
                      </div>
                      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-sky-800">
                        {s.value}
                      </div>
                      <div className="text-xs text-slate-400">
                        Key regional indicator
                      </div>
                      <div
                        className="mt-3 w-full h-1 rounded-full"
                        style={{
                          background:
                            i % 2 === 0
                              ? "linear-gradient(90deg,#06b6d4,#3b82f6)"
                              : "linear-gradient(90deg,#34d399,#06b6d4)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="h-6" />{" "}
      {/* spacer so main content doesn't sit under overlap */}
      {/* CONTENT */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Map + Highlights */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Regional Snapshot
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-3xl">
                    The region serves as a major center of commerce, governance
                    and culture. Below are socio-economic highlights and visual
                    references.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
                  <div>Updated: 2024</div>
                  <div>Source: RDC / PSA / Local Gov</div>
                </div>
              </div>

              {/* Map + quick action */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                  {/* lightweight responsive map image — replace with interactive map if needed */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Political_map_of_Metro_Manila.svg/1200px-Political_map_of_Metro_Manila.svg.png"
                    alt="Regional map"
                    className="w-full h-64 md:h-80 object-contain bg-white"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-xs text-slate-500">
                      Population (2020)
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-800">
                      ~13,484,462
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Urban density and growth trends indicate continued demand
                      for transit and housing.
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">
                        Development Focus
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        Infrastructure • Resilience • Mobility
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        window.open("https://rdu.gov.ph", "_blank")
                      }
                      className="ml-4 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlights list */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Transport & Infrastructure
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Extensive road networks, urban transit (LRT/MRT), major
                    ports and airports. Priorities include easing congestion and
                    improving last-mile connectivity.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Economic Profile
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    NCR contributes significant GDP share with a concentration
                    of services, finance and industry. Investment in resilient
                    infrastructure remains critical.
                  </p>
                </div>
              </div>
            </div>

            {/* Socio-Economic Details — collapsible */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-lg font-semibold mb-3">
                Socio‑Economic Highlights
              </h3>

              <details className="group border-b last:border-b-0 pb-3 mb-3 open:pb-4">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-medium">Demographics</span>
                  <span className="text-sm text-slate-500 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="mt-3 text-sm text-slate-600">
                  Population concentrated in urban centers, with diverse age and
                  occupational structures. Continued migration and urbanization
                  shape housing and service demands.
                </div>
              </details>

              <details className="group border-b last:border-b-0 pb-3 mb-3">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-medium">Economy & Employment</span>
                  <span className="text-sm text-slate-500">▾</span>
                </summary>
                <div className="mt-3 text-sm text-slate-600">
                  Dominated by services, trade, finance and manufacturing.
                  Employment programs and investment promotion aim to boost
                  inclusive growth.
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-medium">Environment & Resilience</span>
                  <span className="text-sm text-slate-500">▾</span>
                </summary>
                <div className="mt-3 text-sm text-slate-600">
                  Flood management, green spaces and disaster risk reduction are
                  key regional initiatives to protect livelihoods and critical
                  infrastructure.
                </div>
              </details>
            </div>
          </section>

          {/* Right column: LGU directory + actions */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4 sticky top-24">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold">Cities & Municipality</h3>
                <div className="text-xs text-slate-500">
                  {LGUS.length} entries
                </div>
              </div>

              <div className="mt-3">
                <label className="sr-only" htmlFor="lgu-search">
                  Search LGU
                </label>
                <input
                  id="lgu-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search LGU name..."
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {results.slice(0, 8).map((l) => (
                  <button
                    key={l.name}
                    onClick={() => {
                      setSelectedLGU(l);
                      l.url && window.open(l.url, "_blank");
                    }}
                    className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm flex items-center gap-2"
                  >
                    <div className="flex-1 truncate">{l.name}</div>
                    <div className="text-xs text-slate-400">open ↗</div>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    copy(LGUS.map((l) => l.name).join(", "));
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm"
                >
                  Copy all LGU names
                </button>
                <button
                  onClick={() => setQ("")}
                  className="px-3 py-2 rounded-lg bg-slate-50 text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="text-sm font-semibold">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    className="text-sky-600 hover:underline"
                    href="https://psa.gov.ph"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Philippine Statistics Authority
                  </a>
                </li>
                <li>
                  <a
                    className="text-sky-600 hover:underline"
                    href="https://www.ndrrmc.gov.ph"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NDRRMC
                  </a>
                </li>
                <li>
                  <a
                    className="text-sky-600 hover:underline"
                    href="https://www.dpwh.gov.ph"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DPWH
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-4 text-sm">
              <div className="font-semibold mb-2">Need broader data?</div>
              <div className="text-slate-600 mb-3">
                Contact the regional secretariat for full datasets, geojsons and
                planning documents.
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                onClick={() => alert("Contact form placeholder")}
              >
                Contact Secretariat
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
