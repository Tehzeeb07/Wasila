"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

const NAV = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/profile", label: "Company Profile" },
  { href: "/client/jobs", label: "Job Postings" },
  { href: "/client/proposals", label: "Proposals" },
  { href: "/client/projects", label: "Projects" },
  { href: "/client/messages", label: "Messages" },
];

export default function ClientSidebar({ name }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside className="w-60 shrink-0 border-r border-[#556B2F] bg-[#2E3820] flex flex-col">
      <div className="px-6 py-6 border-b border-[#556B2F]">
        <Link href="/" className="text-[0.65rem] tracking-widest uppercase text-primary hover:underline">
          Wasila
        </Link>
        <h1 className="text-xl font-semibold mt-1 text-green-50">Client Portal</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-[#3D4A2A]"
                  : "text-green-100 hover:bg-[#425030]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-[#556B2F]">
        <p className="text-sm font-medium truncate text-green-50">{name}</p>
        <button
          onClick={handleSignOut}
          className="text-xs uppercase tracking-widest text-green-300 hover:text-red-400 mt-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}