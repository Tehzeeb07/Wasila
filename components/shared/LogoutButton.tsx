"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function LogoutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      onClick={() => signOut()}
      className="text-sm text-gray-500 hover:text-gray-800"
    >
      Log out
    </button>
  );
}