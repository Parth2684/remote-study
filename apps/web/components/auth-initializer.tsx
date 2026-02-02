"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore/useAuthStore";

export default function AuthInitializer() {
  const pathname = usePathname();
  const { checkAuth, authUser } = useAuthStore();

  useEffect(() => {
    if (pathname === "/") return;

    if (authUser) return;

    checkAuth();
  }, [pathname]);

  return null;
}
