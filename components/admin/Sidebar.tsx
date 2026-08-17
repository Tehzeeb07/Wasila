"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/activity", label: "Activity" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#2E4372] bg-[#12203A] p-4 flex flex-col h-screen">
      <Link
        href="/"
        className="text-lg font-semibold mb-6 px-2 text-primary hover:underline block"
      >
        ← Wasila
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-[#1E2F4F]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pb-4">
        <LogoutButton />
      </div>
    </aside>
  );
}