"use client";

import { SidebarContent } from "@/components/mobile_components/ui/sidebar-content";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh h-screen w-64 flex-col border-r border-[#282b30] bg-[var(--surface-1)] text-sm text-gray-300 lg:flex">
      <div className="flex h-full flex-col overflow-hidden p-6">
        <SidebarContent />
      </div>
    </aside>
  );
}
