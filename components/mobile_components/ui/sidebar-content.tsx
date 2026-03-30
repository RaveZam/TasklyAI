"use client";

import {
  SidebarContentLayout,
} from "@/components/mobile_components/components/sidebar/SidebarContentLayout";
import { useSidebarContentController } from "@/components/mobile_components/components/sidebar/useSidebarContentController";

type SidebarContentProps = {
  onProjectSelect?: () => void;
};

export function SidebarContent({ onProjectSelect }: SidebarContentProps) {
  const controller = useSidebarContentController({ onProjectSelect });
  return <SidebarContentLayout {...controller} />;
}
