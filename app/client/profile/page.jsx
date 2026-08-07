"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const EMPTY = { companyName: "", website: "", bio: "" };

export default function ClientProfilePage() {
  const existing = useQuery(api.clientProfiles.getMine);
  const upsert = useMutation(api.clientProfiles.upsert);

  const [form, setForm] = useState(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (existing !== undefined && !hydrated) {
      if (existing) setForm({ ...EMPTY, ...existing });
      setHydrated(true);
    }
  }, [existing, hydrated]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await upsert(form);
      setMessage("Company profile saved.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (existing === undefined) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Client Account</p>
      <h1 className="text-3xl font-semibold mb-8">Company profile</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Company name</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.companyName || ""}
            onChange={(e) => update("companyName", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Website</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.website || ""}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">About the company</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[120px]"
            value={form.bio || ""}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="What does your company do? What kind of freelancers do you usually hire?"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          {message && <span className="text-sm text-gray-500">{message}</span>}
        </div>
      </form>

      <p className="text-xs text-gray-400 mt-4">
        Logo upload isn't wired up yet — the schema already has a spot for it
        (`logoFileId`) once file storage is added to the project.
      </p>
    </div>
  );
}
