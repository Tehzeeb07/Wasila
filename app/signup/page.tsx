"use client";

import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const completeSignup = useMutation(api.users.completeSignup);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FREELANCER" | "CLIENT">("FREELANCER");
  const [pendingSignup, setPendingSignup] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signIn("password", {
        email,
        password,
        flow: "signUp",
        name,
      });
      // Don't call completeSignup yet — wait for isAuthenticated to flip
      // true below, so the Convex client has the auth token propagated.
      setPendingSignup(true);
    } catch (err: any) {
      console.error(err);
      const message = err?.message ?? "";
      if (message.includes("Invalid password") || password.length < 8) {
        setError("Password must be at least 8 characters.");
      } else if (message.includes("already exists") || message.includes("InvalidAccountId")) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError("Signup failed. Check your details and try again.");
      }
    }
  }

  useEffect(() => {
    if (!pendingSignup || !isAuthenticated) return;

    completeSignup({ name, role })
      .then(() => {
        router.push(role === "FREELANCER" ? "/freelancer/dashboard" : "/client/dashboard");
      })
      .catch((err) => {
        console.error(err);
        setError("Account created but profile setup failed. Contact support.");
        setPendingSignup(false);
      });
  }, [pendingSignup, isAuthenticated, completeSignup, name, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 p-6 border rounded-xl"
      >
        <h1 className="text-2xl font-bold">Create Account</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          className="border p-2 w-full"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <input
            className="border p-2 w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className={`text-sm mt-1 ${password.length > 0 && password.length < 8 ? "text-red-500" : "text-white-400"}`}>
            Must be at least 8 characters
          </p>
        </div>

        <select
          className="border p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value as "FREELANCER" | "CLIENT")}
        >
          <option value="FREELANCER">Freelancer</option>
          <option value="CLIENT">Client</option>
        </select>

        <button
          type="submit"
          disabled={pendingSignup}
          className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {pendingSignup ? "Creating account..." : "Signup"}
        </button>
      </form>
    </div>
  );
}