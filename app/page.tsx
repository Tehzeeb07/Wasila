import Link from "next/link";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#14532D]">
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-xl font-bold text-primary">Wasila</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#F7F7F2] hover:text-primary">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary text-[#10251A] px-4 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            Sign up
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#F7F7F2]">
          Find work. Hire talent.
        </h1>
        <p className="text-lg text-[#C5DDCB] max-w-xl mb-8">
          Wasila connects freelancers and clients — post jobs, submit proposals,
          manage projects, and get paid for great work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-primary text-[#10251A] font-medium hover:bg-primary-dark transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-[#1F6B41] text-[#F7F7F2] font-medium hover:bg-[#163B27] transition"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}