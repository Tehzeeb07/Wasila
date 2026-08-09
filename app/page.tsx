import Link from "next/link";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-xl font-bold text-primary">Wasila</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-green-100 hover:text-white">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary text-[#3D4A2A] px-4 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            Sign up
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-primary">
          Find work. Hire talent.
        </h1>
        <p className="text-lg text-green-100 max-w-xl mb-8">
          Wasila connects freelancers and clients — post jobs, submit proposals,
          manage projects, and get paid for great work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-primary text-[#3D4A2A] font-medium hover:bg-primary-dark transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-primary text-primary font-medium hover:bg-primary hover:text-[#3D4A2A] transition"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}