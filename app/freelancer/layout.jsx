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
  { name: "Messages", href: "/freelancer/messages", icon: Inbox },
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
    <div className="min-h-screen bg-[#14532D] flex">
      <aside className="w-64 bg-[#10251A] border-r border-[#1F6B41] min-h-screen sticky top-0 hidden md:block">
        <div className="p-6 border-b border-[#1F6B41]">
          <Link href="/" className="text-xl font-bold text-primary hover:underline">
            Wasila
          </Link>
          <p className="text-xs text-[#C5DDCB]">Freelancer Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition ${
                  active
                    ? "bg-primary text-[#10251A]"
                    : "text-[#F7F7F2] hover:bg-[#163B27]"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="md:hidden bg-[#10251A] border-b border-[#1F6B41] p-4 flex gap-4 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm whitespace-nowrap text-[#F7F7F2]"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-10 max-w-6xl mx-auto text-[#F7F7F2]">{children}</div>
      </main>
    </div>
  );
}