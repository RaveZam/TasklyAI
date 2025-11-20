"use client";

import { ProjectsProvider } from "@/app/features/projects/hooks/projects-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ProjectsProvider>{children}</ProjectsProvider>;
}


