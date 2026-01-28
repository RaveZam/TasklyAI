"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type SnackbarType = "success" | "error";

type SnackbarProps = {
  message: string;
  type: SnackbarType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
};

export function Snackbar({
  message,
  type,
  isOpen,
  onClose,
  duration = 4000,
}: SnackbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, duration, onClose]);

  if (!isMounted || !isOpen) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500/90 backdrop-blur-sm"
      : "bg-red-500/90 backdrop-blur-sm";

  return createPortal(
    <div
      className={`fixed right-4 top-4 z-[10000] transition-all duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${bgColor} rounded-lg px-4 py-3 shadow-lg border border-white/10 min-w-[300px] max-w-md`}
      >
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
    </div>,
    document.body
  );
}
