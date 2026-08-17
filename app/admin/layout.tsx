import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FF6F59]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 text-[#16233D]">{children}</main>
    </div>
  );
}