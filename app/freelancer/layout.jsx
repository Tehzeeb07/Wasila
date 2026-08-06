"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/freelancer/dashboard" },
  { name: "Find Jobs", href: "/freelancer/jobs" },
  { name: "My Proposals", href: "/freelancer/proposals" },
  { name: "Saved Jobs", href: "/freelancer/bookmarks" },
  { name: "My Profile", href: "/freelancer/profile" },
];

export default function FreelancerLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 hidden md:block">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-emerald-700">Wasila</h1>
          <p className="text-xs text-gray-500">Freelancer Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Mobile top nav */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex gap-4 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm whitespace-nowrap text-gray-600"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-10 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}