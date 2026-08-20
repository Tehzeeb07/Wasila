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
    <aside className="w-56 shrink-0 border-r border-[#1F6B41] bg-[#10251A] p-4 flex flex-col h-screen">
      <Link href="/" className="mb-6 px-2 block">
        <img src="/logo.png" alt="Wasila" className="h-8" />
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
                  ? "bg-primary text-[#10251A]"
                  : "text-[#F7F7F2] hover:bg-[#163B27]"
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