"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ClientSidebar from "@/components/client/ClientSidebar";

export default function ClientLayout({ children }) {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const router = useRouter();

  useEffect(() => {
    if (profile === null) {
      router.replace("/login");
    } else if (profile && profile.role !== "CLIENT") {
      router.replace("/");
    } else if (profile && profile.status === "SUSPENDED") {
      router.replace("/suspended");
    }
  }, [profile, router]);

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-green-100 bg-[#3D4A2A]">
        Loading…
      </div>
    );
  }

  if (!profile || profile.role !== "CLIENT") return null;

  return (
    <div className="min-h-screen flex bg-[#3D4A2A]">
      <ClientSidebar name={profile.name} />
      <main className="flex-1 px-8 py-8 max-w-5xl text-green-50">{children}</main>
    </div>
  );
}