"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

const OPTIONS = [
  { value: "AVAILABLE", label: "Available for work" },
  { value: "BUSY", label: "Busy" },
  { value: "NOT_ACCEPTING", label: "Not accepting jobs" },
];

export function AvailabilityToggle({ current }) {
  const setAvailability = useMutation(api.freelancerProfiles.setAvailability);

  async function handleChange(value) {
    try {
      await setAvailability({ availability: value });
      toast.success("Availability updated");
    } catch (e) {
      toast.error(e.message ?? "Failed to update");
    }
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
            current === opt.value
              ? "bg-primary text-[#3D4A2A] border-primary"
              : "text-green-100 border-[#556B2F] hover:bg-[#425030]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}