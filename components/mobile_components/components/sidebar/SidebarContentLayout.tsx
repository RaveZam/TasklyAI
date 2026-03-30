"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Folder } from "lucide-react";

import { InviteMemberModal } from "@/app/features/invite_member/invite_member_modal";
import type { SidebarContentController } from "./useSidebarContentController";
import { SidebarProjectList } from "./SidebarProjectList";

type SidebarContentLayoutProps = SidebarContentController;

function CreateProjectModal({
  isOpen,
  creating,
  projectName,
  error,
  onChangeProjectName,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  creating: boolean;
  projectName: string;
  error: string | null;
  onChangeProjectName: (next: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2f3238] bg-[var(--surface-1)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">New Project Folder</p>
            <p className="text-xs text-gray-500">
              Choose a name for your project folder.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="space-y-4">
          <label className="block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Folder Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onChangeProjectName(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-[#2f3238] bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-white"
          />

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating || !projectName.trim()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function LeaveProjectModal({
  isOpen,
  isLeaving,
  projectName,
  error,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isLeaving: boolean;
  projectName: string;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2f3238] bg-[var(--surface-1)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Leave project?</p>
            <p className="text-xs text-gray-500">
              You&apos;ll be removed from&nbsp;
              <span className="text-white">{projectName}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLeaving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="rounded-xl border border-[#2f3238] bg-[#181b1f] p-4 text-sm text-gray-300">
          <p className="font-semibold text-white">You won&apos;t be able to rejoin unless re-invited.</p>
          <p className="mt-2 text-xs text-gray-400">
            Your tasks will remain in the project. Only the project owner can delete the project.
          </p>
          {error ? (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLeaving}
            className="rounded-lg border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLeaving}
            className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e26460] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLeaving ? "Leaving..." : "Leave project"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DeleteProjectModal({
  isOpen,
  isDeleting,
  projectName,
  error,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  projectName: string;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2f3238] bg-[var(--surface-1)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Delete project?</p>
            <p className="text-xs text-gray-500">
              This action permanently removes&nbsp;
              <span className="text-white">{projectName}</span>
              &nbsp;and all related tasks.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="rounded-xl border border-[#2f3238] bg-[#181b1f] p-4 text-sm text-gray-300">
          <p className="font-semibold text-white">You can&apos;t undo this.</p>
          <p className="mt-2 text-xs text-gray-400">
            Make sure you&apos;ve exported any information you still need before
            continuing. Tasks associated with this project will be deleted as
            well.
          </p>
          {error ? (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-[#2f3238] px-4 py-2 text-sm text-gray-300 transition hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e26460] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DesktopLinks({
  pathname,
  canShow,
  onInviteClick,
}: {
  pathname: string;
  canShow: boolean;
  onInviteClick: () => void;
}) {
  if (!canShow) return null;

  return (
    <>
      {pathname === "/features/kanban" ? (
        <button
          type="button"
          onClick={onInviteClick}
          className="mt-6 flex flex-shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white"
        >
          <div className="relative flex h-4 w-4 items-center justify-center">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <svg
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[var(--background)] bg-[var(--surface-2)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          Invite Member
        </button>
      ) : null}

      <Link
        href="/features/settings"
        className={`flex flex-shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-[var(--surface-2)] hover:text-white ${
          pathname === "/features/kanban" ? "" : "mt-6"
        }`}
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Settings
      </Link>
    </>
  );
}

export function SidebarContentLayout({
  pathname,
  projects,
  listLoading,
  error,
  isMounted,
  creating,
  localError,
  selectedProject,
  renamingProjectId,
  tempProjectName,
  renameInputRefs,
  isCreateModalOpen,
  newProjectName,
  projectPendingDelete,
  deleteError,
  isDeletingProject,
  isInviteModalOpen,
  setIsInviteModalOpen,
  pendingInviteCount,
  currentProject,
  openCreateModal,
  closeCreateModal,
  setNewProjectName,
  handleCreateProject,
  handleSelectProject,
  handleRenameClick,
  setTempProjectName,
  handleRenameSave,
  handleRenameCancel,
  handleDeleteClick,
  handleConfirmDelete,
  handleCancelDelete,
  handleConfirmLeave,
  isLeaveMode,
  ownerProjectIds,
}: SidebarContentLayoutProps) {
  return (
    <>
      <div className="flex h-full flex-col">
        <Link
          href="/features/kanban"
          className="mb-8 flex flex-shrink-0 items-center gap-4 rounded-lg border border-transparent"
        >
          <img
            src="/logo.svg"
            alt="TasklyAI logo"
            className="h-10 w-10 flex-shrink-0 object-contain"
          />
          <div>
            <p className="text-base font-semibold text-white">TasklyAI</p>
            <p className="text-xs text-gray-500">AI Kanban Board</p>
          </div>
        </Link>

        <Link
          href="/features/inbox"
          className={`mb-4 flex flex-shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-2)] hover:text-white ${
            pathname === "/features/inbox"
              ? "bg-[var(--surface-2)] text-white"
              : "text-gray-400"
          }`}
        >
          <Folder className="h-4 w-4 shrink-0" />
          Inbox
          {pendingInviteCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingInviteCount}
            </span>
          )}
        </Link>

        <div className="mb-4 flex flex-shrink-0 items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Main Menu
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={creating}
            className="rounded-lg p-1.5 text-gray-500 transition hover:cursor-pointer hover:bg-[var(--surface-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 min-h-0 flex-col gap-1 overflow-y-auto">
          <SidebarProjectList
            listLoading={listLoading}
            error={error}
            localError={localError}
            projects={projects}
            selectedProject={selectedProject}
            renamingProjectId={renamingProjectId}
            tempProjectName={tempProjectName}
            renameInputRefs={renameInputRefs}
            ownerProjectIds={ownerProjectIds}
            onSelectProject={handleSelectProject}
            onRenameClick={handleRenameClick}
            onTempProjectNameChange={setTempProjectName}
            onRenameSave={(projectId) => void handleRenameSave(projectId)}
            onRenameCancel={handleRenameCancel}
            onDeleteClick={handleDeleteClick}
          />
        </nav>

        <DesktopLinks
          pathname={pathname}
          canShow={Boolean(currentProject)}
          onInviteClick={() => setIsInviteModalOpen(true)}
        />
      </div>

      <CreateProjectModal
        isOpen={isMounted && isCreateModalOpen}
        creating={creating}
        projectName={newProjectName}
        error={localError}
        onChangeProjectName={setNewProjectName}
        onClose={closeCreateModal}
        onCreate={() => void handleCreateProject()}
      />

      <LeaveProjectModal
        isOpen={isMounted && Boolean(projectPendingDelete) && isLeaveMode}
        isLeaving={isDeletingProject}
        projectName={projectPendingDelete?.name ?? ""}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={() => void handleConfirmLeave()}
      />

      <DeleteProjectModal
        isOpen={isMounted && Boolean(projectPendingDelete) && !isLeaveMode}
        isDeleting={isDeletingProject}
        projectName={projectPendingDelete?.name ?? ""}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={() => void handleConfirmDelete()}
      />

      {isMounted && currentProject ? (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          projectName={currentProject.name}
          projectId={currentProject.id}
        />
      ) : null}
    </>
  );
}

