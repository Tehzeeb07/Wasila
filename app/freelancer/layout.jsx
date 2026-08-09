"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  User,
  Briefcase,
  Star,
  Inbox,
  Calendar,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/freelancer/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/freelancer/inbox", icon: Inbox },
  { name: "Calendar", href: "/freelancer/calendar", icon: Calendar },
  { name: "Find Jobs", href: "/freelancer/jobs", icon: Search },
  { name: "My Proposals", href: "/freelancer/proposals", icon: FileText },
  { name: "Saved Jobs", href: "/freelancer/bookmarks", icon: Bookmark },
  { name: "My Profile", href: "/freelancer/profile", icon: User },
  { name: "Portfolio", href: "/freelancer/portfolio", icon: Briefcase },
  { name: "Reviews", href: "/freelancer/reviews", icon: Star },
];

export default function FreelancerLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#3D4A2A] flex">
      <aside className="w-64 bg-[#2E3820] border-r border-[#556B2F] min-h-screen sticky top-0 hidden md:block">
        <div className="p-6 border-b border-[#556B2F]">
          <Link href="/" className="text-xl font-bold text-primary hover:underline">
            Wasila
          </Link>
          <p className="text-xs text-green-200">Freelancer Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-primary text-[#3D4A2A]"
                    : "text-green-100 hover:bg-[#425030]"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="md:hidden bg-[#2E3820] border-b border-[#556B2F] p-4 flex gap-4 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm whitespace-nowrap text-green-100"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-10 max-w-6xl mx-auto text-green-50">{children}</div>
      </main>
    </div>
  );
}