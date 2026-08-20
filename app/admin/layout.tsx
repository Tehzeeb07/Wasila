import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#14532D]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 text-[#F7F7F2]">{children}</main>
    </div>
  );
}