"use client";

import Link from "next/link";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useRequireAuth } from "@/core/auth/use-require-auth";

export default function HomePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const isAuthenticated = !!user && !authLoading;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-6 px-6 py-8 lg:px-12">
          <section className="flex flex-col gap-4 rounded-2xl border border-[#282b30] bg-[var(--surface-1)] p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-white">Welcome back</h2>
              <p className="text-sm text-gray-400">
                Manage tasks, brainstorm next steps, and explore Taskly
                features.
              </p>
            </div>
            <Link
              href="/features/kanban"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-[#7289da] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7f97df]"
            >
              Open Kanban Workspace
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
