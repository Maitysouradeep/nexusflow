import React from "react";
import {
  Webhook,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

export default function WebhookEndpointCard({
  endpoint,
  onTest,
  testing,
}) {
  const active = endpoint.status === "active";

  const createdAt = endpoint.createdAt?.toDate
    ? endpoint.createdAt.toDate().toLocaleDateString()
    : "Recently created";

  const handleTest = () => {
    if (!active || testing) return;

    onTest(endpoint);
  };

  return (
    <div className="px-6 py-5 hover:bg-gray-50/70 transition">
      <div className="flex flex-col xl:flex-row xl:items-center gap-5">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <Webhook size={19} />
          </div>

          <div className="min-w-0">
            {/* NAME + STATUS */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">
                {endpoint.name}
              </h3>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  active
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs text-gray-400 truncate max-w-xl">
                {endpoint.url}
              </p>

              <ExternalLink
                size={12}
                className="text-gray-300 shrink-0"
              />
            </div>

            {/* METADATA */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
              <span>
                {endpoint.events?.length || 0} events
              </span>

              <span>
                {endpoint.deliveries || 0} deliveries
              </span>

              <span className="text-red-400">
                {endpoint.failed || 0} failed
              </span>

              <span>
                Created {createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={!active || testing}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${
              !active || testing
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {testing ? "Testing..." : "Test"}
          </button>

          <button
            type="button"
            disabled
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-not-allowed"
            aria-label="Webhook actions"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}