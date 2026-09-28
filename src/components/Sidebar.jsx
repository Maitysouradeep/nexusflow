import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  User,
  Activity,
  CreditCard,
  Settings,
  ShieldCheck,
  FolderKanban,
  Users,
  CheckSquare,
  Code2,
  Webhook,
  X,
} from "lucide-react";

export default function Sidebar({ userRole }) {
  const location = useLocation();

  // ---------------------------------------------
  // DESKTOP COLLAPSED STATE
  // ---------------------------------------------

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("nexusflow-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  // ---------------------------------------------
  // MOBILE DRAWER STATE
  // ---------------------------------------------

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        "nexusflow-sidebar-collapsed",
        String(collapsed)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [collapsed]);

  // ---------------------------------------------
  // MOBILE SIDEBAR EVENT
  // Header dispatches this event
  // ---------------------------------------------

  useEffect(() => {
    const handleMobileSidebar = () => {
      setMobileOpen((current) => !current);
    };

    window.addEventListener(
      "nexusflow-toggle-mobile-sidebar",
      handleMobileSidebar
    );

    return () => {
      window.removeEventListener(
        "nexusflow-toggle-mobile-sidebar",
        handleMobileSidebar
      );
    };
  }, []);

  // ---------------------------------------------
  // CLOSE MOBILE SIDEBAR ON NAVIGATION
  // ---------------------------------------------

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ---------------------------------------------
  // PREVENT BODY SCROLL WHEN MOBILE SIDEBAR OPEN
  // ---------------------------------------------

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const mainItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      path: "/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  const workspaceItems = [
    {
      path: "/team",
      label: "Team",
      icon: Users,
    },
    {
      path: "/activity",
      label: "Activity",
      icon: Activity,
    },
  ];

  const developerItems = [
    {
      path: "/api",
      label: "API",
      icon: Code2,
    },
    {
      path: "/webhooks",
      label: "Webhooks",
      icon: Webhook,
    },
  ];

  const accountItems = [
    {
      path: "/subscription",
      label: "Billing",
      icon: CreditCard,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  if (userRole === "admin") {
    accountItems.unshift({
      path: "/admin",
      label: "Admin",
      icon: ShieldCheck,
    });
  }

  return (
    <>
      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        onClick={toggleSidebar}
        className={`
          hidden md:flex
          shrink-0
          bg-[#0A0F1A]
          text-white
          min-h-screen
          flex-col
          border-r border-white/[0.06]
          transition-[width]
          duration-300
          ease-in-out
          cursor-pointer
          ${collapsed ? "w-[76px]" : "w-[250px]"}
        `}
      >
        {/* BRAND */}
        <div
          onClick={(event) => event.stopPropagation()}
          className={`
            h-[72px]
            shrink-0
            flex
            items-center
            border-b border-white/[0.06]
            ${collapsed ? "justify-center px-3" : "px-5"}
          `}
        >
          <Link
            to="/dashboard"
            title={collapsed ? "NexusFlow" : undefined}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <span className="font-black">N</span>
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold tracking-tight whitespace-nowrap">
                  NexusFlow
                </p>

                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Workspace
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav
          className={`
            flex-1
            overflow-y-auto
            py-5
            nexus-sidebar-scroll
            ${collapsed ? "px-2" : "px-3"}
          `}
        >
          <NavSection
            title="Workspace"
            items={mainItems}
            isActive={isActive}
            collapsed={collapsed}
          />

          <NavSection
            title="Management"
            items={workspaceItems}
            isActive={isActive}
            collapsed={collapsed}
          />

          <NavSection
            title="Developer"
            items={developerItems}
            isActive={isActive}
            collapsed={collapsed}
          />

          <NavSection
            title="Account"
            items={accountItems}
            isActive={isActive}
            collapsed={collapsed}
          />
        </nav>

        {/* BOTTOM */}
        <div
          onClick={(event) => event.stopPropagation()}
          className={`
            border-t border-white/[0.06]
            ${collapsed ? "p-2" : "p-4"}
          `}
        >
          <div
            className={`
              rounded-xl
              bg-white/[0.03]
              border border-white/[0.06]
              ${collapsed ? "p-2 flex justify-center" : "p-3"}
            `}
          >
            <div
              className={`
                flex items-center
                ${collapsed ? "justify-center" : "gap-2"}
              `}
            >
              <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                N
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-300">
                    NexusFlow
                  </p>

                  <p className="text-[10px] text-gray-600">
                    SaaS workspace
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      {mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="
            md:hidden
            fixed
            inset-0
            z-[80]
            bg-black/50
            backdrop-blur-[2px]
          "
        />
      )}

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <aside
        className={`
          md:hidden
          fixed
          top-0
          left-0
          bottom-0
          z-[90]
          w-[280px]
          bg-[#0A0F1A]
          text-white
          border-r border-white/[0.08]
          shadow-2xl
          flex
          flex-col
          transition-transform
          duration-300
          ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* MOBILE BRAND */}
        <div className="h-[72px] shrink-0 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <span className="font-black">N</span>
            </div>

            <div>
              <p className="font-bold tracking-tight">NexusFlow</p>

              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                Workspace
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-white
              hover:bg-white/[0.06]
              transition
            "
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 nexus-sidebar-scroll">
          <MobileNavSection
            title="Workspace"
            items={mainItems}
            isActive={isActive}
            onNavigate={closeMobileSidebar}
          />

          <MobileNavSection
            title="Management"
            items={workspaceItems}
            isActive={isActive}
            onNavigate={closeMobileSidebar}
          />

          <MobileNavSection
            title="Developer"
            items={developerItems}
            isActive={isActive}
            onNavigate={closeMobileSidebar}
          />

          <MobileNavSection
            title="Account"
            items={accountItems}
            isActive={isActive}
            onNavigate={closeMobileSidebar}
          />
        </nav>

        {/* MOBILE BOTTOM */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                N
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-300">
                  NexusFlow
                </p>

                <p className="text-[10px] text-gray-600">
                  SaaS workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =====================================================
   DESKTOP NAV SECTION
===================================================== */

function NavSection({
  title,
  items,
  isActive,
  collapsed,
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(event) => event.stopPropagation()}
              title={collapsed ? item.label : undefined}
              className={`
                group
                flex
                items-center
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  collapsed
                    ? "justify-center px-0 py-3"
                    : "gap-3 px-3 py-2.5"
                }
                ${
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                }
              `}
            >
              <Icon
                size={18}
                className={`
                  shrink-0
                  transition
                  ${
                    active
                      ? "text-blue-400"
                      : "text-gray-500 group-hover:text-gray-300"
                  }
                `}
              />

              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================
   MOBILE NAV SECTION
===================================================== */

function MobileNavSection({
  title,
  items,
  isActive,
  onNavigate,
}) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`
                group
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                }
              `}
            >
              <Icon
                size={18}
                className={`
                  shrink-0
                  ${
                    active
                      ? "text-blue-400"
                      : "text-gray-500 group-hover:text-gray-300"
                  }
                `}
              />

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}