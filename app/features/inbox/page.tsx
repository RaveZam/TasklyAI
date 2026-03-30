"use client";

import { useInboxInvites } from "./useInboxInvites";
import type { InviteWithDetails } from "@/app/features/invite_member/services/invite_member_service";

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function InviteCard({
  invite,
  respondingId,
  onAccept,
  onReject,
}: {
  invite: InviteWithDetails;
  respondingId: string | null;
  onAccept: (invite: InviteWithDetails) => void;
  onReject: (invite: InviteWithDetails) => void;
}) {
  const isResponding = respondingId === invite.id;

  return (
    <div className="border border-[#282b30] bg-[var(--surface-1)] rounded-2xl p-5 flex items-start gap-4">
      {invite.inviter_avatar ? (
        <img
          src={invite.inviter_avatar}
          alt={invite.inviter_name}
          referrerPolicy="no-referrer"
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#36393e] text-sm font-semibold text-white flex-shrink-0">
          {invite.inviter_name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-white">{invite.inviter_name}</span>
          {" invited you to "}
          <span className="font-semibold text-white">{invite.project_name}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo(invite.created_at)}</p>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => onAccept(invite)}
            disabled={isResponding}
            className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResponding ? "..." : "Accept"}
          </button>
          <button
            type="button"
            onClick={() => onReject(invite)}
            disabled={isResponding}
            className="rounded-lg border border-[#2f3238] px-4 py-1.5 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { invites, loading, respondingId, handleAccept, handleReject } = useInboxInvites();

  return (
    <div className="px-6 py-8 lg:px-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Inbox</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : invites.length === 0 ? (
        <div className="border border-[#282b30] bg-[var(--surface-1)] rounded-2xl p-10 text-center">
          <p className="text-gray-400 text-sm">No pending invitations</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              respondingId={respondingId}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
