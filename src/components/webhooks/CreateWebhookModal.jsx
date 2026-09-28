import React from "react";
import {
  CheckCircle2,
  X,
  Copy,
  Check,
} from "lucide-react";

export default function CreateWebhookModal({
  form,
  creating,
  createdSecret,
  copied,
  onChange,
  onToggleEvent,
  onSubmit,
  onClose,
  onCopySecret,
  availableEvents,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create webhook
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Connect NexusFlow events to an external endpoint.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {createdSecret ? (
          <div className="p-6">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-emerald-800">
                    Webhook created successfully
                  </h3>

                  <p className="text-xs text-emerald-700 mt-1">
                    Save this secret. It will be used later to verify
                    webhook requests.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <code className="flex-1 min-w-0 bg-white border border-emerald-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 truncate">
                  {createdSecret}
                </code>

                <button
                  type="button"
                  onClick={onCopySecret}
                  className="w-10 h-10 rounded-lg bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition"
                >
                  {copied ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={onSubmit}>
            <div className="p-6 space-y-5">
              {/* NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Endpoint name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Production API"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Endpoint URL
                </label>

                <input
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      url: event.target.value,
                    })
                  }
                  placeholder="https://api.example.com/webhooks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>

              {/* EVENTS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Events
                  </label>

                  <span className="text-xs text-gray-400">
                    {form.events.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableEvents.map((eventName) => {
                    const selected = form.events.includes(eventName);

                    return (
                      <button
                        key={eventName}
                        type="button"
                        onClick={() => onToggleEvent(eventName)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition ${
                          selected
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{eventName}</span>

                          {selected && (
                            <Check
                              size={15}
                              className="text-blue-600"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.events.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Select at least one event.
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  creating ||
                  !form.name.trim() ||
                  !form.url.trim() ||
                  form.events.length === 0
                }
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
              >
                {creating ? "Creating..." : "Create webhook"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}