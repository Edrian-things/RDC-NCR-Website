import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type ContactItem = {
  id: string;
  department: string;
  office: string;
  phone?: string;
  email?: string;
  locationLabel?: string;
  lat?: number;
  lng?: number;
};

type FeedbackData = {
  rating: number;
  category: "bug" | "feature" | "design" | "performance" | "other";
  message: string;
  email?: string;
  page?: string;
  timestamp: string;
  userAgent?: string;
};

const CONTACTS: ContactItem[] = [
  {
    id: "c01",
    department: "Office of the Chairperson",
    office: "RDC-NCR Secretariat",
    phone: "+63 2 1234 5678",
    email: "chair@rdc-ncr.gov.ph",
    locationLabel: "Rizal Park, Manila",
    lat: 14.5829,
    lng: 120.977,
  },
  {
    id: "c02",
    department: "Planning & Research",
    office: "Planning Unit",
    phone: "+63 2 2233 4455",
    email: "planning@rdc-ncr.gov.ph",
    locationLabel: "Quezon City Hall",
    lat: 14.676,
    lng: 121.0437,
  },
  {
    id: "c03",
    department: "Transport & Mobility",
    office: "Mobility Unit",
    phone: "+63 2 3344 5566",
    email: "mobility@rdc-ncr.gov.ph",
    locationLabel: "Taguig City",
    lat: 14.5176,
    lng: 121.0509,
  },
  {
    id: "c04",
    department: "Environmental Services",
    office: "Environmental Unit",
    phone: "+63 2 9988 7766",
    email: "env@rdc-ncr.gov.ph",
    locationLabel: "Marikina",
    lat: 14.6506,
    lng: 121.1029,
  },
  {
    id: "c05",
    department: "Disaster Resilience",
    office: "Resilience Office",
    phone: "+63 2 8877 6655",
    email: "resilience@rdc-ncr.gov.ph",
    locationLabel: "Pasig",
    lat: 14.5764,
    lng: 121.0851,
  },
  {
    id: "c06",
    department: "Finance & Budget",
    office: "Budget Office",
    phone: "+63 2 7766 5544",
    email: "budget@rdc-ncr.gov.ph",
    locationLabel: "Makati",
    lat: 14.5547,
    lng: 121.0244,
  },
  {
    id: "c07",
    department: "Infrastructure",
    office: "Project Monitoring",
    phone: "+63 2 5544 3322",
    email: "infra@rdc-ncr.gov.ph",
    locationLabel: "Manila",
    lat: 14.5995,
    lng: 120.9842,
  },
];

const pinIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 24 36'%3E%3Cpath fill='%23196' d='M12 0C7 0 3 4 3 9c0 6.8 8.8 18.1 8.9 18.3a1 1 0 0 0 1.8 0C12.2 27.1 21 15.8 21 9c0-5-4-9-9-9z'/%3E%3Ccircle cx='12' cy='9' r='3' fill='white'/%3E%3C/svg%3E",
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -40],
});

function FlyToMarker({ latlng }: { latlng?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!latlng) return;
    map.flyTo(latlng, 13, { duration: 0.9 });
  }, [latlng, map]);
  return null;
}

const ContactCard: React.FC<{
  item: ContactItem;
  onSelect: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  isSelected: boolean;
}> = ({ item, onSelect, onCopy, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`group cursor-pointer relative overflow-hidden rounded-2xl p-4 transition shadow-md hover:shadow-xl transform hover:-translate-y-1
        ${
          isSelected
            ? "ring-2 ring-sky-400 bg-gradient-to-br from-white to-sky-50"
            : "bg-white"
        }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-500">{item.department}</div>
          <div className="font-semibold text-slate-900 text-lg mt-1 truncate">
            {item.office}
          </div>
          <div className="mt-2 text-sm text-slate-600 truncate">
            {item.locationLabel}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.phone && onCopy(item.phone, item.id);
              }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-100 text-xs text-slate-800 hover:bg-slate-200"
              aria-label="copy-phone"
            >
              {item.phone ?? "—"}
              <svg
                className="w-3 h-3 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="9" y="9" width="11" height="11" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.email && onCopy(item.email, item.id);
              }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-sky-700 text-xs text-white hover:brightness-110"
              aria-label="copy-email"
            >
              {item.email ?? "—"}
            </button>

            <a
              onClick={(e) => e.stopPropagation()}
              href={`https://www.google.com/maps/search/?api=1&query=${
                item.lat ?? ""
              },${item.lng ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100"
            >
              Open Map
            </a>
          </div>
        </div>
      </div>

      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-5 bg-gradient-to-tr from-sky-400 to-emerald-300 pointer-events-none group-hover:opacity-20 transition-opacity" />
    </div>
  );
};

const Contact: React.FC = () => {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [onlyWithEmail, setOnlyWithEmail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(CONTACTS[0].id);
  const [showFilters, setShowFilters] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState<FeedbackData>({
    rating: 5,
    category: "other",
    message: "",
    email: "",
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTACTS.filter((c) => {
      if (onlyWithEmail && !c.email) return false;
      if (!q) return true;
      return (
        c.department.toLowerCase().includes(q) ||
        c.office.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.locationLabel ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, onlyWithEmail]);

  const selected = useMemo(
    () => CONTACTS.find((c) => c.id === selectedId) ?? null,
    [selectedId]
  );

  const handleCopy = async (text: string | undefined, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // eslint-disable-next-line no-alert
      alert(`Copy this: ${text}`);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackForm.message.trim()) {
      // eslint-disable-next-line no-alert
      alert("Please enter your feedback message.");
      return;
    }

    setFeedbackLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("📝 Feedback Submitted:", feedbackForm);
      // TODO: Replace with actual API endpoint
      // await fetch("/api/feedback", { method: "POST", body: JSON.stringify(feedbackForm) })

      setFeedbackLoading(false);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSubmitted(false);
        setFeedbackForm({
          rating: 5,
          category: "other",
          message: "",
          email: "",
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }, 2000);
    }, 800);
  };

  useEffect(() => {
    if (!filtered.find((f) => f.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  // Fix body overflow when modal is open
  useEffect(() => {
    if (showFeedbackModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [showFeedbackModal]);

  return (
    <>
      <main
        className={`max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
          showFeedbackModal ? "pointer-events-none" : ""
        }`}
        style={{
          filter: showFeedbackModal ? "blur(2px)" : "none",
          transition: "filter 0.2s ease",
        }}
      >
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-800 via-indigo-700 to-emerald-500 text-white p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                Contact Directory — Interactive
              </h1>
              <p className="mt-1 text-sm opacity-95">
                Fast access to offices, hotlines and map locations. Click a card
                to highlight and fly to it on the map.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M3 8l7-5 7 5M5 19h14" />
                </svg>
                <div className="text-sm">
                  <div className="text-xs opacity-90">Main Office</div>
                  <div className="font-medium">RDC-NCR Secretariat</div>
                </div>
              </div>

              <a
                className="inline-flex items-center gap-2 bg-white text-sky-800 px-3 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
                href="#contacts"
              >
                Browse Directory
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar controls */}
          <aside className="md:col-span-1">
            <div className="hidden md:block sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Directory Controls
                  </h3>
                  <div className="text-xs text-slate-500">
                    {filtered.length} results
                  </div>
                </div>

                <div className="mt-3">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search department, office, email, phone..."
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <label className="flex items-center gap-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyWithEmail}
                    onChange={(e) => setOnlyWithEmail(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Show only entries with email
                </label>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setQuery("");
                      setOnlyWithEmail(false);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm"
                  >
                    Reset
                  </button>
                  <a
                    href="#"
                    className="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
                  >
                    Export
                  </a>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Tip: click a card to fly to its map marker. Use copy buttons
                  to copy phone/email.
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl p-4 shadow">
                <h4 className="text-sm font-semibold text-slate-800">
                  Emergency Hotlines
                </h4>
                <ul className="mt-2 text-sm text-slate-700 space-y-1">
                  <li>
                    Police: <strong>911</strong>
                  </li>
                  <li>
                    Health: <strong>1669</strong>
                  </li>
                  <li>
                    Fire: <strong>160</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile filter toggle */}
            <div className="md:hidden mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-50"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <div className="text-sm text-slate-500">{filtered.length}</div>
              </div>

              {showFilters && (
                <div className="mt-3 bg-white rounded-2xl p-4 shadow">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search department, office, email, phone..."
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <label className="flex items-center gap-2 mt-3 text-sm">
                    <input
                      type="checkbox"
                      checked={onlyWithEmail}
                      onChange={(e) => setOnlyWithEmail(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Show only entries with email
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setQuery("");
                        setOnlyWithEmail(false);
                        setShowFilters(false);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50"
                    >
                      Reset
                    </button>
                    <a
                      href="#"
                      className="px-3 py-2 rounded-lg bg-sky-600 text-white"
                    >
                      Export
                    </a>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main list + map */}
          <div className="md:col-span-2 space-y-4">
            <div
              id="contacts"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filtered.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl p-6 shadow text-center text-slate-500">
                  No contacts match your search.
                </div>
              ) : (
                filtered.map((c) => (
                  <div key={c.id}>
                    <ContactCard
                      item={c}
                      onSelect={(id) => setSelectedId(id)}
                      onCopy={handleCopy}
                      isSelected={selectedId === c.id}
                    />
                    <div className="mt-2 text-xs text-slate-400">
                      {copiedId === c.id
                        ? "Copied!"
                        : "Click card to view on map"}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  Map Preview
                </h3>
                <div className="text-xs text-slate-500">
                  Selected location highlighted
                </div>
              </div>

              <div
                className="w-full rounded-lg overflow-hidden"
                style={{
                  pointerEvents: showFeedbackModal ? "none" : "auto",
                }}
              >
                <div className="h-56 sm:h-64 md:h-72 lg:h-80 relative z-0">
                  <MapContainer
                    center={[14.6, 121.02]}
                    zoom={11}
                    scrollWheelZoom={!showFeedbackModal}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {CONTACTS.map(
                      (c) =>
                        c.lat &&
                        c.lng && (
                          <Marker
                            key={c.id}
                            position={[c.lat!, c.lng!]}
                            icon={pinIcon as any}
                          >
                            <Popup>
                              <div className="text-sm">
                                <div className="font-semibold">{c.office}</div>
                                <div className="text-xs text-slate-600">
                                  {c.locationLabel}
                                </div>
                                <div className="mt-2 text-xs">
                                  {c.phone ?? ""}{" "}
                                  {c.email ? (
                                    <div>
                                      <a
                                        className="text-sky-600"
                                        href={`mailto:${c.email}`}
                                      >
                                        {c.email}
                                      </a>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        )
                    )}
                    <FlyToMarker
                      latlng={
                        selected && selected.lat && selected.lng
                          ? [selected.lat, selected.lng]
                          : undefined
                      }
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING FEEDBACK BUTTON */}
      {!showFeedbackModal && (
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition group"
          aria-label="Open feedback form"
          title="Share your feedback"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-12 transition"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <span className="hidden sm:inline">Feedback</span>
        </button>
      )}

      {/* FEEDBACK MODAL - FIXED Z-INDEX & RESPONSIVE */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)}
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Website feedback form"
            className="relative z-[9999] bg-white w-full sm:w-full md:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-6 flex items-start sm:items-center justify-between rounded-t-3xl gap-3">
              <div className="flex-1">
                <h2 className="text-lg sm:text-2xl font-extrabold">
                  Share Your Feedback
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1">
                  Help us improve the NCR Portal experience
                </p>
              </div>
              {!feedbackSubmitted && (
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  aria-label="Close feedback form"
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
              )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {feedbackSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Thank You!
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Your feedback has been submitted successfully. We appreciate
                    your input!
                  </p>
                  <p className="text-xs text-slate-500 mt-4">
                    Closing in a moment...
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleFeedbackSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Rating */}
                  <div>
                    <label className="text-sm font-semibold text-slate-900 mb-3 block">
                      How would you rate your experience?
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFeedbackForm({ ...feedbackForm, rating: star })
                          }
                          className="text-2xl sm:text-3xl transition transform hover:scale-110"
                        >
                          {star <= feedbackForm.rating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                      {feedbackForm.rating === 1 && "Very Poor"}
                      {feedbackForm.rating === 2 && "Poor"}
                      {feedbackForm.rating === 3 && "Average"}
                      {feedbackForm.rating === 4 && "Good"}
                      {feedbackForm.rating === 5 && "Excellent"}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="text-sm font-semibold text-slate-900 mb-2 block"
                    >
                      Feedback Category
                    </label>
                    <select
                      id="category"
                      value={feedbackForm.category}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="bug">🐛 Bug Report</option>
                      <option value="feature">💡 Feature Request</option>
                      <option value="design">🎨 Design Feedback</option>
                      <option value="performance">⚡ Performance Issue</option>
                      <option value="other">💬 Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="text-sm font-semibold text-slate-900 mb-2 block"
                    >
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      value={feedbackForm.message}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Please describe your feedback in detail..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                      rows={4}
                      required
                      maxLength={500}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      {feedbackForm.message.length}/500 characters
                    </div>
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-900 mb-2 block"
                    >
                      Your Email (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={feedbackForm.email}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      We'll contact you if we need more details.
                    </div>
                  </div>

                  {/* Privacy notice */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-slate-600">
                      <strong>Privacy:</strong> Your feedback is encrypted and
                      sent securely. We do not share personal data with third
                      parties.
                    </p>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="flex-1 px-4 py-2 sm:py-3 rounded-lg bg-slate-100 text-slate-900 font-medium text-sm hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={feedbackLoading || !feedbackForm.message.trim()}
                      className="flex-1 px-4 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {feedbackLoading ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2v4m0 12v4M4 12h4m12 0h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M5.64 18.36l2.83-2.83M15.53 8.47l2.83-2.83" />
                          </svg>
                          <span className="hidden sm:inline">
                            Submitting...
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 19l-7-7 7-7m8 0l-7 7 7 7" />
                          </svg>
                          <span className="hidden sm:inline">Submit</span>
                          <span className="sm:hidden">Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;
