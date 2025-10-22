"use client";
import { useAuthStore } from "../stores/authStore/useAuthStore";
import { Loader2 } from "lucide-react";

export default function ClientAuthLoader() {
  const { isCheckingAuth } = useAuthStore();
  if (!isCheckingAuth) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-50 dark:bg-black">
      <Loader2 className="size-16 animate-spin text-purple-400" />
    </div>
  );
}