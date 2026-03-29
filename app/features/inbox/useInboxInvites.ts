"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import {
  getPendingInvitesForUser,
  acceptInvite,
  rejectInvite,
  type InviteWithDetails,
} from "@/app/features/invite_member/services/invite_member_service";

export function useInboxInvites() {
  const { user } = useSupabaseUser();
  const { refresh } = useProjects();
  const [invites, setInvites] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getPendingInvitesForUser(user.id)
      .then(setInvites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleAccept = useCallback(
    async (invite: InviteWithDetails) => {
      if (!user?.id) return;
      setRespondingId(invite.id);
      try {
        await acceptInvite(invite.id, invite.project_id, user.id);
        setInvites((prev) => prev.filter((i) => i.id !== invite.id));
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setRespondingId(null);
      }
    },
    [user?.id, refresh]
  );

  const handleReject = useCallback(
    async (invite: InviteWithDetails) => {
      setRespondingId(invite.id);
      try {
        await rejectInvite(invite.id);
        setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      } catch (err) {
        console.error(err);
      } finally {
        setRespondingId(null);
      }
    },
    []
  );

  return { invites, loading, respondingId, handleAccept, handleReject };
}
