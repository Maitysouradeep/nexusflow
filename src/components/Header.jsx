import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWorkspaceActivityLogs } from "../utils/activityLogger";
import RoleBadge from "./RoleBadge";

import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  X,
  ArrowRight,
  Command,
  Menu,
} from "lucide-react";

const searchablePages = [
  {
    title: "Overview",
    subtitle: "Workspace overview",
    path: "/dashboard",
    keywords: "home dashboard overview workspace",
  },
  {
    title: "Projects",
    subtitle: "Manage workspace projects",
    path: "/projects",
    keywords: "projects project management",
  },
  {
    title: "Tasks",
    subtitle: "Manage and track tasks",
    path: "/tasks",
    keywords: "tasks task management todo",
  },
  {
    title: "Analytics",
    subtitle: "Workspace analytics",
    path: "/analytics",
    keywords: "analytics statistics metrics reports",
  },
  {
    title: "Team",
    subtitle: "Manage workspace members",
    path: "/team",
    keywords: "team members users people",
  },
  {
    title: "Activity",
    subtitle: "Workspace activity log",
    path: "/activity",
    keywords: "activity logs audit history events",
  },
  {
    title: "API",
    subtitle: "API and developer tools",
    path: "/api",
    keywords: "api developer keys integrations",
  },
  {
    title: "Webhooks",
    subtitle: "Manage webhook integrations",
    path: "/webhooks",
    keywords: "webhooks integrations events",
  },
  {
    title: "Billing",
    subtitle: "Subscription and billing",
    path: "/subscription",
    keywords: "billing subscription plan payment",
  },
  {
    title: "Settings",
    subtitle: "Workspace settings",
    path: "/settings",
    keywords: "settings preferences configuration",
  },
  {
    title: "Profile",
    subtitle: "Your account profile",
    path: "/profile",
    keywords: "profile account user",
  },
];

export default function Header({
  user,
  userRole,
  onLogout,
  pageTitle = "Dashboard",
  pageSubtitle = "Workspace overview",
}) {
  const navigate = useNavigate();
  const { workspaceId } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [lastReadAt, setLastReadAt] = useState(() => {
    return localStorage.getItem("nexusflow-notifications-read-at") || "";
  });

  const notificationRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef(null);

  const firstName = user?.firstName || user?.displayName || "User";
  const lastName = user?.lastName || "";

  const displayName = `${firstName} ${lastName}`.trim();

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // --------------------------------------------------
  // SEARCH RESULTS
  // --------------------------------------------------

  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return searchablePages.slice(0, 6);
    }

    return searchablePages
      .filter((page) => {
        const searchableText = `
          ${page.title}
          ${page.subtitle}
          ${page.keywords}
        `.toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 6);
  }, [searchQuery]);

  // --------------------------------------------------
  // OPEN SEARCH
  // --------------------------------------------------

  const openSearch = () => {
    setSearchOpen(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const openMobileSidebar = () => {
    window.dispatchEvent(new Event("nexusflow-toggle-mobile-sidebar"));
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // --------------------------------------------------
  // NAVIGATE FROM SEARCH
  // --------------------------------------------------

  const handleSearchNavigate = (path) => {
    closeSearch();
    navigate(path);
  };

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  const loadNotifications = async () => {
    if (!workspaceId) return;

    setNotificationsLoading(true);

    try {
      const logs = await getWorkspaceActivityLogs(workspaceId);

      setNotifications(
        logs
          .filter((log) => log?.action)
          .slice(0, 8)
      );
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const getNotificationTime = (createdAt) => {
    try {
      let date = null;

      if (createdAt?.toDate) {
        date = createdAt.toDate();
      } else if (createdAt?.seconds) {
        date = new Date(createdAt.seconds * 1000);
      } else if (createdAt) {
        date = new Date(createdAt);
      }

      if (!date || Number.isNaN(date.getTime())) {
        return "Just now";
      }

      return date.toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  const getNotificationLabel = (action) => {
    const labels = {
      project_created: "Project created",
      project_updated: "Project updated",
      project_deleted: "Project deleted",
      task_created: "Task created",
      task_updated: "Task updated",
      task_deleted: "Task deleted",
      task_status_changed: "Task status changed",
      task_priority_changed: "Task priority changed",
      task_assignee_changed: "Task assignee changed",
      role_changed: "Member role changed",
      member_invited: "Member invited",
      invitation_accepted: "Invitation accepted",
      webhook_created: "Webhook created",
      webhook_updated: "Webhook updated",
      webhook_deleted: "Webhook deleted",
    };

    return labels[action] || action?.replaceAll("_", " ") || "Workspace activity";
  };

  const getUnreadCount = () => {
    if (!lastReadAt) return notifications.length;

    const readTime = new Date(lastReadAt).getTime();

    return notifications.filter((notification) => {
      let date = null;

      if (notification.createdAt?.toDate) {
        date = notification.createdAt.toDate();
      } else if (notification.createdAt?.seconds) {
        date = new Date(notification.createdAt.seconds * 1000);
      } else if (notification.createdAt) {
        date = new Date(notification.createdAt);
      }

      return date && date.getTime() > readTime;
    }).length;
  };

  const unreadCount = getUnreadCount();

  const openNotifications = async () => {
    setNotificationOpen((current) => !current);

    if (!notificationOpen) {
      await loadNotifications();
    }
  };

  const markNotificationsRead = () => {
    const now = new Date().toISOString();

    localStorage.setItem("nexusflow-notifications-read-at", now);
    setLastReadAt(now);
  };

  useEffect(() => {
    if (!workspaceId) return;

    loadNotifications();
  }, [workspaceId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // --------------------------------------------------
  // KEYBOARD SHORTCUTS
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        openSearch();
      }

      if (event.key === "Escape") {
        closeSearch();
      }

      if (searchOpen && event.key === "Enter" && filteredPages.length > 0) {
        event.preventDefault();
        handleSearchNavigate(filteredPages[0].path);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen, filteredPages]);

  return (
    <>
      {/* HEADER */}
      <header className="h-[72px] shrink-0 bg-white dark:bg-[#0A0F1A] border-b border-gray-200 dark:border-white/[0.06] relative z-40">
        <div className="h-full px-5 sm:px-7 flex items-center justify-between gap-4">
          {/* LEFT — PAGE CONTEXT */}
          <div className="flex items-center min-w-0">
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold text-gray-900 dark:text-white truncate">
                  {pageTitle}
                </h1>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                {pageSubtitle}
              </p>
            </div>

            {/* Mobile title */}
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* CENTER — SEARCH */}
          <button
            type="button"
            onClick={openSearch}
            className="
              hidden md:flex
              items-center
              gap-3
              w-full
              max-w-[390px]
              h-10
              px-3.5
              rounded-xl
              border
              border-gray-200
              dark:border-white/[0.08]
              bg-gray-50
              dark:bg-white/[0.03]
              text-gray-400
              hover:border-gray-300
              dark:hover:border-white/[0.14]
              hover:bg-white
              dark:hover:bg-white/[0.05]
              transition-all
              duration-200
              group
            "
          >
            <Search
              size={16}
              className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition"
            />

            <span className="text-xs flex-1 text-left">Search anything...</span>

            <span className="flex items-center gap-1 text-[10px] text-gray-400 border border-gray-200 dark:border-white/[0.1] rounded-md px-1.5 py-0.5 bg-white dark:bg-white/[0.03]">
              <Command size={10} />K
            </span>
          </button>

          {/* MOBILE SEARCH */}
          {/* MOBILE ACTIONS */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={openMobileSidebar}
              className="
      w-9
      h-9
      rounded-xl
      flex
      items-center
      justify-center
      text-gray-500
      dark:text-gray-400
      hover:bg-gray-100
      dark:hover:bg-white/5
      transition
    "
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              onClick={openSearch}
              className="
      w-9
      h-9
      rounded-xl
      flex
      items-center
      justify-center
      text-gray-500
      dark:text-gray-400
      hover:bg-gray-100
      dark:hover:bg-white/5
      transition
    "
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* NOTIFICATIONS */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={openNotifications}
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                className="
                  relative
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  dark:text-gray-400
                  hover:bg-gray-100
                  dark:hover:bg-white/5
                  transition
                "
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0A0F1A]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-[80] w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#111827]">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/[0.07]">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Recent workspace activity
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markNotificationsRead}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[390px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => {
                        const isUnread = (() => {
                          if (!lastReadAt) return true;

                          const readTime = new Date(lastReadAt).getTime();
                          let date = null;

                          if (notification.createdAt?.toDate) {
                            date = notification.createdAt.toDate();
                          } else if (notification.createdAt?.seconds) {
                            date = new Date(notification.createdAt.seconds * 1000);
                          } else if (notification.createdAt) {
                            date = new Date(notification.createdAt);
                          }

                          return date && date.getTime() > readTime;
                        })();

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={markNotificationsRead}
                            className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-white/[0.06] dark:hover:bg-white/[0.04] ${
                              isUnread ? "bg-blue-50/50 dark:bg-blue-500/[0.04]" : ""
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                isUnread ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <span className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                  {notification.userName ||
                                    notification.userEmail ||
                                    "Workspace member"}
                                </span>

                                <span className="shrink-0 text-[10px] text-gray-400">
                                  {getNotificationTime(notification.createdAt)}
                                </span>
                              </span>

                              <span className="mt-1 block text-xs text-gray-600 dark:text-gray-300">
                                {getNotificationLabel(notification.action)}
                              </span>

                              {notification.details?.projectName && (
                                <span className="mt-1 block truncate text-[10px] text-gray-400">
                                  Project: {notification.details.projectName}
                                </span>
                              )}

                              {notification.details?.taskTitle && (
                                <span className="mt-1 block truncate text-[10px] text-gray-400">
                                  Task: {notification.details.taskTitle}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <Bell className="mx-auto h-7 w-7 text-gray-300 dark:text-gray-600" />
                        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                          You're all caught up
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          New workspace activity will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/[0.07]">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/activity");
                      }}
                      className="w-full rounded-lg py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      View all activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-white/[0.08]" />

            {/* USER */}
            <button
              type="button"
              className="
                flex
                items-center
                gap-2.5
                rounded-xl
                px-1.5
                py-1.5
                hover:bg-gray-50
                dark:hover:bg-white/[0.04]
                transition
              "
            >
              {/* AVATAR */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials || "U"}
              </div>

              {/* USER INFO */}
              <div className="hidden lg:block text-left max-w-[150px]">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 truncate">
                    {user?.email || "Workspace member"}
                  </span>

                  <div className="hidden xl:block">
                    <RoleBadge role={userRole} size="small" />
                  </div>
                </div>
              </div>

              <ChevronDown
                size={14}
                className="hidden lg:block text-gray-400"
              />
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="
                h-10
                px-3
                sm:px-4
                rounded-xl
                bg-gray-900
                dark:bg-white
                text-white
                dark:text-gray-900
                flex
                items-center
                justify-center
                gap-2
                text-xs
                font-semibold
                hover:opacity-90
                transition
              "
            >
              <LogOut size={15} />

              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />

          {/* SEARCH PANEL */}
          <div className="relative mx-auto mt-[90px] w-[calc(100%-32px)] max-w-[620px] bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-hidden">
            {/* INPUT */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 dark:border-white/[0.07]">
              <Search size={19} className="text-gray-400 shrink-0" />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pages, features..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={closeSearch}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* RESULTS */}
            <div className="p-2 max-h-[420px] overflow-y-auto">
              {filteredPages.length > 0 ? (
                <>
                  <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {searchQuery ? "Search results" : "Quick navigation"}
                  </p>

                  <div className="space-y-1">
                    {filteredPages.map((page) => (
                      <button
                        key={page.path}
                        type="button"
                        onClick={() => handleSearchNavigate(page.path)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/[0.05] transition group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-400 transition">
                          <Search size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {page.title}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {page.subtitle}
                          </p>
                        </div>

                        <ArrowRight
                          size={15}
                          className="text-gray-300 group-hover:text-blue-500 transition"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                    <Search size={18} className="text-gray-400" />
                  </div>

                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No results found
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Try searching for another page or feature.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                Navigate anywhere in NexusFlow
              </span>

              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
                  Enter
                </span>

                <span>Open</span>

                <span className="border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
                  Esc
                </span>

                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}