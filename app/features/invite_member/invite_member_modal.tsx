"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseUser } from "@/core/auth/use-supabase-user";
import { createProjectInvite, checkUserExistsByEmail } from "./services/invite_member_service";
import { Snackbar, type SnackbarType } from "@/components/ui/snackbar";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
};

export function InviteMemberModal({
  isOpen,
  onClose,
  projectName,
  projectId,
}: InviteMemberModalProps) {
  const { user } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    type: SnackbarType;
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !user?.id) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First check if user exists
      const userId = await checkUserExistsByEmail(email.trim());
      
      if (!userId) {
        // User doesn't exist - show error at bottom
        setError("Email Does Not Exist");
        setIsSubmitting(false);
        return;
      }

      // User exists, create the invite
      await createProjectInvite({
        projectId,
        invitedBy: user.id,
        email: email.trim(),
      });
      
      // Show success snackbar
      setSnackbar({
        isOpen: true,
        message: `Invited ${email.trim()} to ${projectName}`,
        type: "success",
      });
      
      setEmail("");
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send invite. Please try again.";
      
      // Show error snackbar for other errors
      setSnackbar({
        isOpen: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[var(--surface-1)]/85 backdrop-blur-sm border-[#2f3238]"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Invite A Member to {projectName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 py-4">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="Enter email address"
            className="w-full max-w-md rounded-lg border border-[#2f3238] bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-white"
            autoFocus
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!email.trim() || isSubmitting || !user?.id}
            className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Invite"}
          </button>
          {error && (
            <p className="text-sm text-red-400 text-center max-w-md mt-2">{error}</p>
          )}
        </form>
      </DialogContent>
      
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={() => setSnackbar((prev) => ({ ...prev, isOpen: false }))}
      />
    </Dialog>
  );
}
