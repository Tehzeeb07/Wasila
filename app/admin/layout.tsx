import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#16233D]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 text-slate-100">{children}</main>
    </div>
  );
}