import React from "react";
import {
  FolderPlus,
  CheckSquare,
  CircleCheck,
  UserPlus,
  Activity,
  Trash2,
} from "lucide-react";

const performanceItems = [
  {
    key: "projectsCreated",
    label: "Projects Created",
    icon: FolderPlus,
    iconStyle: "bg-blue-50 text-blue-600",
  },
  {
    key: "tasksCreated",
    label: "Tasks Created",
    icon: CheckSquare,
    iconStyle: "bg-purple-50 text-purple-600",
  },
  {
    key: "tasksCompleted",
    label: "Tasks Completed",
    icon: CircleCheck,
    iconStyle: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "membersInvited",
    label: "Members Invited",
    icon: UserPlus,
    iconStyle: "bg-orange-50 text-orange-600",
  },
  {
    key: "projectsDeleted",
    label: "Projects Deleted",
    icon: Trash2,
    iconStyle: "bg-red-50 text-red-600",
  },
  {
    key: "totalActivity",
    label: "Total Activity",
    icon: Activity,
    iconStyle: "bg-indigo-50 text-indigo-600",
  },
];

const rangeLabel = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  "90": "Last 90 days",
  all: "All time",
};

export default function PeriodPerformance({
  data = {},
  range = "7",
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Period Performance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Key workspace actions during the selected period
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
            <span className="text-xs font-semibold text-gray-600">
              {rangeLabel[range] || "Selected period"}
            </span>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {performanceItems.map((item, index) => {
          const Icon = item.icon;
          const value = Number(data?.[item.key] || 0);

          return (
            <div
              key={item.key}
              className={`
                p-5
                hover:bg-gray-50
                transition-colors
                ${index % 3 !== 2 ? "xl:border-r border-gray-100" : ""}
                ${index < 3 ? "xl:border-b border-gray-100" : ""}
                ${index % 2 !== 1 ? "sm:border-r border-gray-100 xl:border-r" : ""}
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconStyle}`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {item.label}
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Metrics are calculated from workspace activity logs for the selected period.
        </p>
      </div>
    </div>
  );
}