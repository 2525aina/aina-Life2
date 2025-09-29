"use client";

import { useUser } from "@/hooks/useUser";
import { Toaster } from "@/components/ui/sonner";

export function ToastProvider() {
  const { userProfile } = useUser();
  const toastPosition = userProfile?.settings?.toastPosition || "top-center";

  return <Toaster position={toastPosition} richColors offset="64px" />;
}
