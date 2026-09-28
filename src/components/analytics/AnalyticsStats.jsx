import React from "react";
import {
  FolderKanban,
  CheckSquare,
  Target,
  Activity,
  ArrowUpRight,
} from "lucide-react";

const statCards = [
  {
    key: "totalProjects",
    label: "Total Projects",
    icon: FolderKanban,
    iconStyle: "bg-blue-50 text-blue-600",
    valueStyle: "text-gray-900",
    getMeta: (stats) =>
      `${stats?.activeProjects || 0} active`,
    metaStyle: "text-blue-600",
  },
  {
    key: "totalTasks",
    label: "Total Tasks",
    icon: CheckSquare,
    iconStyle: "bg-purple-50 text-purple-600",
    valueStyle: "text-gray-900",
    getMeta: (stats) =>
      `${stats?.completedTasks || 0} completed`,
    metaStyle: "text-purple-600",
  },
  {
    key: "completionRate",
    label: "Completion Rate",
    icon: Target,
    iconStyle: "bg-emerald-50 text-emerald-600",
    valueStyle: "text-gray-900",
    getMeta: (stats) =>
      `${stats?.completedTasks || 0} of ${stats?.totalTasks || 0} tasks`,
    metaStyle: "text-emerald-600",
  },
  {
    key: "totalActivity",
    label: "Workspace Activity",
    icon: Activity,
    iconStyle: "bg-orange-50 text-orange-600",
    valueStyle: "text-gray-900",
    getMeta: () => "Recorded workspace actions",
    metaStyle: "text-orange-600",
  },
];

export default function AnalyticsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {statCards.map((card) => {
        const Icon = card.icon;

        let value = stats?.[card.key] ?? 0;

        if (card.key === "completionRate") {
          value = `${value}%`;
        }

        return (
          <div
            key={card.key}
            className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconStyle}`}
              >
                <Icon size={21} strokeWidth={2} />
              </div>

              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-gray-500 group-hover:bg-gray-50 transition">
                <ArrowUpRight size={17} />
              </div>
            </div>

            {/* Content */}
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>

              <p
                className={`text-3xl font-bold tracking-tight mt-1 ${card.valueStyle}`}
              >
                {value}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`text-xs font-semibold ${card.metaStyle}`}
                >
                  {card.getMeta(stats)}
                </span>
              </div>
            </div>

            {/* Subtle bottom accent */}
            <div
              className={`absolute bottom-0 left-5 right-5 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${card.metaStyle.replace(
                "text-",
                "bg-",
              )}`}
            />
          </div>
        );
      })}
    </div>
  );
}