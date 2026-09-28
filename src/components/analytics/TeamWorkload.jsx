import React, { useMemo } from "react";
import {
  Users,
  CheckCircle2,
  Clock3,
  ListTodo,
  ArrowUpRight,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";

const CAPACITY_PER_MEMBER = 3;

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function getWorkloadStatus(assignedTasks) {
  if (assignedTasks === 0) {
    return {
      label: "Available",
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  }

  if (assignedTasks <= 2) {
    return {
      label: "Balanced",
      className: "bg-blue-50 text-blue-600 border-blue-100",
    };
  }

  if (assignedTasks <= 3) {
    return {
      label: "Busy",
      className: "bg-amber-50 text-amber-600 border-amber-100",
    };
  }

  return {
    label: "High load",
    className: "bg-red-50 text-red-600 border-red-100",
  };
}

export default function TeamWorkload({
  users = [],
  tasks = [],
}) {
  const workloadData = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return safeUsers.map((member) => {
      const memberTasks = safeTasks.filter(
        (task) =>
          task.assignedTo === member.id ||
          task.assigneeId === member.id ||
          task.assignedUserId === member.id
      );

      const assigned = memberTasks.length;

      const active = memberTasks.filter(
        (task) =>
          task.status === "in_progress" ||
          task.status === "In Progress" ||
          task.status === "active"
      ).length;

      const completed = memberTasks.filter(
        (task) =>
          task.status === "done" ||
          task.status === "completed" ||
          task.status === "Completed"
      ).length;

      const todo = memberTasks.filter(
        (task) =>
          task.status === "todo" ||
          task.status === "To Do"
      ).length;

      const workload = Math.min(
        Math.round((assigned / CAPACITY_PER_MEMBER) * 100),
        100
      );

      return {
        ...member,
        assigned,
        active,
        completed,
        todo,
        workload,
        status: getWorkloadStatus(assigned),
      };
    });
  }, [users, tasks]);

  const summary = useMemo(() => {
    const assigned = workloadData.reduce(
      (total, member) => total + member.assigned,
      0
    );

    const active = workloadData.reduce(
      (total, member) => total + member.active,
      0
    );

    const completed = workloadData.reduce(
      (total, member) => total + member.completed,
      0
    );

    const totalCapacity =
      workloadData.length * CAPACITY_PER_MEMBER;

    const utilization =
      totalCapacity > 0
        ? Math.min(Math.round((assigned / totalCapacity) * 100), 100)
        : 0;

    const available = workloadData.filter(
      (member) => member.assigned === 0
    ).length;

    return {
      assigned,
      active,
      completed,
      available,
      utilization,
    };
  }, [workloadData]);

  const insight = useMemo(() => {
    if (workloadData.length === 0) {
      return "Add team members to start tracking workload.";
    }

    const busiest = [...workloadData].sort(
      (a, b) => b.assigned - a.assigned
    )[0];

    const available = workloadData.filter(
      (member) => member.assigned === 0
    ).length;

    if (busiest?.assigned > CAPACITY_PER_MEMBER) {
      return `${busiest.displayName || busiest.name || "A team member"} is carrying a high number of assigned tasks. Consider redistributing work.`;
    }

    if (available > 0 && summary.assigned > 0) {
      return `${available} team member${
        available !== 1 ? "s" : ""
      } currently ${
        available === 1 ? "has" : "have"
      } available capacity for new work.`;
    }

    if (summary.assigned === 0) {
      return "Your team currently has no assigned tasks.";
    }

    return "Work is currently distributed across the available team members.";
  }, [workloadData, summary]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Team Workload
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Understand workload and team capacity at a glance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            <Users size={14} className="text-gray-400" />

            <span className="text-xs font-semibold text-gray-600">
              {workloadData.length} member
              {workloadData.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-gray-100">
        <div className="px-5 py-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Assigned
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {summary.assigned}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              tasks
            </span>
          </div>
        </div>

        <div className="px-5 py-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Active
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {summary.active}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              active
            </span>
          </div>
        </div>

        <div className="px-5 py-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Completed
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {summary.completed}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              done
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Available
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {summary.available}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              members
            </span>
          </div>
        </div>
      </div>

      {/* TEAM UTILIZATION */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Team utilization
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Based on {CAPACITY_PER_MEMBER} assigned tasks per member
            </p>
          </div>

          <span className="text-sm font-bold text-gray-900">
            {summary.utilization}%
          </span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${summary.utilization}%`,
            }}
          />
        </div>
      </div>

      {/* MEMBERS */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Team members
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Current workload distribution
            </p>
          </div>

          <span className="text-xs font-medium text-gray-400">
            {workloadData.length} total
          </span>
        </div>

        {workloadData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {workloadData.map((member) => {
              const name =
                member.displayName ||
                member.name ||
                member.firstName ||
                member.email?.split("@")[0] ||
                "Team Member";

              return (
                <div
                  key={member.id}
                  className="group border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                >
                  {/* MEMBER HEADER */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {name}
                          </p>

                          <span
                            className={`hidden sm:inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${member.status.className}`}
                          >
                            {member.status.label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-0.5">
                          {member.role || "Member"} · {member.assigned} assigned
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        {member.workload}%
                      </p>

                      <p className="text-[10px] text-gray-400">
                        workload
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          member.workload >= 100
                            ? "bg-red-500"
                            : member.workload >= 67
                              ? "bg-amber-500"
                              : member.workload > 0
                                ? "bg-blue-500"
                                : "bg-gray-200"
                        }`}
                        style={{
                          width: `${member.workload}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* METRICS */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <ListTodo
                          size={13}
                          className="text-blue-500"
                        />

                        <span className="text-[11px] text-gray-500">
                          To Do
                        </span>
                      </div>

                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {member.todo}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Clock3
                          size={13}
                          className="text-purple-500"
                        />

                        <span className="text-[11px] text-gray-500">
                          Active
                        </span>
                      </div>

                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {member.active}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={13}
                          className="text-emerald-500"
                        />

                        <span className="text-[11px] text-gray-500">
                          Done
                        </span>
                      </div>

                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {member.completed}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
              <Users size={22} />
            </div>

            <p className="text-sm font-semibold text-gray-700">
              No team members found
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Team workload will appear when workspace members are available.
            </p>
          </div>
        )}
      </div>

      {/* INSIGHT */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700">
              Workload insight
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}