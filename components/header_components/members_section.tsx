"use client";

import { useEffect, useState } from "react";
import {
  getProjectMemberProfiles,
  type MemberProfile,
} from "@/app/features/projects/services/project-members-service";

type MembersSectionProps = {
  activeProjectId: string | null;
  currentUserAvatarUrl: string | null;
  currentUserName: string;
  currentUserInitial: string;
};

function Avatar({ member }: { member: MemberProfile }) {
  return member.avatar_url ? (
    <img
      src={member.avatar_url}
      alt={member.display_name}
      referrerPolicy="no-referrer"
      className="h-10 w-10 rounded-full border-2 border-[var(--background)] object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[#36393e] text-sm font-semibold text-white">
      {member.initial}
    </div>
  );
}

export function MembersSection({
  activeProjectId,
  currentUserAvatarUrl,
  currentUserName,
  currentUserInitial,
}: MembersSectionProps) {
  const [members, setMembers] = useState<MemberProfile[]>([]);

  useEffect(() => {
    if (!activeProjectId) return;
    getProjectMemberProfiles(activeProjectId)
      .then(setMembers)
      .catch(console.error);
  }, [activeProjectId]);

  if (!activeProjectId || members.length === 0) {
    return (
      <div className="flex items-center -space-x-2">
        {currentUserAvatarUrl ? (
          <img
            src={currentUserAvatarUrl}
            alt={currentUserName}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full border-2 border-[var(--background)] object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[#36393e] text-sm font-semibold text-white">
            {currentUserInitial}
          </div>
        )}
      </div>
    );
  }

  const visible = members.slice(0, 3);
  const overflow = members.length - 3;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <Avatar key={member.user_id} member={member} />
      ))}
      {overflow > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[#36393e] text-xs font-semibold text-white">
          +{overflow}
        </div>
      )}
    </div>
  );
}
