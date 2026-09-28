import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  ShieldCheck,
  UserPlus,
  UserRoundCog,
  Webhook,
  Trash2,
  Pencil,
  Clock3,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getWorkspaceActivityLogs } from "../utils/activityLogger";
import { db } from "../firebase";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function ActivityLog() {
  const { user, userRole, workspaceId, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, [user?.uid, workspaceId]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchActivities = async () => {
    if (!workspaceId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    try {
      const logs = await getWorkspaceActivityLogs(workspaceId);
      setActivities(logs);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => ({
    project_created: FolderKanban,
    project_updated: Pencil,
    project_deleted: Trash2,
    task_created: ListTodo,
    task_updated: Pencil,
    task_deleted: Trash2,
    task_status_changed: CheckCircle2,
    task_priority_changed: ActivityIcon,
    task_assignee_changed: UserRoundCog,
    role_changed: ShieldCheck,
    member_invited: UserPlus,
    invitation_accepted: CheckCircle2,
    webhook_created: Webhook,
    webhook_updated: Pencil,
    webhook_deleted: Trash2,
  }[action] || ActivityIcon);

  const getActionLabel = (action) => ({
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
  }[action] || action.replaceAll("_", " "));

  const getTone = (action) => {
    if (action.includes("deleted")) return { icon: "bg-red-50 text-red-600", dot: "bg-red-500" };
    if (action.includes("created") || action === "invitation_accepted") return { icon: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" };
    if (action.includes("invited") || action.includes("assignee")) return { icon: "bg-violet-50 text-violet-600", dot: "bg-violet-500" };
    return { icon: "bg-blue-50 text-blue-600", dot: "bg-blue-500" };
  };

  const getDate = (createdAt) => {
    try {
      if (!createdAt) return null;
      if (typeof createdAt.toDate === "function") return createdAt.toDate();
      if (createdAt.seconds) return new Date(createdAt.seconds * 1000);
      return new Date(createdAt);
    } catch {
      return null;
    }
  };

  const formatTime = (createdAt) => {
    const date = getDate(createdAt);
    return date ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Just now";
  };

  const getDateGroup = (createdAt) => {
    const date = getDate(createdAt);
    if (!date) return "Earlier";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((today - day) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return date.toLocaleDateString([], { day: "numeric", month: "short", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  };

  const formatDetailLabel = (key) => key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const formatDetailValue = (key, value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (["fromStatus", "toStatus", "oldValue", "newValue"].includes(key)) return String(value).replaceAll("_", " ");
    return String(value);
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (filterType === "projects") return activity.action.startsWith("project_");
      if (filterType === "tasks") return activity.action.startsWith("task_");
      if (filterType === "team") return ["role_changed", "member_invited", "invitation_accepted"].includes(activity.action);
      return true;
    });
  }, [activities, filterType]);

  const groupedActivities = useMemo(() => filteredActivities.reduce((groups, activity) => {
    const group = getDateGroup(activity.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(activity);
    return groups;
  }, {}), [filteredActivities]);

  const handleLogout = async () => logout();

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-900">
        <Sidebar userRole={userRole} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={userData} userRole={userRole} onLogout={handleLogout} />
          <main className="flex flex-1 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </main>
        </div>
      </div>
    );
  }

  const filters = [
    { value: "all", label: "All activity" },
    { value: "projects", label: "Projects" },
    { value: "tasks", label: "Tasks" },
    { value: "team", label: "Team" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar userRole={userRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={userData} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
                    <ActivityIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">Workspace timeline</span>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Activity</h1>
                <p className="mt-1.5 text-sm text-slate-500">A clear history of everything happening across your workspace.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                <Clock3 className="h-4 w-4" />
                <span>{filteredActivities.length} events</span>
              </div>
            </div>

            <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-wrap gap-1">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFilterType(filter.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filterType === filter.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="hidden items-center gap-2 px-3 text-xs text-slate-400 sm:flex">
                <ActivityIcon className="h-3.5 w-3.5" />
                Live workspace history
              </div>
            </div>

            {filteredActivities.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedActivities).map(([group, groupActivities]) => (
                  <section key={group}>
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{group}</h2>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {groupActivities.map((log, index) => {
                        const Icon = getActionIcon(log.action);
                        const tone = getTone(log.action);
                        const details = Object.entries(log.details || {});

                        return (
                          <article key={log.id} className={`group relative flex gap-4 px-5 py-4 transition hover:bg-slate-50 ${index !== groupActivities.length - 1 ? "border-b border-slate-100" : ""}`}>
                            <div className="relative shrink-0">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}>
                                <Icon className="h-[18px] w-[18px]" />
                              </div>
                              {index !== groupActivities.length - 1 && <div className="absolute left-1/2 top-11 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-slate-100" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900">{log.userName || log.userEmail || "Workspace member"}</span>
                                  <span className="mx-2 text-slate-300">·</span>
                                  <span className="text-sm font-medium text-slate-600">{getActionLabel(log.action)}</span>
                                </div>
                                <time className="shrink-0 text-xs text-slate-400">{formatTime(log.createdAt)}</time>
                              </div>

                              {details.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {details.map(([key, value]) => (
                                    <span key={key} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                                      <span className="font-medium text-slate-400">{formatDetailLabel(key)}:</span>
                                      <span className="max-w-[280px] truncate">{formatDetailValue(key, value)}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                                Workspace event
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <ActivityIcon className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-800">No activity found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Workspace activity will appear here when members create, update, or manage projects, tasks, and team members.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}