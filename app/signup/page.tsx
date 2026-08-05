"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const completeSignup = useMutation(api.users.completeSignup);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FREELANCER" | "CLIENT">("FREELANCER");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      await signIn("password", {
        email,
        password,
        flow: "signUp",
        name,
      });

      await completeSignup({
        name,
        role,
      });

      router.push("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 p-6 border rounded-xl"
      >
        <h1 className="text-2xl font-bold">
          Create Account
        </h1>

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

        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "FREELANCER" | "CLIENT")
          }
        >
          <option value="FREELANCER">
            Freelancer
          </option>

          <option value="CLIENT">
            Client
          </option>
        </select>


        <button
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Signup
        </button>

      </form>
    </div>
  );
}