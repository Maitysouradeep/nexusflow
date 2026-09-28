import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

import Sidebar from "./Sidebar";
import Header from "./Header";

import {
  ArrowLeft,
  FolderKanban,
  CheckSquare,
  Clock3,
  CheckCircle2,
  Circle,
  AlertCircle,
  CalendarDays,
  Flag,
  Plus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { user, userRole, workspaceId, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && workspaceId && projectId) {
      loadProject();
    }
  }, [user, workspaceId, projectId]);

  const loadProject = async () => {
    setLoading(true);

    try {
      const [userSnapshot, projectSnapshot, tasksSnapshot] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),

        getDoc(doc(db, "projects", projectId)),

        getDocs(
          query(
            collection(db, "tasks"),
            where("workspaceId", "==", workspaceId),
          ),
        ),
      ]);

      // ---------------------------------------------
      // User profile
      // ---------------------------------------------

      if (userSnapshot.exists()) {
        setUserData(userSnapshot.data());
      }

      // ---------------------------------------------
      // Project not found
      // ---------------------------------------------

      if (!projectSnapshot.exists()) {
        setProject(null);
        return;
      }

      const projectData = projectSnapshot.data();

      // ---------------------------------------------
      // Workspace access check
      // ---------------------------------------------

      if (projectData.workspaceId !== workspaceId) {
        console.warn("Project belongs to another workspace.");

        setProject(null);
        return;
      }

      // ---------------------------------------------
      // Set project
      // ---------------------------------------------

      setProject({
        id: projectSnapshot.id,
        ...projectData,
      });

      // ---------------------------------------------
      // Project tasks
      // ---------------------------------------------

      const projectTasks = tasksSnapshot.docs
        .map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
        }))
        .filter((task) => task.projectId === projectId);

      // Newest first
      projectTasks.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;

        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      setTasks(projectTasks);
    } catch (error) {
      console.error("Error loading project:", error);

      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const firstName =
    userData?.firstName || user?.displayName?.split(" ")[0] || "User";

  const lastName =
    userData?.lastName ||
    user?.displayName?.split(" ").slice(1).join(" ") ||
    "";

  const headerUser = {
    firstName,
    lastName,
    email: user?.email,
  };

  const taskStats = useMemo(() => {
    const total = tasks.length;

    const todo = tasks.filter((task) => task.status === "todo").length;

    const inProgress = tasks.filter(
      (task) => task.status === "in_progress",
    ).length;

    const review = tasks.filter((task) => task.status === "review").length;

    const done = tasks.filter((task) => task.status === "done").length;

    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return {
      total,
      todo,
      inProgress,
      review,
      done,
      progress,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#070B14] text-white">
        <Sidebar userRole={userRole} />

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-blue-500" />

            <p className="text-sm text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-[#070B14] text-white">
        <Sidebar userRole={userRole} />

        <div className="flex-1 flex flex-col">
          <Header
            user={headerUser}
            userRole={userRole}
            onLogout={handleLogout}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <FolderKanban size={30} />
              </div>

              <h1 className="mt-5 text-xl font-semibold">Project not found</h1>

              <p className="mt-2 text-sm text-gray-500">
                This project may have been deleted or you don't have access to
                it.
              </p>

              <button
                onClick={() => navigate("/projects")}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold"
              >
                <ArrowLeft size={16} />
                Back to projects
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#070B14] text-gray-900 dark:text-white">
      <Sidebar userRole={userRole} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header user={headerUser} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-7">
            {/* BACK */}
            <button
              onClick={() => navigate("/projects")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to projects
            </button>

            {/* PROJECT HEADER */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FolderKanban size={28} />
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      {project.name}
                    </h1>

                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <p className="mt-2 max-w-2xl text-gray-500 dark:text-gray-400">
                    {project.description || "No description added yet."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/tasks")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/10"
              >
                <Plus size={17} />
                Add task
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <StatCard
                icon={<CheckSquare size={19} />}
                label="Total tasks"
                value={taskStats.total}
              />

              <StatCard
                icon={<Clock3 size={19} />}
                label="In progress"
                value={taskStats.inProgress}
              />

              <StatCard
                icon={<AlertCircle size={19} />}
                label="In review"
                value={taskStats.review}
              />

              <StatCard
                icon={<CheckCircle2 size={19} />}
                label="Completed"
                value={taskStats.done}
              />
            </div>

            {/* PROGRESS */}
            <section className="mt-6 bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Project progress</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Based on completed tasks
                  </p>
                </div>

                <span className="text-2xl font-bold">
                  {taskStats.progress}%
                </span>
              </div>

              <div className="mt-5 h-3 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${taskStats.progress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{taskStats.done} completed</span>

                <span>{taskStats.total} total</span>
              </div>
            </section>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
              {/* TASKS */}
              <section className="bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Project tasks</h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Tasks connected to this project
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/tasks")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-400"
                  >
                    View board
                    <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="p-4">
                  {tasks.length === 0 ? (
                    <div className="py-14 text-center">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                        <CheckSquare size={22} />
                      </div>

                      <h3 className="mt-4 font-semibold">No tasks yet</h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Add tasks to start tracking this project.
                      </p>

                      <button
                        onClick={() => navigate("/tasks")}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold"
                      >
                        <Plus size={16} />
                        Create task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* PROJECT INFORMATION */}
              <section className="bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
                  <h2 className="font-semibold">Project information</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Project configuration
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <InfoRow
                    icon={<Flag size={17} />}
                    label="Priority"
                    value={
                      project.priority
                        ? `${capitalize(project.priority)} priority`
                        : "Not set"
                    }
                  />

                  <InfoRow
                    icon={<CalendarDays size={17} />}
                    label="Created"
                    value={formatDate(project.createdAt)}
                  />

                  <InfoRow
                    icon={<CalendarDays size={17} />}
                    label="Last updated"
                    value={formatDate(project.updatedAt)}
                  />

                  <InfoRow
                    icon={<Circle size={17} />}
                    label="Status"
                    value={capitalize(project.status)}
                  />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
        {icon}
      </div>

      <p className="mt-4 text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/* =====================================================
   TASK ROW
===================================================== */

function TaskRow({ task }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
        <CheckSquare size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{task.title}</p>

        <p className="text-xs text-gray-500 mt-1 truncate">
          {task.description || "No description"}
        </p>
      </div>

      <TaskStatusBadge status={task.status} />

      <span
        className={`hidden sm:block text-xs font-medium capitalize ${
          task.priority === "high"
            ? "text-red-500"
            : task.priority === "medium"
              ? "text-yellow-500"
              : "text-emerald-500"
        }`}
      >
        {task.priority || "medium"}
      </span>
    </div>
  );
}

/* =====================================================
   TASK STATUS
===================================================== */

function TaskStatusBadge({ status }) {
  const config = {
    todo: {
      label: "To do",
      icon: Circle,
      className: "bg-gray-500/10 text-gray-500",
    },

    in_progress: {
      label: "In progress",
      icon: Clock3,
      className: "bg-blue-500/10 text-blue-500",
    },

    review: {
      label: "Review",
      icon: AlertCircle,
      className: "bg-yellow-500/10 text-yellow-500",
    },

    done: {
      label: "Done",
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-500",
    },
  };

  const current = config[status] || config.todo;

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap ${current.className}`}
    >
      <Icon size={11} />
      {current.label}
    </span>
  );
}

/* =====================================================
   PROJECT STATUS
===================================================== */

function ProjectStatusBadge({ status }) {
  const config = {
    planning: "bg-blue-500/10 text-blue-500",
    active: "bg-emerald-500/10 text-emerald-500",
    completed: "bg-purple-500/10 text-purple-500",
    archived: "bg-gray-500/10 text-gray-500",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
        config[status] || config.planning
      }`}
    >
      {capitalize(status)}
    </span>
  );
}

/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 flex items-center justify-center">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>

        <p className="mt-1 text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function capitalize(value) {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ");
}

function formatDate(value) {
  if (!value) return "—";

  try {
    if (value?.toDate) {
      return value.toDate().toLocaleDateString();
    }

    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}
