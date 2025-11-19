"use client";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useRequireAuth } from "@/core/auth/use-require-auth";

type FeaturesLayoutProps = {
  children: React.ReactNode;
};

export default function FeaturesLayout({ children }: FeaturesLayoutProps) {
  const { loading } = useRequireAuth();

  if (loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-6 px-6 py-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}

