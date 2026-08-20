import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F4EFE4]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-xl font-bold text-primary">Wasila</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#1F3B2E] hover:text-primary">
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

      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center gap-10 px-8 lg:px-20 py-16">
        <div className="flex-1 text-left">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#1F3B2E] leading-tight">
            More than just work.
            <br />
            It&apos;s a feeling.
          </h1>
          <p className="text-lg text-[#3F5548] max-w-xl mb-8">
            Wasila connects freelancers and clients — post jobs, submit proposals,
            manage projects, and get paid for great work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-[#C9A87C] text-[#1F3B2E] font-medium hover:bg-[#ECE4D3] transition text-center"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/work.jpeg"
              alt="People working together"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Feature strip - Fiverr style */}
      <section className="bg-[#1F3B2E] px-8 lg:px-20 py-16 rounded-t-3xl">
        <h2 className="text-3xl font-bold text-[#F7F7F2] mb-10 text-center">
          Everything you need to get work done
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#2E4A38] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F7F7F2] mb-2">Post a Job</h3>
            <p className="text-sm text-[#C5DDCB]">
              Share your project details and get proposals from skilled freelancers.
            </p>
          </div>
          <div className="bg-[#2E4A38] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F7F7F2] mb-2">Find Talent</h3>
            <p className="text-sm text-[#C5DDCB]">
              Browse profiles, portfolios, and reviews to find the right fit.
            </p>
          </div>
          <div className="bg-[#2E4A38] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F7F7F2] mb-2">Get Paid</h3>
            <p className="text-sm text-[#C5DDCB]">
              Track milestones and payments securely, all in one place.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}