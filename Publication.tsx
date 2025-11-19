import React, { useEffect, useMemo, useState } from "react";

type Publication = {
  id: string;
  title: string;
  authors: string;
  date: string;
  kind: "Report" | "Brief" | "Dataset" | "Article";
  summary?: string;
  url?: string;
  size?: string;
  cover?: string;
  banner?: string;
  tags?: string[];
};

const SAMPLE_PUBLICATIONS: Publication[] = [
  {
    id: "pub-001",
    title: "NCR Infrastructure Investment Report 2024",
    authors: "RDC-NCR",
    date: "2024-08-15",
    kind: "Report",
    summary:
      "Comprehensive analysis of priority infrastructure projects across Metro Manila with detailed visuals, budgets and timelines.",
    url: "#",
    size: "1.2 MB",
    cover:
      "https://images.unsplash.com/photo-1505033711971-0b5f1b17c1a0?q=80&w=800&auto=format&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop",
    tags: ["infrastructure", "NCR", "2024", "investment"],
  },
  {
    id: "pub-002",
    title: "Green Transport Initiatives — Policy Brief",
    authors: "RDC-NCR | Mobility Team",
    date: "2023-11-10",
    kind: "Brief",
    summary:
      "Strategic policy recommendations to support sustainable transport and reduce congestion in NCR.",
    url: "#",
    size: "420 KB",
    cover:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop",
    tags: ["mobility", "policy", "sustainability"],
  },
  {
    id: "pub-003",
    title: "NCR Project Geolocations (Sample Dataset)",
    authors: "RDC-NCR GIS",
    date: "2024-01-22",
    kind: "Dataset",
    summary:
      "Comprehensive CSV and GeoJSON files with project locations, coordinates for regional mapping analysis.",
    url: "#",
    size: "150 KB",
    cover:
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=800&auto=format&fit=crop",
    tags: ["gis", "data", "open-data", "mapping"],
  },
  {
    id: "pub-004",
    title: "Community Resilience Case Studies",
    authors: "RDC-NCR",
    date: "2022-06-05",
    kind: "Article",
    summary:
      "Inspiring case studies on barangay-level resilience measures and disaster risk reduction initiatives.",
    url: "#",
    size: "800 KB",
    cover:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
    tags: ["resilience", "community", "drr"],
  },
  {
    id: "pub-005",
    title: "Urban Housing Demand & Supply Analysis 2023",
    authors: "RDC-NCR Planning Division",
    date: "2023-03-18",
    kind: "Report",
    summary:
      "Detailed market analysis of housing trends, affordability metrics and development opportunities.",
    url: "#",
    size: "2.1 MB",
    cover:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop",
    tags: ["housing", "urban-planning", "2023"],
  },
  {
    id: "pub-006",
    title: "Digital Economy Growth Indicators",
    authors: "RDC-NCR Economic Team",
    date: "2024-05-22",
    kind: "Brief",
    summary:
      "Key metrics on digital transformation, IT sector growth and e-commerce development in NCR.",
    url: "#",
    size: "550 KB",
    cover:
      "https://images.unsplash.com/photo-1460925895917-adf4e7d5e7a1?q=80&w=800&auto=format&fit=crop",
    tags: ["economy", "digital", "technology"],
  },
];

const kindColors: Record<string, { bg: string; text: string; accent: string }> =
  {
    Report: {
      bg: "bg-gradient-to-r from-sky-700 to-indigo-600",
      text: "text-sky-700",
      accent: "bg-sky-100",
    },
    Brief: {
      bg: "bg-gradient-to-r from-amber-500 to-yellow-400",
      text: "text-amber-700",
      accent: "bg-amber-100",
    },
    Dataset: {
      bg: "bg-gradient-to-r from-indigo-600 to-violet-500",
      text: "text-indigo-700",
      accent: "bg-indigo-100",
    },
    Article: {
      bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
      text: "text-emerald-700",
      accent: "bg-emerald-100",
    },
  };

export default function Publication(): JSX.Element {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Publication["kind"] | "All">(
    "All"
  );
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [preview, setPreview] = useState<Publication | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const years = useMemo(() => {
    const s = new Set<string>();
    SAMPLE_PUBLICATIONS.forEach((p) =>
      s.add(new Date(p.date).getFullYear().toString())
    );
    return ["All", ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    SAMPLE_PUBLICATIONS.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_PUBLICATIONS.filter((p) => {
      if (typeFilter !== "All" && p.kind !== typeFilter) return false;
      if (
        yearFilter !== "All" &&
        new Date(p.date).getFullYear().toString() !== yearFilter
      )
        return false;
      if (activeTag && !(p.tags || []).includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        (p.summary || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return +new Date(b.date) - +new Date(a.date);
        case "name":
          return a.title.localeCompare(b.title);
        case "size": {
          const aSize = parseInt(a.size || "0") || 0;
          const bSize = parseInt(b.size || "0") || 0;
          return bSize - aSize;
        }
        default:
          return 0;
      }
    });
  }, [query, typeFilter, yearFilter, activeTag, sortBy]);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(null), 1500);
      return () => clearTimeout(t);
    }
    return;
  }, [copied]);

  const handleCopyLink = async (p: Publication) => {
    try {
      const link = window.location.origin + (p.url ?? "#");
      await navigator.clipboard.writeText(link);
      setCopied(p.id);
    } catch {
      // eslint-disable-next-line no-alert
      alert("Link: " + (p.url ?? "#"));
    }
  };

  const typeCounts = useMemo(() => {
    const counts: Record<Publication["kind"], number> = {
      Report: 0,
      Brief: 0,
      Dataset: 0,
      Article: 0,
    };
    SAMPLE_PUBLICATIONS.forEach((p) => counts[p.kind]++);
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans">
      {/* BREADCRUMB */}
      <nav className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <a href="/" className="hover:text-slate-900">
            Home
          </a>
          <span>/</span>
          <span className="text-slate-900 font-medium">Publications</span>
        </div>
      </nav>

      {/* HERO / BANNER */}
      <header className="bg-gradient-to-r from-[#012a5a] via-[#0b6fb7] to-[#0d8fb3] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <svg
                    className="w-10 h-10 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm uppercase text-white/90 font-semibold tracking-wider">
                    Publications & Resources
                  </div>
                  <div className="text-xs text-white/80">
                    Curated reports, briefs & open datasets
                  </div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Access Regional Development Resources
              </h1>
              <p className="text-base text-white/90 max-w-xl">
                Explore comprehensive reports on infrastructure, sustainability,
                resilience and economic development across the National Capital
                Region.
              </p>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  "Report",
                  "Brief",
                  "Dataset",
                  "Article",
                ] as Publication["kind"][]
              ).map((k) => (
                <div
                  key={k}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                  <div className="text-2xl font-extrabold text-white">
                    {typeCounts[k]}
                  </div>
                  <div className="text-xs text-white/80 mt-1">{k}s</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* SIDEBAR - FILTERS */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="hidden lg:block sticky top-24 space-y-5">
              {/* Search card */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Search
                </h3>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Title, author, tag..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                  aria-label="Search publications"
                />
              </div>

              {/* Filters card */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Filters
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="type-filter"
                      className="text-xs font-semibold text-slate-600"
                    >
                      Publication Type
                    </label>
                    <select
                      id="type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      <option value="All">All types</option>
                      <option value="Report">Report</option>
                      <option value="Brief">Brief</option>
                      <option value="Dataset">Dataset</option>
                      <option value="Article">Article</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="year-filter"
                      className="text-xs font-semibold text-slate-600"
                    >
                      Year Published
                    </label>
                    <select
                      id="year-filter"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("All");
                      setYearFilter("All");
                      setActiveTag(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Tags card */}
              <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Browse Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        activeTag === t
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      aria-pressed={activeTag === t}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-5 border border-sky-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Total Resources
                </h4>
                <div className="mt-2 text-2xl font-extrabold text-sky-700">
                  {SAMPLE_PUBLICATIONS.length}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {filtered.length} matching your filters
                </div>
              </div>
            </div>

            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 font-medium flex items-center justify-between"
              >
                <span>Filters & Search</span>
                <svg
                  className={`w-4 h-4 transition ${
                    showFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {showFilters && (
                <div className="mt-3 bg-white rounded-2xl shadow-lg p-5 space-y-4">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="All">All types</option>
                    <option value="Report">Report</option>
                    <option value="Brief">Brief</option>
                    <option value="Dataset">Dataset</option>
                    <option value="Article">Article</option>
                  </select>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("All");
                      setYearFilter("All");
                      setActiveTag(null);
                      setShowFilters(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 text-sm font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="lg:col-span-4 order-1 lg:order-2 space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <strong className="text-slate-900">{filtered.length}</strong> of{" "}
                <strong className="text-slate-900">
                  {SAMPLE_PUBLICATIONS.length}
                </strong>{" "}
                result(s)
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label="Sort publications"
                >
                  <option value="recent">Most recent</option>
                  <option value="name">Title A–Z</option>
                  <option value="size">Largest file</option>
                </select>

                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-500">View:</span>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      viewMode === "grid"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-pressed={viewMode === "grid"}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      viewMode === "list"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-pressed={viewMode === "list"}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* GRID/LIST VIEW */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filtered.map((p) =>
                viewMode === "grid" ? (
                  <article
                    key={p.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden flex flex-col group border border-slate-100"
                  >
                    <div className="w-full h-40 overflow-hidden bg-slate-100 relative">
                      <img
                        src={p.cover}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full text-white ${
                            kindColors[p.kind].bg
                          }`}
                        >
                          {p.kind}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                          {p.title}
                        </h3>
                        <div className="text-xs text-slate-500 mt-1">
                          {p.authors} • {new Date(p.date).getFullYear()}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2 flex-1">
                        {p.summary}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {(p.tags || []).slice(0, 3).map((t) => (
                          <button
                            key={t}
                            onClick={() =>
                              setActiveTag(activeTag === t ? null : t)
                            }
                            className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setPreview(p)}
                          className="flex-1 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 transition"
                        >
                          Preview
                        </button>
                        <a
                          href={p.url ?? "#"}
                          className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleCopyLink(p)}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                          aria-label={`Share ${p.title}`}
                        >
                          {copied === p.id ? "✓" : "Share"}
                        </button>
                      </div>
                    </div>
                  </article>
                ) : (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 border border-slate-100 flex items-start gap-4"
                  >
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {p.title}
                          </h3>
                          <div className="text-sm text-slate-600 mt-1">
                            {p.authors} •{" "}
                            {new Date(p.date).toLocaleDateString()}
                          </div>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                            {p.summary}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full text-white whitespace-nowrap ${
                            kindColors[p.kind].bg
                          }`}
                        >
                          {p.kind}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreview(p)}
                            className="text-sm text-sky-600 hover:underline font-medium"
                          >
                            Preview
                          </button>
                          <span className="text-slate-300">•</span>
                          <a
                            href={p.url ?? "#"}
                            className="text-sm text-emerald-600 hover:underline font-medium"
                          >
                            Download
                          </a>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() => handleCopyLink(p)}
                            className="text-sm text-slate-600 hover:underline"
                          >
                            {copied === p.id ? "Copied!" : "Share"}
                          </button>
                        </div>
                        <div className="text-xs text-slate-500">{p.size}</div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">
                  No publications found
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("All");
                    setYearFilter("All");
                    setActiveTag(null);
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* FEATURED SECTION */}
            {SAMPLE_PUBLICATIONS[0] &&
              filtered.includes(SAMPLE_PUBLICATIONS[0]) && (
                <div className="mt-10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <div className="md:col-span-1 rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={SAMPLE_PUBLICATIONS[0].cover}
                        alt="Featured"
                        className="w-full h-64 object-cover"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <div
                          className={`inline-block text-xs px-3 py-1 rounded-full text-white ${
                            kindColors[SAMPLE_PUBLICATIONS[0].kind].bg
                          } mb-3`}
                        >
                          Featured
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight">
                          {SAMPLE_PUBLICATIONS[0].title}
                        </h2>
                        <p className="mt-3 text-slate-200 text-sm lg:text-base">
                          {SAMPLE_PUBLICATIONS[0].summary}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <a
                          href={SAMPLE_PUBLICATIONS[0].url ?? "#"}
                          className="bg-white text-slate-900 px-5 py-3 rounded-lg font-semibold hover:bg-slate-100 transition"
                        >
                          Download Report
                        </a>
                        <button
                          onClick={() => setPreview(SAMPLE_PUBLICATIONS[0])}
                          className="px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition"
                        >
                          Quick Preview
                        </button>
                        <div className="text-sm text-slate-300 ml-auto">
                          <div>{SAMPLE_PUBLICATIONS[0].size}</div>
                          <div>
                            {new Date(
                              SAMPLE_PUBLICATIONS[0].date
                            ).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </section>
        </div>
      </main>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${preview.title}`}
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-slate-200 backdrop-blur-sm rounded-t-3xl">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {preview.title}
              </h2>
              <button
                onClick={() => setPreview(null)}
                className="ml-4 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                aria-label="Close preview"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <img
                    src={preview.cover}
                    alt={preview.title}
                    className="w-full rounded-2xl shadow-md"
                  />
                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Size:</span>
                      <span className="ml-2 font-semibold">{preview.size}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Published:</span>
                      <span className="ml-2 font-semibold">
                        {new Date(preview.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Type:</span>
                      <span
                        className={`ml-2 font-semibold ${
                          kindColors[preview.kind].text
                        }`}
                      >
                        {preview.kind}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600">
                        Authors
                      </h3>
                      <p className="text-slate-900">{preview.authors}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-600">
                        Summary
                      </h3>
                      <p className="text-slate-700">{preview.summary}</p>
                    </div>

                    {(preview.tags || []).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {preview.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200">
                      <a
                        href={preview.url ?? "#"}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Full Document
                      </a>
                      <button
                        onClick={() => handleCopyLink(preview)}
                        className="ml-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                      >
                        {copied === preview.id ? "Link Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-100 mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-3">About Publications</h4>
              <p className="text-sm text-slate-400">
                Explore open data, reports and resources from the Regional
                Development Council.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Reports
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Briefs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Datasets
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Articles
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="/" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Contact</h4>
              <p className="text-sm text-slate-400">
                Email:{" "}
                <a
                  href="mailto:rdc.ncr@mmda.gov.ph"
                  className="text-sky-400 hover:text-sky-300"
                >
                  rdc.ncr@mmda.gov.ph
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} NCR Regional Development Council.
            All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
