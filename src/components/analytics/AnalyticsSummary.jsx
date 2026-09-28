import React from "react";
import {
  FolderKanban,
  CheckSquare,
  Users,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsSummary({ stats }) {
  const rows = [
    {
      label: "Projects",
      value: stats?.totalProjects || 0,
      meta: `${stats?.activeProjects || 0} active`,
      icon: FolderKanban,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tasks",
      value: stats?.totalTasks || 0,
      meta: `${stats?.completedTasks || 0} completed`,
      icon: CheckSquare,
      iconStyle: "bg-purple-50 text-purple-600",
    },
    {
      label: "Team Members",
      value: stats?.totalUsers || 0,
      meta: "Current workspace members",
      icon: Users,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Workspace Activity",
      value: stats?.totalActivity || 0,
      meta: "Recorded actions",
      icon: Activity,
      iconStyle: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Workspace Summary
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            A quick overview of your workspace activity
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-gray-600">
            Live workspace data
          </span>
        </div>
      </div>

      {/* Summary rows */}
      <div className="divide-y divide-gray-100">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={row.label}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.iconStyle}`}
              >
                <Icon size={18} />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {row.label}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {row.meta}
                </p>
              </div>

              {/* Value */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">
                  {row.value}
                </span>

                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Analytics are calculated from your current workspace data.
        </p>
      </div>
    </div>
  );
}