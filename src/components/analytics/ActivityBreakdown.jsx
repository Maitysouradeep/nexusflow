import React, { useMemo, useState } from "react";
import {
  Activity,
  CheckSquare,
  FolderKanban,
  UserPlus,
  Trash2,
  Edit3,
  ArrowRightLeft,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react";

const ACTION_CONFIG = {
  task_updated: {
    label: "Tasks Updated",
    icon: CheckSquare,
    iconStyle: "bg-purple-50 text-purple-600",
    barStyle: "bg-purple-500",
  },

  tasks_updated: {
    label: "Tasks Updated",
    icon: CheckSquare,
    iconStyle: "bg-purple-50 text-purple-600",
    barStyle: "bg-purple-500",
  },

  task_created: {
    label: "Tasks Created",
    icon: CheckSquare,
    iconStyle: "bg-blue-50 text-blue-600",
    barStyle: "bg-blue-500",
  },

  tasks_created: {
    label: "Tasks Created",
    icon: CheckSquare,
    iconStyle: "bg-blue-50 text-blue-600",
    barStyle: "bg-blue-500",
  },

  task_deleted: {
    label: "Tasks Deleted",
    icon: Trash2,
    iconStyle: "bg-red-50 text-red-600",
    barStyle: "bg-red-500",
  },

  tasks_deleted: {
    label: "Tasks Deleted",
    icon: Trash2,
    iconStyle: "bg-red-50 text-red-600",
    barStyle: "bg-red-500",
  },

  task_status_changed: {
    label: "Task Status Changed",
    icon: ArrowRightLeft,
    iconStyle: "bg-cyan-50 text-cyan-600",
    barStyle: "bg-cyan-500",
  },

  tasks_status_changed: {
    label: "Task Status Changed",
    icon: ArrowRightLeft,
    iconStyle: "bg-cyan-50 text-cyan-600",
    barStyle: "bg-cyan-500",
  },

  task_priority_changed: {
    label: "Task Priority Changed",
    icon: ArrowRightLeft,
    iconStyle: "bg-orange-50 text-orange-600",
    barStyle: "bg-orange-500",
  },

  task_comment_added: {
    label: "Task Comments",
    icon: MessageSquare,
    iconStyle: "bg-emerald-50 text-emerald-600",
    barStyle: "bg-emerald-500",
  },

  project_created: {
    label: "Projects Created",
    icon: FolderKanban,
    iconStyle: "bg-blue-50 text-blue-600",
    barStyle: "bg-blue-500",
  },

  projects_created: {
    label: "Projects Created",
    icon: FolderKanban,
    iconStyle: "bg-blue-50 text-blue-600",
    barStyle: "bg-blue-500",
  },

  project_updated: {
    label: "Projects Updated",
    icon: Edit3,
    iconStyle: "bg-purple-50 text-purple-600",
    barStyle: "bg-purple-500",
  },

  projects_updated: {
    label: "Projects Updated",
    icon: Edit3,
    iconStyle: "bg-purple-50 text-purple-600",
    barStyle: "bg-purple-500",
  },

  project_deleted: {
    label: "Projects Deleted",
    icon: Trash2,
    iconStyle: "bg-red-50 text-red-600",
    barStyle: "bg-red-500",
  },

  projects_deleted: {
    label: "Projects Deleted",
    icon: Trash2,
    iconStyle: "bg-red-50 text-red-600",
    barStyle: "bg-red-500",
  },

  member_invited: {
    label: "Member Invited",
    icon: UserPlus,
    iconStyle: "bg-orange-50 text-orange-600",
    barStyle: "bg-orange-500",
  },

  members_invited: {
    label: "Members Invited",
    icon: UserPlus,
    iconStyle: "bg-orange-50 text-orange-600",
    barStyle: "bg-orange-500",
  },
};

const fallbackConfig = {
  label: "Other Activity",
  icon: MoreHorizontal,
  iconStyle: "bg-gray-50 text-gray-500",
  barStyle: "bg-gray-400",
};

const normalizeAction = (action) =>
  String(action || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

export default function ActivityBreakdown({
  activityLogs = [],
}) {
  const [showAll, setShowAll] = useState(false);

  const breakdown = useMemo(() => {
    const grouped = {};

    activityLogs.forEach((log) => {
      const action = normalizeAction(log?.action);

      if (!action) return;

      if (!grouped[action]) {
        grouped[action] = {
          action,
          count: 0,
        };
      }

      grouped[action].count += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        ...item,
        ...(ACTION_CONFIG[item.action] || fallbackConfig),
      }));
  }, [activityLogs]);

  const totalActivity = activityLogs.length;

  const visibleItems = showAll
    ? breakdown
    : breakdown.slice(0, 6);

  const hiddenCount = Math.max(
    breakdown.length - 6,
    0,
  );

  const topActivity = breakdown[0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Activity Breakdown
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                How your workspace activity is distributed
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            {topActivity && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100">
                <TrendingUp
                  size={13}
                  className="text-purple-500"
                />

                <span className="text-xs font-semibold text-purple-600">
                  Most active
                </span>
              </div>
            )}

            <div className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-600">
                {totalActivity} total
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ACTIVITY DISTRIBUTION */}
      {totalActivity > 0 && (
        <div className="px-6 pt-6">

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Activity distribution
            </span>

            <span className="text-xs text-gray-400">
              {breakdown.length} action types
            </span>
          </div>

          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">

            {breakdown.map((item, index) => {
              const percentage =
                (item.count / totalActivity) * 100;

              const colors = [
                "bg-purple-500",
                "bg-blue-500",
                "bg-red-500",
                "bg-emerald-500",
                "bg-orange-500",
                "bg-cyan-500",
              ];

              return (
                <div
                  key={item.action}
                  className={`${colors[index % colors.length]} transition-all duration-500`}
                  style={{
                    width: `${percentage}%`,
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              );
            })}

          </div>
        </div>
      )}

      {/* CARDS */}
      {visibleItems.length > 0 ? (
        <div className="p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {visibleItems.map((item, index) => {
              const Icon = item.icon;

              const percentage =
                totalActivity > 0
                  ? Math.round(
                      (item.count / totalActivity) * 100,
                    )
                  : 0;

              const isTop = index === 0;

              return (
                <div
                  key={item.action}
                  className={`
                    group relative
                    rounded-2xl
                    border
                    p-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-md
                    ${
                      isTop
                        ? "border-purple-100 bg-purple-50/30"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }
                  `}
                >

                  {/* TOP ROW */}
                  <div className="flex items-center gap-3">

                    <div
                      className={`
                        w-11 h-11 rounded-xl
                        flex items-center justify-center
                        shrink-0
                        ${item.iconStyle}
                      `}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2">

                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.label}
                        </p>

                        {isTop && (
                          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-purple-100 text-[10px] font-bold text-purple-600">
                            TOP
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        {percentage}% of workspace activity
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-xl font-bold text-gray-900">
                        {item.count}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        actions
                      </p>

                    </div>

                  </div>

                  {/* PROGRESS */}
                  <div className="mt-4">

                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">

                      <div
                        className={`h-full ${item.barStyle} rounded-full transition-all duration-500`}
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

          {/* SHOW MORE */}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full mt-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center gap-2"
            >
              {showAll ? (
                <>
                  Show less
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  View {hiddenCount} more activity types
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          )}

        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">

          <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
            <Activity size={22} />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            No activity in this period
          </p>

          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Activity breakdown will appear here as workspace
            actions are recorded.
          </p>

        </div>
      )}

      {/* FOOTER */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Activity is grouped from your workspace activity logs.
        </p>
      </div>

    </div>
  );
}