import React, { useMemo } from "react";
import {
  Activity,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ActivityTrend({
  data = [],
  range = "7",
}) {
  const chartData = useMemo(() => {
    const activityLogs = Array.isArray(data) ? data : [];

    const getLocalDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const getLogDate = (createdAt) => {
      if (!createdAt) return null;

      if (typeof createdAt.toDate === "function") {
        return createdAt.toDate();
      }

      if (createdAt instanceof Date) {
        return createdAt;
      }

      if (typeof createdAt === "number") {
        const date = new Date(createdAt);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      if (typeof createdAt === "string") {
        const date = new Date(createdAt);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      return null;
    };

    /*
      For All Time:
      Build the chart from the actual activity log dates.
    */
    if (range === "all") {
      const validDates = activityLogs
        .map((log) => getLogDate(log?.createdAt))
        .filter(Boolean);

      if (validDates.length === 0) {
        return [];
      }

      const earliestDate = new Date(
        Math.min(...validDates.map((date) => date.getTime())),
      );

      const latestDate = new Date();

      earliestDate.setHours(0, 0, 0, 0);
      latestDate.setHours(0, 0, 0, 0);

      const buckets = [];

      const current = new Date(earliestDate);

      while (current <= latestDate) {
        const date = new Date(current);

        buckets.push({
          key: getLocalDateKey(date),
          date,
          label: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          activity: 0,
        });

        current.setDate(current.getDate() + 1);
      }

      activityLogs.forEach((log) => {
        const date = getLogDate(log?.createdAt);

        if (!date) return;

        const key = getLocalDateKey(date);

        const bucket = buckets.find(
          (item) => item.key === key,
        );

        if (bucket) {
          bucket.activity += 1;
        }
      });

      return buckets;
    }

    const days =
      range === "7"
        ? 7
        : range === "30"
          ? 30
          : range === "90"
            ? 90
            : 7;

    const now = new Date();

    const buckets = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      buckets.push({
        key: getLocalDateKey(date),
        date,
        label:
          days <= 7
            ? date.toLocaleDateString("en-US", {
                weekday: "short",
              })
            : date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        activity: 0,
      });
    }

    activityLogs.forEach((log) => {
      const date = getLogDate(log?.createdAt);

      if (!date) return;

      const key = getLocalDateKey(date);

      const bucket = buckets.find(
        (item) => item.key === key,
      );

      if (bucket) {
        bucket.activity += 1;
      }
    });

    return buckets;
  }, [data, range]);

  const totalActivity = chartData.reduce(
    (total, item) => total + item.activity,
    0,
  );

  const peakActivity = chartData.reduce(
    (max, item) => Math.max(max, item.activity),
    0,
  );

  const activeDays = chartData.filter(
    (item) => item.activity > 0,
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Activity Trend
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Workspace activity over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
              <CalendarDays
                size={14}
                className="text-gray-400"
              />

              <span className="text-xs font-semibold text-gray-600">
                {range === "all"
                  ? "All time"
                  : `Last ${range} days`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100">
        <div className="px-6 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total activity
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {totalActivity}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              actions
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Peak day
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {peakActivity}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              actions
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Active days
          </p>

          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {activeDays}
            </span>

            <span className="text-xs text-gray-400 mb-1">
              days
            </span>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="p-6">
        {totalActivity > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b82f6"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#f1f5f9"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  interval={
                    range === "7"
                      ? 0
                      : range === "30"
                        ? 4
                        : range === "90"
                          ? 9
                          : "preserveStartEnd"
                  }
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  width={35}
                />

                <Tooltip
                  cursor={{
                    stroke: "#cbd5e1",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value) => [
                    `${value} ${
                      value === 1
                        ? "activity"
                        : "activities"
                    }`,
                    "Workspace",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#activityGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#3b82f6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
              <TrendingUp size={22} />
            </div>

            <p className="text-sm font-semibold text-gray-700">
              No activity in this period
            </p>

            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Workspace activity will appear here as
              members create projects, update tasks,
              invite members, and perform other actions.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Activity is calculated from workspace activity
          logs.
        </p>
      </div>
    </div>
  );
}