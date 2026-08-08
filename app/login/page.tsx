"use client";

import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingLogin, setPendingLogin] = useState(false);
  const [error, setError] = useState("");

  const profile = useQuery(
    api.users.getCurrentUserProfile,
    pendingLogin && isAuthenticated ? {} : "skip"
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      setPendingLogin(true);
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your email and password.");
    }
  }

  useEffect(() => {
    if (!pendingLogin || !isAuthenticated || profile === undefined) return;

    if (!profile) {
      setError("Account has no profile yet. Contact support.");
      setPendingLogin(false);
      return;
    }

    router.push(profile.role === "FREELANCER" ? "/freelancer/dashboard" : "/client/dashboard");
  }, [pendingLogin, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 p-6 border rounded-xl">
        <h1 className="text-2xl font-bold">Login</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={pendingLogin}
          className="bg-black text-white p-2 rounded w-full disabled:opacity-50"
        >
          {pendingLogin ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}