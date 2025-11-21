"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";

import { SidebarContent } from "./sidebar-content";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <>
      {/* Dark Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/70 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[9999] flex h-screen w-64 flex-col border-r border-[#282b30] bg-[var(--surface-1)] p-6 text-sm text-gray-300 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onProjectSelect={onClose} />
      </aside>
    </>,
    document.body
  );
}
