"use client";

type MembersSectionProps = {
  avatarUrl: string | null;
  derivedName: string;
  initial: string;
};

export function MembersSection({
  avatarUrl,
  derivedName,
  initial,
}: MembersSectionProps) {
  return (
    <div className="flex items-center -space-x-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${derivedName}'s avatar`}
          referrerPolicy="no-referrer"
          className="h-10 w-10 rounded-full border-2 border-[var(--background)] object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[#36393e] text-sm font-semibold text-white">
          {initial}
        </div>
      )}
      {/* Two blank circles */}
      <div className="h-10 w-10 rounded-full border-2 border-[var(--background)] bg-[#36393e]" />
      <div className="h-10 w-10 rounded-full border-2 border-[var(--background)] bg-[#36393e]" />
    </div>
  );
}
