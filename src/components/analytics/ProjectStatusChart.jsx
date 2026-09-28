import React from "react";
import {
  FolderKanban,
  CheckCircle2,
  Activity,
  Clock3,
} from "lucide-react";

export default function ProjectStatusChart({
  data = [],
  totalProjects = 0,
}) {
  const safeData = Array.isArray(data) ? data : [];

  const getValue = (name) => {
    const item = safeData.find((entry) => entry.name === name);
    return Number(item?.value || 0);
  };

  const activeProjects = getValue("Active");
  const completedProjects = getValue("Completed");
  const planningProjects = getValue("Planning");

  const knownProjects =
    activeProjects +
    completedProjects +
    planningProjects;

  const otherProjects = Math.max(
    Number(totalProjects || 0) - knownProjects,
    0
  );

  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  const statusConfig = [
    {
      key: "Active",
      label: "Active",
      value: activeProjects,
      icon: Activity,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      key: "Planning",
      label: "Planning",
      value: planningProjects,
      icon: Clock3,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      key: "Completed",
      label: "Completed",
      value: completedProjects,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Project Status
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Current distribution of projects across your workspace
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <FolderKanban size={20} />
        </div>
      </div>

      {/* TOTAL PROJECTS */}
      <div className="flex items-center gap-5 p-4 rounded-xl bg-gray-50 border border-gray-100 mb-6">
        <div className="w-16 h-16 rounded-full bg-white border-4 border-purple-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-gray-900">
            {totalProjects}
          </span>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Total Projects
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {activeProjects} active ·{" "}
            {planningProjects} planning ·{" "}
            {completedProjects} completed
            {otherProjects > 0
              ? ` · ${otherProjects} other`
              : ""}
          </p>
        </div>
      </div>

      {/* COMPLETION */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Completion
          </span>

          <span className="text-sm font-bold text-gray-900">
            {completionRate}%
          </span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{
              width: `${completionRate}%`,
            }}
          />
        </div>
      </div>

      {/* STATUS LIST */}
      <div className="space-y-3">
        {statusConfig.map((status) => {
          const Icon = status.icon;

          const percentage =
            totalProjects > 0
              ? Math.round(
                  (status.value / totalProjects) * 100
                )
              : 0;

          return (
            <div
              key={status.key}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.lightColor} ${status.textColor}`}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {status.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {status.value}
                    </span>

                    <span className="text-xs text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.color} rounded-full transition-all duration-500`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Workspace project overview
        </span>

        <span className="text-xs font-semibold text-gray-500">
          {totalProjects === 0
            ? "No projects"
            : `${totalProjects} project${
                totalProjects !== 1 ? "s" : ""
              }`}
        </span>
      </div>
    </div>
  );
}