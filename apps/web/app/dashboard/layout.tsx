"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return <div style={{ padding: 24 }}>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}