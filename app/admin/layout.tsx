import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#3D4A2A]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 text-green-50">{children}</main>
    </div>
  );
}