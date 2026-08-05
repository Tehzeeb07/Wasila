"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const { signIn } = useAuthActions();
  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");


  async function handleLogin(e:React.FormEvent){
    e.preventDefault();

    try{

      await signIn("password",{
        email,
        password,
        flow:"signIn"
      });

      router.push("/dashboard");

    }catch(error){
      console.error(error);
      alert("Login failed");
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 p-6 border rounded-xl"
      >

        <h1 className="text-2xl font-bold">
          Login
        </h1>


        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          onChange={(e)=>setEmail(e.target.value)}
        />


        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          onChange={(e)=>setPassword(e.target.value)}
        />


        <button className="bg-black text-white p-2 rounded w-full">
          Login
        </button>

      </form>

    </div>
  );
}