import React from "react";
import {
  Users,
  Crown,
  ShieldCheck,
  BriefcaseBusiness,
  UserRound,
  Eye,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const roleConfig = {
  Owners: {
    icon: Crown,
    color: "#8b5cf6",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  Admins: {
    icon: ShieldCheck,
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  Managers: {
    icon: BriefcaseBusiness,
    color: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  Members: {
    icon: UserRound,
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Viewers: {
    icon: Eye,
    color: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
};

export default function RoleDistribution({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  const totalMembers = safeData.reduce(
    (total, item) => total + Number(item?.value || 0),
    0,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Team Distribution
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Workspace members by role
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Users size={20} />
        </div>
      </div>

      {totalMembers > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
          {/* Donut */}
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {safeData.map((entry) => {
                    const config = roleConfig[entry.name];

                    return (
                      <Cell
                        key={entry.name}
                        fill={config?.color || "#94a3b8"}
                      />
                    );
                  })}
                </Pie>

                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">
                {totalMembers}
              </span>

              <span className="text-xs text-gray-500 mt-1">
                Members
              </span>
            </div>
          </div>

          {/* Role breakdown */}
          <div className="space-y-2">
            {safeData.map((entry) => {
              const config = roleConfig[entry.name] || {
                icon: UserRound,
                bg: "bg-gray-50",
                text: "text-gray-600",
                color: "#94a3b8",
              };

              const Icon = config.icon;

              const percentage =
                totalMembers > 0
                  ? Math.round(
                      (Number(entry.value || 0) / totalMembers) * 100,
                    )
                  : 0;

              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg} ${config.text}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">
                        {entry.name}
                      </span>

                      <span className="text-sm font-bold text-gray-900">
                        {entry.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>

                      <span className="text-[11px] text-gray-400 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-[260px] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
            <Users size={22} />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            No team members yet
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Team role distribution will appear here.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Workspace access overview
        </span>

        <span className="text-xs font-semibold text-gray-500">
          {totalMembers} member{totalMembers !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}