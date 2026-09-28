import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

import Header from "./Header";
import Sidebar from "./Sidebar";

import AnalyticsHeader from "./analytics/AnalyticsHeader";
import AnalyticsStats from "./analytics/AnalyticsStats";
import TaskStatusChart from "./analytics/TaskStatusChart";
import ProjectStatusChart from "./analytics/ProjectStatusChart";
import RoleDistribution from "./analytics/RoleDistribution";
import AnalyticsSummary from "./analytics/AnalyticsSummary";
import ActivityTrend from "./analytics/ActivityTrend";
import ActivityBreakdown from "./analytics/ActivityBreakdown";
import PeriodPerformance from "./analytics/PeriodPerformance";
import TeamWorkload from "./analytics/TeamWorkload";

export default function Analytics() {
  const { user, userRole, workspaceId, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [range, setRange] = useState("7");

  // --------------------------------------------------
  // DATE RANGE
  // --------------------------------------------------

  const getRangeStart = useCallback((selectedRange) => {
    if (selectedRange === "all") {
      return null;
    }

    const days = Number(selectedRange);

    if (!Number.isFinite(days)) {
      return null;
    }

    const start = new Date();

    start.setHours(0, 0, 0, 0);

    // Last 7 days = today + previous 6 days
    start.setDate(start.getDate() - (days - 1));

    return start;
  }, []);

  // --------------------------------------------------
  // DATE HELPER
  // --------------------------------------------------

  const getItemDate = (item) => {
    const value = item?.createdAt;

    if (!value) {
      return null;
    }

    try {
      // Firestore Timestamp
      if (typeof value.toDate === "function") {
        const date = value.toDate();

        return Number.isNaN(date.getTime()) ? null : date;
      }

      // Firestore Timestamp-like object
      if (
        typeof value.seconds === "number" ||
        typeof value._seconds === "number"
      ) {
        const seconds =
          typeof value.seconds === "number" ? value.seconds : value._seconds;

        const date = new Date(seconds * 1000);

        return Number.isNaN(date.getTime()) ? null : date;
      }

      // JavaScript Date
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
      }

      // String / number timestamp
      const date = new Date(value);

      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // --------------------------------------------------
  // ACTIVITY RANGE FILTER
  // --------------------------------------------------

  const filterActivityByRange = (items, selectedRange) => {
    if (selectedRange === "all") {
      return items;
    }

    const rangeStart = getRangeStart(selectedRange);

    if (!rangeStart) {
      return items;
    }

    return items.filter((item) => {
      const itemDate = getItemDate(item);

      if (!itemDate) {
        return false;
      }

      return itemDate >= rangeStart;
    });
  };

  // --------------------------------------------------
  // FETCH ANALYTICS
  // --------------------------------------------------

  const fetchAnalytics = useCallback(
    async (selectedRange = range) => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ---------------------------------------------
        // USERS
        // ---------------------------------------------

        const usersQuery = query(
          collection(db, "users"),
          where("workspaceId", "==", workspaceId),
        );

        const usersSnapshot = await getDocs(usersQuery);

        const users = usersSnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // ---------------------------------------------
        // PROJECTS
        // ---------------------------------------------

        const projectsQuery = query(
          collection(db, "projects"),
          where("workspaceId", "==", workspaceId),
        );

        const projectsSnapshot = await getDocs(projectsQuery);

        const projects = projectsSnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // ---------------------------------------------
        // TASKS
        // ---------------------------------------------

        const tasksQuery = query(
          collection(db, "tasks"),
          where("workspaceId", "==", workspaceId),
        );

        const tasksSnapshot = await getDocs(tasksQuery);

        const tasks = tasksSnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // ---------------------------------------------
        // ACTIVITY LOGS
        // ---------------------------------------------

        const activityQuery = query(
          collection(db, "activityLogs"),
          where("workspaceId", "==", workspaceId),
        );

        const activitySnapshot = await getDocs(activityQuery);

        const allActivityLogs = activitySnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // ---------------------------------------------
        // IMPORTANT
        // ---------------------------------------------
        // Projects and tasks represent the CURRENT
        // workspace state.
        //
        // Only activity analytics uses the date range.
        // ---------------------------------------------

        const activityLogs = filterActivityByRange(
          allActivityLogs,
          selectedRange,
        );

        // ---------------------------------------------
        // USER STATS
        // ---------------------------------------------

        const totalUsers = users.length;

        const owners = users.filter(
          (userData) => userData.role === "owner",
        ).length;

        const admins = users.filter(
          (userData) => userData.role === "admin",
        ).length;

        const managers = users.filter(
          (userData) => userData.role === "manager",
        ).length;

        const members = users.filter(
          (userData) => userData.role === "member",
        ).length;

        const viewers = users.filter(
          (userData) => userData.role === "viewer",
        ).length;

        // ---------------------------------------------
        // PROJECT STATS
        // ---------------------------------------------

        const totalProjects = projects.length;

        const activeProjects = projects.filter(
          (project) =>
            project.status === "active" ||
            project.status === "in_progress" ||
            project.status === "In Progress",
        ).length;

        const completedProjects = projects.filter(
          (project) =>
            project.status === "completed" ||
            project.status === "done" ||
            project.status === "Completed",
        ).length;

        // ---------------------------------------------
        // TASK STATS
        // ---------------------------------------------

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
          (task) =>
            task.status === "done" ||
            task.status === "completed" ||
            task.status === "Completed",
        ).length;

        const inProgressTasks = tasks.filter(
          (task) =>
            task.status === "in_progress" || task.status === "In Progress",
        ).length;

        const todoTasks = tasks.filter(
          (task) => task.status === "todo" || task.status === "To Do",
        ).length;

        const reviewTasks = tasks.filter(
          (task) => task.status === "review" || task.status === "Review",
        ).length;

        const completionRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // ---------------------------------------------
        // ACTIVITY
        // ---------------------------------------------

        const totalActivity = activityLogs.length;

        // ---------------------------------------------
        // PERIOD PERFORMANCE
        // ---------------------------------------------

        const normalizeAction = (action) =>
          String(action || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        const getDetailsText = (log) =>
          JSON.stringify(log?.details || "").toLowerCase();

        const projectsCreated = activityLogs.filter((log) => {
          const action = normalizeAction(log?.action);

          return action === "project_created" || action === "projects_created";
        }).length;

        const projectsDeleted = activityLogs.filter((log) => {
          const action = normalizeAction(log?.action);

          return action === "project_deleted" || action === "projects_deleted";
        }).length;

        const tasksCreated = activityLogs.filter((log) => {
          const action = normalizeAction(log?.action);

          return action === "task_created" || action === "tasks_created";
        }).length;

        const tasksCompleted = activityLogs.filter((log) => {
          const action = normalizeAction(log?.action);
          const details = getDetailsText(log);

          if (action === "task_completed" || action === "tasks_completed") {
            return true;
          }

          if (
            action === "task_status_changed" ||
            action === "tasks_status_changed"
          ) {
            return (
              details.includes('"newstatus":"completed"') ||
              details.includes('"newstatus":"done"') ||
              details.includes("new status: completed") ||
              details.includes("new status: done") ||
              details.includes("status changed to completed") ||
              details.includes("status changed to done")
            );
          }

          return false;
        }).length;

        const membersInvited = activityLogs.filter((log) => {
          const action = normalizeAction(log?.action);

          return action === "member_invited" || action === "members_invited";
        }).length;

        const periodPerformance = {
          projectsCreated,
          projectsDeleted,
          tasksCreated,
          tasksCompleted,
          membersInvited,
          totalActivity,
        };

        // ---------------------------------------------
        // ROLE DISTRIBUTION
        // ---------------------------------------------

        const roleDistribution = [
          {
            name: "Owners",
            value: owners,
            color: "#8b5cf6",
          },
          {
            name: "Admins",
            value: admins,
            color: "#ef4444",
          },
          {
            name: "Managers",
            value: managers,
            color: "#f59e0b",
          },
          {
            name: "Members",
            value: members,
            color: "#3b82f6",
          },
          {
            name: "Viewers",
            value: viewers,
            color: "#10b981",
          },
        ].filter((role) => role.value > 0);

        // ---------------------------------------------
        // TASK STATUS
        // ---------------------------------------------

        const taskStatusData = [
          {
            name: "To Do",
            value: todoTasks,
          },
          {
            name: "In Progress",
            value: inProgressTasks,
          },
          {
            name: "Review",
            value: reviewTasks,
          },
          {
            name: "Completed",
            value: completedTasks,
          },
        ];

        // ---------------------------------------------
        // PROJECT STATUS
        // ---------------------------------------------

        const projectStatusData = [
          {
            name: "Active",
            value: activeProjects,
          },
          {
            name: "Completed",
            value: completedProjects,
          },
        ];

        // ---------------------------------------------
        // FINAL ANALYTICS STATE
        // ---------------------------------------------

        setStats({
          totalUsers,

          owners,
          admins,
          managers,
          members,
          viewers,

          totalProjects,
          activeProjects,
          completedProjects,

          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          reviewTasks,
          completionRate,

          totalActivity,
          periodPerformance,
          roleDistribution,
          taskStatusData,
          projectStatusData,

          projects,
          tasks,
          users,

          activityLogs,
          allActivityLogs,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, range, getRangeStart],
  );

  // --------------------------------------------------
  // INITIAL LOAD + RANGE CHANGE
  // --------------------------------------------------

  useEffect(() => {
    fetchAnalytics(range);
  }, [fetchAnalytics, range]);

  // --------------------------------------------------
  // RANGE CHANGE
  // --------------------------------------------------

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchAnalytics(range);
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    await logout();
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading && !stats) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole={userRole} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            user={{
              firstName: user?.displayName || "Analytics",
            }}
            userRole={userRole}
            onLogout={handleLogout}
          />

          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={{
            firstName: user?.displayName || "Analytics",
          }}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto p-6 nexus-scroll">
          <div className="max-w-7xl mx-auto">
            <AnalyticsHeader
              range={range}
              onRangeChange={handleRangeChange}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            <AnalyticsStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TaskStatusChart data={stats?.taskStatusData || []} />

              <ProjectStatusChart
                data={stats?.projectStatusData || []}
                totalProjects={stats?.totalProjects || 0}
              />
            </div>

            <div className="mb-8">
              <RoleDistribution data={stats?.roleDistribution || []} />
            </div>

            <div className="mb-8">
              <ActivityTrend data={stats?.activityLogs || []} range={range} />
            </div>

            <PeriodPerformance
              data={stats?.periodPerformance || {}}
              range={range}
            />
            <TeamWorkload
              users={stats?.users || []}
              tasks={stats?.tasks || []}
            />

            <ActivityBreakdown activityLogs={stats?.activityLogs || []} />

            <AnalyticsSummary stats={stats} />
          </div>
        </main>
      </div>
    </div>
  );
}
