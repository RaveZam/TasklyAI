"use client";

import { SidebarContent } from "@/components/mobile_components/ui/sidebar-content";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[#282b30] bg-[var(--surface-1)] p-6 text-sm text-gray-300 lg:flex">
      <SidebarContent />
    </aside>
  );
}
