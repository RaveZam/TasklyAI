"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useRequireAuth } from "@/core/auth/use-require-auth";
import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile_components/ui/mobile-sidebar";
import { AuthTransitionScreen } from "@/components/ui/auth-transition-screen";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const {
    loading: projectsLoading,
    error: projectsError,
    ensureDefaultProject,
  } = useProjects();
  const [initializingProjects, setInitializingProjects] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const init = async () => {
      setInitializingProjects(true);
      setInitializationError(null);

      try {
        const project = await ensureDefaultProject();
        if (!cancelled && project) {
          router.replace(`/features/kanban?project=${project.id}`);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to prepare your first workspace.";
          setInitializationError(message);
        }
      } finally {
        if (!cancelled) {
          setInitializingProjects(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [ensureDefaultProject, isAuthenticated, retryCount, router]);

  if (authLoading) {
    return (
      <AuthTransitionScreen
        title="Checking your session"
        message="Please wait while we verify your account."
      />
    );
  }

  if (!user) {
    return (
      <AuthTransitionScreen
        title="Redirecting to sign in"
        message="Your session ended. Hold tight while we take you to login."
      />
    );
  }

  const displayError = initializationError ?? projectsError;
  const showLoadingScreen =
    (initializingProjects || projectsLoading) && !displayError;
  if (showLoadingScreen) {
    return (
      <AuthTransitionScreen
        title="Preparing your workspace"
        message="Hang tight while we load your projects and tasks."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex flex-1 flex-col gap-6 px-6 py-4 lg:px-12">
          <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-white">
                Preparing your workspace
              </h2>
              <p className="text-sm text-gray-400">
                {!displayError
                  ? "Hold tight while we ensure your first project is ready."
                  : displayError}
              </p>
            </div>
            {displayError && (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="inline-flex w-fit items-center justify-center rounded-lg bg-[#d9534f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e26460]"
              >
                Retry
              </button>
            )}
          </section>
        </main>
      </div>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </div>
  );
}
