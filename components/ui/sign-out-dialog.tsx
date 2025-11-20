"use client";

type SignOutDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SignOutDialog({
  open,
  onCancel,
  onConfirm,
}: SignOutDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2f3238] bg-[#1f2225] p-6 text-gray-100 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Sign out?</h3>
          <button
            type="button"
            aria-label="Close sign out dialog"
            onClick={onCancel}
            className="rounded-full p-1 text-gray-400 transition hover:bg-[#2a2d32] hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Confirm to remove your session from this browser. You’ll need to log
          back in to continue working.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg hover:cursor-pointer border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#2a2d32]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg hover:cursor-pointer bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e26460]"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
