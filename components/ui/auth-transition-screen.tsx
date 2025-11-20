"use client";

type AuthTransitionScreenProps = {
  title: string;
  message: string;
};

export function AuthTransitionScreen({
  title,
  message,
}: AuthTransitionScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-gray-100">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] px-6 py-8 text-center shadow-2xl">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#7289da]/40 border-t-[#7289da]" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}


