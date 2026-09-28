import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { logActivity } from "../utils/activityLogger";
import { dispatchWebhookEvent } from "../utils/webhookDispatcher";
import DeleteProjectModal from "./projects/DeleteProjectModel";

import Sidebar from "./Sidebar";
import Header from "./Header";

import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Archive,
} from "lucide-react";

export default function Projects() {
  const { user, userRole, workspaceId, logout } = useAuth();
  const navigate = useNavigate();

  const canManageProjects = ["owner", "admin", "manager"].includes(userRole);
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [menuProjectId, setMenuProjectId] = useState(null);

  const [deleteProject, setDeleteProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
  });

  useEffect(() => {
    if (user && workspaceId) {
      loadPageData();
    }
  }, [user, workspaceId]);

  const loadPageData = async () => {
    setLoading(true);

    try {
      const [userSnapshot, projectsSnapshot] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(
          query(
            collection(db, "projects"),
            where("workspaceId", "==", workspaceId),
          ),
        ),
      ]);

      if (userSnapshot.exists()) {
        setUserData(userSnapshot.data());
      }

      const projectData = projectsSnapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        ...projectDoc.data(),
      }));

      projectData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      setProjects(projectData);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openCreateModal = () => {
    setEditingProject(null);

    setForm({
      name: "",
      description: "",
      status: "planning",
      priority: "medium",
    });

    setShowModal(true);
    setMenuProjectId(null);
  };

  const openEditModal = (project) => {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
    });

    setShowModal(true);
    setMenuProjectId(null);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProject(null);
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !workspaceId) {
      alert(
        "Workspace information is not available. Please refresh and try again.",
      );
      return;
    }

    if (!form.name.trim()) {
      return;
    }

    setSaving(true);

    try {
      const projectName = form.name.trim();

      const actorName =
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        user?.displayName ||
        user?.email ||
        "Workspace member";

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), {
          name: projectName,
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          updatedAt: serverTimestamp(),
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName: actorName,
          userEmail: user.email,
          action: "project_updated",
          details: {
            projectId: editingProject.id,
            projectName,
            status: form.status,
            priority: form.priority,
          },
        });
        await dispatchWebhookEvent({
          workspaceId,
          event: "project.updated",
          data: {
            projectId: editingProject.id,
            projectName,
            status: form.status,
            priority: form.priority,
          },
        });
      } else {
        const projectRef = await addDoc(collection(db, "projects"), {
          name: projectName,
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,

          workspaceId,
          ownerId: user.uid,
          ownerEmail: user.email,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName: actorName,
          userEmail: user.email,
          action: "project_created",
          details: {
            projectId: projectRef.id,
            projectName,
            status: form.status,
            priority: form.priority,
          },
        });
        await dispatchWebhookEvent({
          workspaceId,
          event: "project.created",
          data: {
            projectId: projectRef.id,
            projectName,
            status: form.status,
            priority: form.priority,
          },
        });
      }

      await loadPageData();
      closeModal();
    } catch (error) {
      console.error("Error saving project:", error);

      alert("Unable to save the project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project) => {
    setMenuProjectId(null);
    setDeleteProject(project);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProject) return;

    try {
      setDeletingProject(true);

      await deleteDoc(doc(db, "projects", deleteProject.id));

      await dispatchWebhookEvent({
        workspaceId,
        event: "project.deleted",
        data: {
          projectId: deleteProject.id,
          projectName: deleteProject.name,
        },
      });
      const actorName =
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        user?.displayName ||
        user?.email ||
        "Workspace member";

      await logActivity({
        workspaceId,
        userId: user.uid,
        userName: actorName,
        userEmail: user.email,
        action: "project_deleted",
        details: {
          projectId: deleteProject.id,
          projectName: deleteProject.name,
        },
      });

      setProjects((previous) =>
        previous.filter((project) => project.id !== deleteProject.id),
      );

      setDeleteProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      alert(`Unable to delete the project.\n\n${error.code || error.message}`);
    } finally {
      setDeletingProject(false);
    }
  };
  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        project.name?.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

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

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#070B14] text-gray-900 dark:text-white">
      <Sidebar userRole={userRole} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header user={headerUser} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto px-5 sm:px-7 lg:px-10 py-7">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Workspace</span>
                  <span>›</span>
                  <span>Projects</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Projects
                </h1>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Organize your team's work and keep projects moving.
                </p>
              </div>

              {canManageProjects && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] transition"
                >
                  <Plus size={17} />
                  New project
                </button>
              )}
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search projects..."
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1320] pl-11 pr-4 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="appearance-none h-11 min-w-[150px] px-10 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1320] text-sm font-medium text-gray-600 dark:text-gray-300 outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="all">All statuses</option>

                  <option value="planning">Planning</option>

                  <option value="active">Active</option>

                  <option value="completed">Completed</option>

                  <option value="archived">Archived</option>
                </select>

                <SlidersHorizontal
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* PROJECT COUNT */}
            {!loading && projects.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {filteredProjects.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {projects.length}
                  </span>{" "}
                  projects
                </p>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="min-h-[420px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={28} className="animate-spin text-blue-500" />

                  <p className="text-sm text-gray-500">Loading projects...</p>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && projects.length === 0 && (
              <EmptyState
                onCreate={openCreateModal}
                canManageProjects={canManageProjects}
              />
            )}

            {/* NO SEARCH RESULTS */}
            {!loading &&
              projects.length > 0 &&
              filteredProjects.length === 0 && (
                <div className="min-h-[360px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                      <Search size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold">
                      No matching projects
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </div>
              )}

            {/* PROJECT GRID */}
            {!loading && filteredProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    menuOpen={menuProjectId === project.id}
                    onMenu={() =>
                      setMenuProjectId(
                        menuProjectId === project.id ? null : project.id,
                      )
                    }
                    onEdit={() => openEditModal(project)}
                    onDelete={() => handleDelete(project)}
                    onOpen={() => navigate(`/projects/${project.id}`)}
                    canManageProjects={canManageProjects}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <ProjectModal
          form={form}
          editingProject={editingProject}
          saving={saving}
          onChange={handleFormChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
      <DeleteProjectModal
        project={deleteProject}
        deleting={deletingProject}
        onCancel={() => setDeleteProject(null)}
        onConfirm={confirmDeleteProject}
      />
    </div>
  );
}

/* =====================================================
   PROJECT CARD
===================================================== */

function ProjectCard({
  project,
  menuOpen,
  onMenu,
  onEdit,
  onDelete,
  onOpen,
  canManageProjects,
}) {
  return (
    <div
      onClick={onOpen}
      className="relative bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <FolderKanban size={21} />
        </div>

        {canManageProjects && (
          <div
            className="relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onMenu}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <MoreHorizontal size={19} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-xl p-1">
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {project.name}
          </h3>

          <StatusBadge status={project.status} />
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed min-h-[42px]">
          {project.description || "No description added yet."}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              project.priority === "high"
                ? "bg-red-500"
                : project.priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
            }`}
          />

          <span className="text-xs font-medium text-gray-500 capitalize">
            {project.priority} priority
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarDays size={13} />
          {formatDate(project.createdAt)}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const config = {
    planning: {
      label: "Planning",
      className: "bg-blue-500/10 text-blue-500",
    },

    active: {
      label: "Active",
      className: "bg-emerald-500/10 text-emerald-500",
    },

    completed: {
      label: "Completed",
      className: "bg-purple-500/10 text-purple-500",
    },

    archived: {
      label: "Archived",
      className: "bg-gray-500/10 text-gray-500",
    },
  };

  const current = config[status] || config.planning;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold ${current.className}`}
    >
      {status === "completed" ? (
        <CheckCircle2 size={11} />
      ) : status === "archived" ? (
        <Archive size={11} />
      ) : (
        <Clock3 size={11} />
      )}

      {current.label}
    </span>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({ onCreate, canManageProjects }) {
  return (
    <div className="min-h-[480px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <FolderKanban size={30} />
        </div>

        <h2 className="mt-6 text-xl font-semibold">No projects yet</h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Projects help you organize tasks, collaborate with your team, and
          track progress from one place.
        </p>

        {canManageProjects && (
          <button
            onClick={onCreate}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus size={17} />
            Create your first project
          </button>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   MODAL
===================================================== */

function ProjectModal({
  form,
  editingProject,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
          <div>
            <h2 className="text-lg font-semibold">
              {editingProject ? "Edit project" : "Create project"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {editingProject
                ? "Update your project details."
                : "Add a new project to your workspace."}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <X size={19} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. Website Redesign"
              required
              autoFocus
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="What is this project about?"
              rows={4}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 py-3 text-sm outline-none resize-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>

          {/* STATUS + PRIORITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) => onChange("status", event.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50"
              >
                <option value="planning">Planning</option>

                <option value="active">Active</option>

                <option value="completed">Completed</option>

                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(event) => onChange("priority", event.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50"
              >
                <option value="low">Low</option>

                <option value="medium">Medium</option>

                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingProject ? "Save changes" : "Create project"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   DATE
===================================================== */

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
