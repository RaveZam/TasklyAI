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
    <div className="fixed inset-0 z-50 flex items-end">
      <button
        type="button"
        aria-label="Close sign out sheet"
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full rounded-t-3xl border border-[#282b30] bg-[var(--surface-1)] p-6 text-gray-100 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-[var(--surface-3)]" />
        <h3 className="text-lg font-semibold text-white">Ready to sign out?</h3>
        <p className="mt-2 text-sm text-gray-400">
          Your session will be cleared on this device. You’ll need to log in
          again to continue working.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-[#d9534f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e26460]"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-[#282b30] px-4 py-3 text-sm font-semibold text-gray-100 transition hover:bg-[var(--surface-2)]"
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  );
}
