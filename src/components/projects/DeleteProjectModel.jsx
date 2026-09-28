import { Loader2, Trash2, X } from "lucide-react";

export default function DeleteProjectModal({
  project,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0D1422] shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              Delete project?
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-200">
                "{project.name}"
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-gray-300 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}