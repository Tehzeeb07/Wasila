import Link from "next/link";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FF6F59]">
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-xl font-bold text-[#16233D]">Wasila</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#16233D] hover:text-black">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            Sign up
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#16233D]">
          Find work. Hire talent.
        </h1>
        <p className="text-lg text-[#3D2A22] max-w-xl mb-8">
          Wasila connects freelancers and clients — post jobs, submit proposals,
          manage projects, and get paid for great work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-[#16233D] text-[#16233D] font-medium hover:bg-white/20 transition"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}