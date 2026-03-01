import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type Role = "admin" | "validator" | "employee";

type Props = {
  title: string;
  subtitle?: string;
  role: Role;
  userName: string;
  children: React.ReactNode;
  topActions?: React.ReactNode;
};

type NavItem = { label: string; to: string };

const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  validator: "Validator",
  employee: "Contributor",
};

const roleAccent: Record<Role, string> = {
  admin: "portal-chip-admin",
  validator: "portal-chip-validator",
  employee: "portal-chip-employee",
};

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Projects", to: "/admin/projects" },
    { label: "Validator Diffs", to: "/admin/validator-diffs" },
    { label: "Users & Access", to: "/admin/users" },
  ],
  validator: [
    { label: "Dashboard", to: "/validator/dashboard" },
    { label: "Review Queue", to: "/validator/projects" },
    { label: "Reviewed & Validated", to: "/validator/projects/history" },
  ],
  employee: [
    { label: "Dashboard", to: "/employee/dashboard" },
    { label: "My Projects", to: "/employee/projects" },
    { label: "New Submission", to: "/employee/projects/new" },
  ],
};

const iconFor = (label: string) => {
  const common = "w-4 h-4";
  if (label.toLowerCase().includes("dashboard")) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 13h8V3H3zM13 21h8v-6h-8zM13 3v8h8V3zM3 21h8v-6H3z" />
      </svg>
    );
  }
  if (label.toLowerCase().includes("project")) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 4h11v16H4V9z" />
        <path d="M9 4v5H4" />
      </svg>
    );
  }
  if (label.toLowerCase().includes("user") || label.toLowerCase().includes("access")) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
        <path d="M3 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
};

const PortalLayout: React.FC<Props> = ({ title, subtitle, role, userName, children, topActions }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useMemo(() => navByRole[role], [role]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    if (media.matches) setMobileOpen(false);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="portal-bg min-h-screen">
      <div className="portal-shell w-full mx-auto p-2 md:p-4 xl:p-5">
        {mobileOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setMobileOpen(false)} />}
        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)] gap-2 md:gap-4">
          <aside
            className={`portal-sidebar fixed top-2 left-2 bottom-2 w-[84vw] max-w-[300px] z-30 overflow-y-auto ${
              mobileOpen ? "block" : "hidden"
            } md:static md:w-auto md:max-w-none md:block`}
          >
            <div className="portal-brand">
              <div className="portal-brand-dot" />
              <div>
                <p className="portal-brand-title">RDC Portal</p>
                <p className="portal-brand-sub">NCR Workspace</p>
              </div>
            </div>

            <p className="portal-side-label">Navigation</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`portal-nav-item ${active ? "portal-nav-item-active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="portal-nav-icon">{iconFor(item.label)}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <p className="portal-side-label">Account</p>
              <div className="portal-account">
                <div>
                  <p className="portal-account-name">{userName}</p>
                  <span className={`portal-chip ${roleAccent[role]}`}>{roleLabel[role]}</span>
                </div>
                <button onClick={logout} className="portal-logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-3 md:space-y-5 min-w-0">
            <header className="portal-topbar">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button onClick={() => setMobileOpen((v) => !v)} className="portal-menu-btn md:hidden">
                  Menu
                </button>
                <div className="min-w-0">
                  <h1 className="portal-title">{title}</h1>
                  {subtitle && <p className="portal-subtitle">{subtitle}</p>}
                </div>
              </div>
              <div className="portal-top-actions">{topActions}</div>
            </header>

            <section>{children}</section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;
