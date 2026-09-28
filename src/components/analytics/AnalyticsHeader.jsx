import React from "react";
import { CalendarDays, RefreshCw } from "lucide-react";

const rangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export default function AnalyticsHeader({
  range,
  onRangeChange,
  onRefresh,
  refreshing,
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="text-gray-500 mt-1">
            Understand what is happening across your workspace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* DATE RANGE */}
          <div className="relative">
            <CalendarDays
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                pointer-events-none
              "
            />

            <select
              value={range}
              onChange={(event) => onRangeChange(event.target.value)}
              className="
                h-10
                pl-9
                pr-9
                rounded-xl
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                text-gray-700
                outline-none
                cursor-pointer
                hover:border-gray-300
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-500/10
                transition
                appearance-none
              "
            >
              {rangeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="
              h-10
              px-4
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              text-sm
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              hover:bg-gray-50
              hover:border-gray-300
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition
            "
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            <span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}