"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useRequireAuth } from "@/core/auth/use-require-auth";
import { useProjects } from "@/app/features/projects/hooks/projects-provider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
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

  const showSkeleton =
    (initializingProjects || projectsLoading) &&
    !(initializationError ?? projectsError);
  const displayError = initializationError ?? projectsError;

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-6 px-6 py-8 lg:px-12">
          {showSkeleton ? (
            <ProjectsBootstrapSkeleton />
          ) : (
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
          )}
        </main>
      </div>
    </div>
  );
}

function ProjectsBootstrapSkeleton() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-[#303338]" />
        <div className="h-6 w-48 animate-pulse rounded bg-[#3a3d42]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[#2d3035]" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-[#2d3035]" />
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-[#1e2124]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((key) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-xl border border-[#2f3238] bg-[#1f2225] p-4"
          >
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#2d3035]" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#2d3035]" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-[#2d3035]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#2d3035]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
