import React from "react";
import {
  Circle,
  Clock3,
  Eye,
  CheckCircle2,
  ListTodo,
  HelpCircle,
} from "lucide-react";

const statusConfig = [
  {
    key: "To Do",
    label: "To Do",
    icon: ListTodo,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    key: "In Progress",
    label: "In Progress",
    icon: Clock3,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    key: "Review",
    label: "Review",
    icon: Eye,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    key: "Completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    key: "Other",
    label: "Other",
    icon: HelpCircle,
    color: "bg-gray-400",
    lightColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
];

export default function TaskStatusChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  const getValue = (name) => {
    const item = safeData.find(
      (entry) => entry.name === name,
    );

    return Number(item?.value || 0);
  };

  const totalTasks = safeData.reduce(
    (total, item) =>
      total + Number(item?.value || 0),
    0,
  );

  const completedTasks = getValue("Completed");

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100,
        )
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Task Status
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Current distribution of tasks across your workspace
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
          <Circle
            size={8}
            className="fill-blue-500 text-blue-500"
          />

          <span className="text-xs font-semibold text-gray-600">
            {totalTasks} total
          </span>
        </div>
      </div>

      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Workspace progress
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

      <div className="space-y-3">
        {statusConfig.map((status) => {
          const Icon = status.icon;

          const value = getValue(status.key);

          const percentage =
            totalTasks > 0
              ? Math.round(
                  (value / totalTasks) * 100,
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
                <Icon size={18} strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {status.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {value}
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

      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Last calculated from workspace tasks
        </span>

        <span className="text-xs font-semibold text-gray-500">
          {totalTasks === 0
            ? "No tasks"
            : `${totalTasks} task${
                totalTasks !== 1 ? "s" : ""
              }`}
        </span>
      </div>
    </div>
  );
}