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

import Sidebar from "./Sidebar";
import Header from "./Header";
import TaskComments from "./TaskComments";
import TaskActivity from "./TaskActivity";
import DeleteTaskModal from "./tasks/DeleteTaskModel";
import { logActivity } from "../utils/activityLogger";
import { dispatchWebhookEvent } from "../utils/webhookDispatcher";

import {
  CheckSquare,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  Clock3,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

export default function Tasks() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const canManageTasks = ["owner", "admin", "manager"].includes(userRole);
  const canCreateTasks = ["owner", "admin", "manager"].includes(userRole);
  const canComment = userRole !== "viewer";

  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [menuTaskId, setMenuTaskId] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    assigneeName: "",
    status: "todo",
    priority: "medium",
  });

  useEffect(() => {
    if (user) {
      loadTaskData();
    }
  }, [user]);

  const loadTaskData = async () => {
    setLoading(true);

    try {
      // First get the current user's workspace
      const userSnapshot = await getDoc(doc(db, "users", user.uid));

      if (!userSnapshot.exists()) {
        throw new Error("User profile not found.");
      }

      const currentUserData = userSnapshot.data();

      setUserData(currentUserData);

      const workspaceId = currentUserData.workspaceId;

      if (!workspaceId) {
        console.warn("User does not have a workspaceId.");
        setProjects([]);
        setTasks([]);
        return;
      }

      // Load everything belonging to the current workspace
      const [projectsSnapshot, tasksSnapshot, membersSnapshot] =
        await Promise.all([
          getDocs(
            query(
              collection(db, "projects"),
              where("workspaceId", "==", workspaceId),
            ),
          ),

          getDocs(
            query(
              collection(db, "tasks"),
              where("workspaceId", "==", workspaceId),
            ),
          ),

          getDocs(
            query(
              collection(db, "users"),
              where("workspaceId", "==", workspaceId),
            ),
          ),
        ]);

      const projectData = projectsSnapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        ...projectDoc.data(),
      }));

      const memberData = membersSnapshot.docs.map((memberDoc) => ({
        id: memberDoc.id,
        ...memberDoc.data(),
      }));

      const taskData = tasksSnapshot.docs.map((taskDoc) => {
        const task = {
          id: taskDoc.id,
          ...taskDoc.data(),
        };

        // Find the current member using assigneeId
        const assignedMember = memberData.find(
          (member) => member.id === task.assigneeId,
        );

        // Always derive the displayed assignee name
        const assigneeName = assignedMember
          ? `${assignedMember.firstName || ""} ${assignedMember.lastName || ""}`.trim() ||
            assignedMember.email
          : "";

        return {
          ...task,
          assigneeName,
        };
      });

      taskData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      setProjects(projectData);
      setTasks(taskData);
      setMembers(memberData);
    } catch (error) {
      console.error("Error loading workspace tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openCreateModal = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      projectId: projects[0]?.id || "",
      assigneeId: user?.uid || "",
      assigneeName:
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        user?.displayName ||
        user?.email ||
        "",
      status: "todo",
      priority: "medium",
    });

    setShowModal(true);
    setMenuTaskId(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId || "",
      assigneeId: task.assigneeId || "",
      assigneeName: task.assigneeName || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
    });

    setShowModal(true);
    setMenuTaskId(null);
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setMenuTaskId(null);
  };

  const closeModal = (force = false) => {
    if (saving && !force) return;

    setShowModal(false);
    setEditingTask(null);
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !form.title.trim()) {
      return;
    }

    setSaving(true);

    try {
      const selectedProject = projects.find(
        (project) => project.id === form.projectId,
      );

      const workspaceId = userData?.workspaceId;

      if (!workspaceId) {
        throw new Error("Your account is not connected to a workspace.");
      }

      const actorName =
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        user?.displayName ||
        user?.email ||
        "Workspace member";

      if (editingTask) {
        await updateDoc(doc(db, "tasks", editingTask.id), {
          title: form.title.trim(),
          description: form.description.trim(),
          projectId: form.projectId,
          projectName: selectedProject?.name || "",
          assigneeId: form.assigneeId || "",
          assigneeName: form.assigneeName || "",
          status: form.status,
          priority: form.priority,
          updatedAt: serverTimestamp(),
        });
        await dispatchWebhookEvent({
          workspaceId,
          event: "task.updated",
          data: {
            taskId: editingTask.id,
            title: form.title.trim(),
            projectId: form.projectId,
            projectName: selectedProject?.name || "",
            status: form.status,
            priority: form.priority,
            assigneeId: form.assigneeId || "",
            assigneeName: form.assigneeName || "",
          },
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName: actorName,
          userEmail: user.email,
          action: "task_updated",
          details: {
            taskId: editingTask.id,
            taskTitle: form.title.trim(),
            projectName: selectedProject?.name || "",
            status: form.status,
            priority: form.priority,
          },
        });

        if (editingTask.status !== form.status) {
          const statusLabels = {
            todo: "To do",
            in_progress: "In progress",
            review: "Review",
            done: "Done",
          };

          await addDoc(
            collection(db, "tasks", editingTask.id, "activity"),
            {
              type: "status_changed",
              message: `${actorName} changed status from ${
                statusLabels[editingTask.status] ||
                editingTask.status ||
                "Unknown"
              } to ${statusLabels[form.status] || form.status}`,
              userId: user.uid,
              userName: actorName,
              createdAt: serverTimestamp(),
            },
          );

          await logActivity({
            workspaceId,
            userId: user.uid,
            userName: actorName,
            userEmail: user.email,
            action: "task_status_changed",
            details: {
              taskId: editingTask.id,
              taskTitle: form.title.trim(),
              projectName: selectedProject?.name || "",
              fromStatus:
                statusLabels[editingTask.status] ||
                editingTask.status ||
                "Unknown",
              toStatus: statusLabels[form.status] || form.status,
            },
          });
        }
        if (editingTask.priority !== form.priority) {
          const priorityLabels = {
            low: "Low",
            medium: "Medium",
            high: "High",
          };

          await logActivity({
            workspaceId,
            userId: user.uid,
            userName: actorName,
            userEmail: user.email,
            action: "task_priority_changed",
            details: {
              taskId: editingTask.id,
              taskTitle: form.title.trim(),
              projectName: selectedProject?.name || "",
              fromPriority:
                priorityLabels[editingTask.priority] ||
                editingTask.priority ||
                "Unknown",
              toPriority: priorityLabels[form.priority] || form.priority,
            },
          });
        }
        if (editingTask.assigneeId !== form.assigneeId) {
          const oldMember = members.find(
            (member) => member.id === editingTask.assigneeId,
          );

          const newMember = members.find(
            (member) => member.id === form.assigneeId,
          );

          const oldAssigneeName = oldMember
            ? `${oldMember.firstName || ""} ${oldMember.lastName || ""}`.trim() ||
              oldMember.email
            : "Unassigned";

          const newAssigneeName = newMember
            ? `${newMember.firstName || ""} ${newMember.lastName || ""}`.trim() ||
              newMember.email
            : "Unassigned";

          await logActivity({
            workspaceId,
            userId: user.uid,
            userName: actorName,
            userEmail: user.email,
            action: "task_assignee_changed",
            details: {
              taskId: editingTask.id,
              taskTitle: form.title.trim(),
              projectName: selectedProject?.name || "",
              fromAssignee: oldAssigneeName,
              toAssignee: newAssigneeName,
            },
          });
        }
      } else {
        const taskRef = await addDoc(collection(db, "tasks"), {
          title: form.title.trim(),
          description: form.description.trim(),

          projectId: form.projectId,
          projectName: selectedProject?.name || "",

          status: form.status,
          priority: form.priority,

          // Workspace ownership
          workspaceId,

          // Creator
          ownerId: user.uid,
          ownerEmail: user.email,

          assigneeId: form.assigneeId || "",
          assigneeName: form.assigneeName || "",

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await dispatchWebhookEvent({
          workspaceId,
          event: "task.created",
          data: {
            taskId: taskRef.id,
            title: form.title.trim(),
            projectId: form.projectId,
            projectName: selectedProject?.name || "",
            status: form.status,
            priority: form.priority,
            assigneeId: form.assigneeId || "",
            assigneeName: form.assigneeName || "",
          },
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName: actorName,
          userEmail: user.email,
          action: "task_created",
          details: {
            taskId: taskRef.id,
            taskTitle: form.title.trim(),
            projectName: selectedProject?.name || "",
            status: form.status,
            priority: form.priority,
          },
        });
      }

      await loadTaskData();
      closeModal(true);
    } catch (error) {
      console.error("Error saving task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      alert("Unable to save the task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateTaskFromDetails = async (field, value) => {
    if (!selectedTask) return;

    const canUpdateField =
      canManageTasks ||
      (field === "status" &&
        userRole === "member" &&
        selectedTask.assigneeId === user.uid);

    if (!canUpdateField) {
      alert("You don't have permission to change this task.");
      return;
    }

    const oldValue = selectedTask[field];

    if (oldValue === value) {
      return;
    }

    const workspaceId = userData?.workspaceId;

    if (!workspaceId) {
      console.error("Task update failed: workspaceId is missing.");
      return;
    }

    const userName =
      `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
      user?.displayName ||
      user?.email ||
      "Unknown user";

    const statusLabels = {
      todo: "To do",
      in_progress: "In progress",
      review: "Review",
      done: "Done",
    };

    const priorityLabels = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    try {
      setDetailsSaving(true);

      const taskRef = doc(db, "tasks", selectedTask.id);

      let assigneeName = selectedTask.assigneeName || "";

      if (field === "assigneeId") {
        const newMember = members.find((member) => member.id === value);

        assigneeName = newMember
          ? `${newMember.firstName || ""} ${newMember.lastName || ""}`.trim() ||
            newMember.email
          : "";
      }

      const taskUpdate = {
        [field]: value,
        updatedAt: serverTimestamp(),
        ...(field === "assigneeId" ? { assigneeName } : {}),
      };

      // 1. Primary task update
      await updateDoc(taskRef, taskUpdate);

      const updatedTask = {
        ...selectedTask,
        [field]: value,
        ...(field === "assigneeId" ? { assigneeName } : {}),
      };

      // 2. Task-level activity
      if (field === "status") {
        await addDoc(collection(db, "tasks", selectedTask.id, "activity"), {
          type: "status_changed",
          message: `${userName} changed status from ${
            statusLabels[oldValue] || oldValue || "Unknown"
          } to ${statusLabels[value] || value}`,
          userId: user.uid,
          userName,
          createdAt: serverTimestamp(),
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName,
          userEmail: user.email,
          action: "task_status_changed",
          details: {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            projectName: selectedTask.projectName || "",
            fromStatus: statusLabels[oldValue] || oldValue,
            toStatus: statusLabels[value] || value,
          },
        });
      }

      if (field === "priority") {
        await addDoc(collection(db, "tasks", selectedTask.id, "activity"), {
          type: "priority_changed",
          message: `${userName} changed priority from ${
            priorityLabels[oldValue] || oldValue || "Unknown"
          } to ${priorityLabels[value] || value}`,
          userId: user.uid,
          userName,
          createdAt: serverTimestamp(),
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName,
          userEmail: user.email,
          action: "task_priority_changed",
          details: {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            projectName: selectedTask.projectName || "",
            fromPriority:
              priorityLabels[oldValue] || oldValue || "Unknown",
            toPriority: priorityLabels[value] || value,
          },
        });
      }

      if (field === "assigneeId") {
        const oldMember = members.find((member) => member.id === oldValue);
        const newMember = members.find((member) => member.id === value);

        const oldAssigneeName = oldMember
          ? `${oldMember.firstName || ""} ${oldMember.lastName || ""}`.trim() ||
            oldMember.email
          : "Unassigned";

        const newAssigneeName = newMember
          ? `${newMember.firstName || ""} ${newMember.lastName || ""}`.trim() ||
            newMember.email
          : "Unassigned";

        let message;

        if (newAssigneeName === "Unassigned") {
          message = `${userName} unassigned the task from ${oldAssigneeName}`;
        } else if (oldAssigneeName === "Unassigned") {
          message = `${userName} assigned the task to ${newAssigneeName}`;
        } else {
          message = `${userName} changed the assignee from ${oldAssigneeName} to ${newAssigneeName}`;
        }

        await addDoc(collection(db, "tasks", selectedTask.id, "activity"), {
          type: "assignee_changed",
          message,
          userId: user.uid,
          userName,
          createdAt: serverTimestamp(),
        });

        await logActivity({
          workspaceId,
          userId: user.uid,
          userName,
          userEmail: user.email,
          action: "task_assignee_changed",
          details: {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            projectName: selectedTask.projectName || "",
            fromAssignee: oldAssigneeName,
            toAssignee: newAssigneeName,
          },
        });
      }

      // 3. Webhook event for every real task change
      await dispatchWebhookEvent({
        workspaceId,
        event: "task.updated",
        data: {
          taskId: updatedTask.id,
          title: updatedTask.title || "",
          projectId: updatedTask.projectId || "",
          projectName: updatedTask.projectName || "",
          status: updatedTask.status || "todo",
          priority: updatedTask.priority || "medium",
          assigneeId: updatedTask.assigneeId || "",
          assigneeName: updatedTask.assigneeName || "",
          changedField: field,
          oldValue: oldValue ?? null,
          newValue: value ?? null,
        },
      });

      // 4. Keep both views synchronized immediately
      setSelectedTask(updatedTask);

      setTasks((previous) =>
        previous.map((task) =>
          task.id === selectedTask.id ? updatedTask : task,
        ),
      );
    } catch (error) {
      console.error("Task update failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Reload the real Firestore state so UI never stays stale.
      await loadTaskData();

      alert("Unable to update the task. Please try again.");
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleDelete = (task) => {
    setMenuTaskId(null);
    setDeleteTask(task);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTask) return;

    try {
      setDeletingTask(true);

      const actorName =
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        user?.displayName ||
        user?.email ||
        "Workspace member";

      const workspaceId = userData?.workspaceId;

      if (!workspaceId) {
        throw new Error("Your account is not connected to a workspace.");
      }

      const deletedTask = {
        ...deleteTask,
      };

      // 1. Delete the task first
      await deleteDoc(doc(db, "tasks", deletedTask.id));

      // 2. Send task.deleted webhook
      await dispatchWebhookEvent({
        workspaceId,
        event: "task.deleted",
        data: {
          taskId: deletedTask.id,
          title: deletedTask.title || "",
          projectId: deletedTask.projectId || "",
          projectName: deletedTask.projectName || "",
          status: deletedTask.status || "todo",
          priority: deletedTask.priority || "medium",
          assigneeId: deletedTask.assigneeId || "",
          assigneeName: deletedTask.assigneeName || "",
        },
      });

      // 3. Workspace activity
      await logActivity({
        workspaceId,
        userId: user.uid,
        userName: actorName,
        userEmail: user.email,
        action: "task_deleted",
        details: {
          taskId: deletedTask.id,
          taskTitle: deletedTask.title,
          projectName: deletedTask.projectName || "",
        },
      });

      // 4. Remove from UI immediately
      setTasks((previous) =>
        previous.filter((item) => item.id !== deletedTask.id),
      );

      if (selectedTask?.id === deletedTask.id) {
        setSelectedTask(null);
      }

      setDeleteTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      await loadTaskData();

      alert(`Unable to delete the task.\n\n${error.code || error.message}`);
    } finally {
      setDeletingTask(false);
    }
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (event, status) => {
    event.preventDefault();

    setDragOverStatus(status);
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    if (!draggedTaskId) return;

    const task = tasks.find((item) => item.id === draggedTaskId);

    if (!task) {
      handleDragEnd();
      return;
    }

    const canChangeStatus =
      ["owner", "admin", "manager"].includes(userRole) ||
      (userRole === "member" && task.assigneeId === user.uid);

    if (!canChangeStatus) {
      handleDragEnd();
      return;
    }

    if (task.status === newStatus) {
      handleDragEnd();
      return;
    }

    const oldStatus = task.status;
    const workspaceId = userData?.workspaceId;

    if (!workspaceId) {
      handleDragEnd();
      return;
    }

    const statusLabels = {
      todo: "To do",
      in_progress: "In progress",
      review: "Review",
      done: "Done",
    };

    const userName =
      `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
      user?.displayName ||
      user?.email ||
      "Unknown user";

    // Optimistic UI update
    setTasks((previous) =>
      previous.map((item) =>
        item.id === draggedTaskId
          ? {
              ...item,
              status: newStatus,
            }
          : item,
      ),
    );

    // Keep the open details modal synchronized too
    setSelectedTask((previous) =>
      previous?.id === draggedTaskId
        ? {
            ...previous,
            status: newStatus,
          }
        : previous,
    );

    try {
      // 1. Update Firestore
      await updateDoc(doc(db, "tasks", draggedTaskId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // 2. Task-level activity
      await addDoc(collection(db, "tasks", draggedTaskId, "activity"), {
        type: "status_changed",
        message: `${userName} changed status from ${
          statusLabels[oldStatus] || oldStatus
        } to ${statusLabels[newStatus] || newStatus}`,
        userId: user.uid,
        userName,
        createdAt: serverTimestamp(),
      });

      // 3. Workspace activity
      await logActivity({
        workspaceId,
        userId: user.uid,
        userName,
        userEmail: user.email,
        action: "task_status_changed",
        details: {
          taskId: draggedTaskId,
          taskTitle: task.title,
          projectName: task.projectName || "",
          fromStatus: statusLabels[oldStatus] || oldStatus,
          toStatus: statusLabels[newStatus] || newStatus,
        },
      });

      // 4. Webhook
      await dispatchWebhookEvent({
        workspaceId,
        event: "task.updated",
        data: {
          taskId: task.id,
          title: task.title || "",
          projectId: task.projectId || "",
          projectName: task.projectName || "",
          status: newStatus,
          priority: task.priority || "medium",
          assigneeId: task.assigneeId || "",
          assigneeName: task.assigneeName || "",
          changedField: "status",
          oldValue: oldStatus,
          newValue: newStatus,
        },
      });
    } catch (error) {
      console.error("Error moving task:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Restore the real Firestore state if the primary update failed.
      await loadTaskData();

      alert("Unable to move the task. Please try again.");
    } finally {
      handleDragEnd();
    }
  };

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search ||
        task.title?.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        task.projectName?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const firstName =
    userData?.firstName || user?.displayName?.split(" ")[0] || "User";

  const lastName =
    userData?.lastName ||
    user?.displayName?.split(" ").slice(1).join(" ") ||
    "";

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#070B14] text-gray-900 dark:text-white">
      <Sidebar userRole={userRole} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          user={{
            firstName,
            lastName,
            email: user?.email,
          }}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto nexus-scroll">
          <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-7">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Workspace</span>
                  <span>›</span>
                  <span>Tasks</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Tasks
                </h1>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Track work, priorities and project progress.
                </p>
              </div>

              {canCreateTasks && (
                <button
                  onClick={openCreateModal}
                  disabled={projects.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Plus size={17} />
                  New task
                </button>
              )}
            </div>

            <DeleteTaskModal
              task={deleteTask}
              deleting={deletingTask}
              onCancel={() => setDeleteTask(null)}
              onConfirm={confirmDeleteTask}
            />

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
                  placeholder="Search tasks..."
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1320] pl-11 pr-4 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 min-w-[160px] rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1320] px-4 text-sm font-medium text-gray-600 dark:text-gray-300 outline-none focus:border-blue-500/50"
              >
                <option value="all">All statuses</option>

                <option value="todo">To do</option>

                <option value="in_progress">In progress</option>

                <option value="review">Review</option>

                <option value="done">Done</option>
              </select>
            </div>

            {/* NO PROJECT WARNING */}
            {!loading && projects.length === 0 && (
              <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <AlertCircle size={19} />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Create a project first
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Tasks belong to projects. Create your first project before
                    adding tasks.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/projects")}
                  className="ml-auto text-sm font-semibold text-blue-500 hover:text-blue-400"
                >
                  View projects
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="min-h-[420px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={28} className="animate-spin text-blue-500" />

                  <p className="text-sm text-gray-500">Loading tasks...</p>
                </div>
              </div>
            )}

            {/* EMPTY */}
            {!loading && projects.length > 0 && tasks.length === 0 && (
              <EmptyTaskState onCreate={openCreateModal} />
            )}

            {/* NO RESULTS */}
            {!loading && tasks.length > 0 && filteredTasks.length === 0 && (
              <div className="min-h-[360px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                    <Search size={25} />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    No matching tasks
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or status filter.
                  </p>
                </div>
              </div>
            )}

            {/* TASK GRID */}
            {/* KANBAN BOARD */}
            {!loading && filteredTasks.length > 0 && (
              <KanbanBoard
                tasks={filteredTasks}
                menuTaskId={menuTaskId}
                draggedTaskId={draggedTaskId}
                dragOverStatus={dragOverStatus}
                canChangeTaskStatus={(task) =>
                  canManageTasks ||
                  (userRole === "member" && task.assigneeId === user?.uid)
                }
                onMenu={(taskId) =>
                  setMenuTaskId(menuTaskId === taskId ? null : taskId)
                }
                onTaskClick={openTaskDetails}
                onEdit={openEditModal}
                onDelete={handleDelete}
                canManageTasks={canManageTasks}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            )}
          </div>
        </main>
      </div>

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          members={members}
          detailsSaving={detailsSaving}
          canManageTasks={canManageTasks}
          canChangeStatus={
            canManageTasks ||
            (userRole === "member" && selectedTask.assigneeId === user.uid)
          }
          onUpdate={updateTaskFromDetails}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            setSelectedTask(null);
            openEditModal(selectedTask);
          }}
        />
      )}
      {/* MODAL */}
      {showModal && (
        <TaskModal
          form={form}
          projects={projects}
          members={members}
          editingTask={editingTask}
          saving={saving}
          onChange={handleFormChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* =====================================================
   TASK CARD
===================================================== */

function TaskCard({
  task,
  menuOpen,
  canManageTasks,
  onMenu,
  onTaskClick,
  onEdit,
  onDelete,
}) {
  return (
    <div
      onClick={onTaskClick}
      className="relative bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
    >
      {/* TOP SECTION */}
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <CheckSquare size={21} />
        </div>

        {/* OWNER / ADMIN / MANAGER MENU */}
        {canManageTasks && (
          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onMenu();
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <MoreHorizontal size={19} />
            </button>

            {menuOpen && (
              <div
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-xl p-1"
              >
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
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

      {/* TASK CONTENT */}
      <div className="mt-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg">{task.title}</h3>

          <TaskStatusBadge status={task.status} />
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed min-h-[42px]">
          {task.description || "No description added yet."}
        </p>
      </div>

      {/* TASK META */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.07]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500 truncate max-w-[150px]">
            {task.projectName || "No project"}
          </span>

          <PriorityBadge priority={task.priority} />
        </div>

        {/* ASSIGNEE */}
        {task.assigneeName && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              {task.assigneeName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400">Assigned to</p>

              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
                {task.assigneeName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   KANBAN BOARD
===================================================== */

function KanbanBoard({
  tasks,
  menuTaskId,
  draggedTaskId,
  dragOverStatus,
  onMenu,
  onEdit,
  onDelete,
  canManageTasks,
  canChangeTaskStatus,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTaskClick,
}) {
  const columns = [
    {
      status: "todo",
      title: "To do",
      description: "Tasks waiting to start",
    },
    {
      status: "in_progress",
      title: "In progress",
      description: "Currently being worked on",
    },
    {
      status: "review",
      title: "Review",
      description: "Waiting for review",
    },
    {
      status: "done",
      title: "Done",
      description: "Completed work",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status,
        );

        const isOver = dragOverStatus === column.status;

        return (
          <div
            key={column.status}
            onDragOver={(event) => onDragOver(event, column.status)}
            onDrop={(event) => onDrop(event, column.status)}
            className={`
              min-h-[500px]
              rounded-2xl
              border
              transition-all
              ${
                isOver
                  ? "border-blue-500/60 bg-blue-500/5 ring-2 ring-blue-500/10"
                  : "border-gray-200 dark:border-white/[0.07] bg-white/50 dark:bg-[#0D1320]/70"
              }
            `}
          >
            {/* COLUMN HEADER */}
            <div className="p-4 border-b border-gray-200 dark:border-white/[0.07]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={column.status} />

                  <h2 className="font-semibold text-sm">{column.title}</h2>
                </div>

                <span className="min-w-6 h-6 px-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center justify-center">
                  {columnTasks.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">{column.description}</p>
            </div>

            {/* TASKS */}
            <div className="p-3 space-y-3">
              {columnTasks.length === 0 ? (
                <div className="min-h-[120px] rounded-xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
                  <p className="text-xs text-gray-400">Drop tasks here</p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const canMoveTask = canChangeTaskStatus(task);

                  return (
                    <div
                      key={task.id}
                      draggable={canMoveTask}
                      onDragStart={() => {
                        if (!canMoveTask) return;

                        onDragStart(task.id);
                      }}
                      onDragEnd={onDragEnd}
                      className={`
                        transition
                        ${
                          canMoveTask
                            ? "cursor-grab active:cursor-grabbing"
                            : "cursor-default"
                        }
                        ${
                          draggedTaskId === task.id
                            ? "opacity-40 scale-[0.98]"
                            : ""
                        }
                      `}
                    >
                      <TaskCard
                        task={task}
                        menuOpen={menuTaskId === task.id}
                        canManageTasks={canManageTasks}
                        onMenu={() => onMenu(task.id)}
                        onTaskClick={() => onTaskClick(task)}
                        onEdit={() => onEdit(task)}
                        onDelete={() => onDelete(task)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    todo: "bg-gray-400",
    in_progress: "bg-blue-500",
    review: "bg-yellow-500",
    done: "bg-emerald-500",
  };

  return (
    <span className={`w-2 h-2 rounded-full ${colors[status] || colors.todo}`} />
  );
}
/* =====================================================
   STATUS
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
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={11} />
      {current.label}
    </span>
  );
}

/* =====================================================
   PRIORITY
===================================================== */

function PriorityBadge({ priority }) {
  const config = {
    low: "text-emerald-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  return (
    <span
      className={`text-xs font-medium capitalize ${
        config[priority] || config.medium
      }`}
    >
      {priority || "medium"}
    </span>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyTaskState({ onCreate }) {
  return (
    <div className="min-h-[480px] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <CheckSquare size={30} />
        </div>

        <h2 className="mt-6 text-xl font-semibold">No tasks yet</h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Create tasks to break your projects into manageable pieces of work.
        </p>

        <button
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus size={17} />
          Create your first task
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   TASK MODAL
===================================================== */

function TaskModal({
  form,
  projects,
  members,
  editingTask,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-visible">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
          <div>
            <h2 className="text-lg font-semibold">
              {editingTask ? "Edit task" : "Create task"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {editingTask
                ? "Update your task details."
                : "Add a new task to your project."}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="e.g. Build login page"
              required
              autoFocus
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 py-3 text-sm outline-none resize-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project
            </label>

            <select
              value={form.projectId}
              onChange={(event) => onChange("projectId", event.target.value)}
              required
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50"
            >
              <option value="">Select a project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>

              <select
                value={form.assigneeId}
                onChange={(event) => {
                  const selectedMember = members.find(
                    (member) => member.id === event.target.value,
                  );

                  onChange("assigneeId", event.target.value);
                  onChange(
                    "assigneeName",
                    selectedMember
                      ? `${selectedMember.firstName || ""} ${
                          selectedMember.lastName || ""
                        }`.trim() ||
                          selectedMember.email ||
                          "Unknown user"
                      : "",
                  );
                }}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50"
              >
                <option value="">Unassigned</option>

                {members.map((member) => {
                  const name =
                    `${member.firstName || ""} ${
                      member.lastName || ""
                    }`.trim() || member.email;

                  return (
                    <option key={member.id} value={member.id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) => onChange("status", event.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 text-sm outline-none focus:border-blue-500/50"
              >
                <option value="todo">To do</option>

                <option value="in_progress">In progress</option>

                <option value="review">Review</option>

                <option value="done">Done</option>
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
              disabled={saving || !form.title.trim() || !form.projectId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : editingTask ? (
                "Save changes"
              ) : (
                "Create task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetails({
  task,
  members,
  detailsSaving,
  canManageTasks,
  canChangeStatus,
  onUpdate,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !detailsSaving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {task.projectName || "No project"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={detailsSaving}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* DESCRIPTION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Description
            </h3>

            <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {task.description || "No description added yet."}
            </p>
          </div>

          {/* EDITABLE DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* STATUS */}
            <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] p-4">
              <label className="block text-xs text-gray-400 mb-2">Status</label>

              <select
                value={task.status || "todo"}
                disabled={detailsSaving || !canChangeStatus}
                onChange={(event) => onUpdate("status", event.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-3 text-sm outline-none focus:border-blue-500/50 disabled:opacity-50"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] p-4">
              <label className="block text-xs text-gray-400 mb-2">
                Priority
              </label>

              <select
                value={task.priority || "medium"}
                disabled={detailsSaving || !canManageTasks}
                onChange={(event) => onUpdate("priority", event.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-3 text-sm outline-none focus:border-blue-500/50 disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {!canManageTasks && (
                <p className="mt-2 text-[11px] text-gray-400">
                  Only managers can change priority.
                </p>
              )}
            </div>

            {/* ASSIGNEE */}
            <div className="sm:col-span-2 rounded-xl border border-gray-200 dark:border-white/[0.07] p-4">
              <label className="block text-xs text-gray-400 mb-2">
                Assignee
              </label>

              <select
                value={task.assigneeId || ""}
                disabled={detailsSaving || !canManageTasks}
                onChange={(event) => onUpdate("assigneeId", event.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-3 text-sm outline-none focus:border-blue-500/50 disabled:opacity-50"
              >
                <option value="">Unassigned</option>

                {members.map((member) => {
                  const name =
                    `${member.firstName || ""} ${
                      member.lastName || ""
                    }`.trim() || member.email;

                  return (
                    <option key={member.id} value={member.id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              {!canManageTasks && (
                <p className="mt-2 text-[11px] text-gray-400">
                  Only managers can change the assignee.
                </p>
              )}
            </div>
          </div>

          {/* SAVING INDICATOR */}
          {detailsSaving && (
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <Loader2 size={14} className="animate-spin" />
              Saving changes...
            </div>
          )}
          <TaskComments taskId={task.id} />
          <TaskActivity taskId={task.id} />
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.07]">
          <button
            onClick={onClose}
            disabled={detailsSaving}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            Close
          </button>

          {canManageTasks && (
            <button
              onClick={onEdit}
              disabled={detailsSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              Edit full task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
