"use client";

import { useState, useEffect } from "react";
import { AvailabilityToggle } from "@/components/shared/AvailabilityToggle";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SkillBadge from "@/components/client/SkillBadge";

export default function FreelancerProfilePage() {
  const profile = useQuery(api.freelancerProfiles.getMyProfile);
  const upsertProfile = useMutation(api.freelancerProfiles.upsertProfile);
  const generateUploadUrl = useMutation(api.freelancerProfiles.generateUploadUrl);

  const skillStats = useQuery(
    api.skillBadges.getSkillStats,
    profile ? { freelancerUserId: profile.userId } : "skip"
  );

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setHourlyRate(profile.hourlyRate?.toString() || "");
      setSkillsInput(profile.skills?.join(", ") || "");
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let resumeFileId = profile?.resumeFileId;

      if (resumeFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": resumeFile.type },
          body: resumeFile,
        });
        const { storageId } = await result.json();
        resumeFileId = storageId;
      }

      await upsertProfile({
        headline,
        bio,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        skills: skillsArray,
        resumeFileId,
      });
      setMessage("✓ Profile saved successfully");
      setResumeFile(null);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (profile === undefined) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const checklist = [
    { label: "Headline", weight: 20, done: !!headline },
    { label: "Bio", weight: 20, done: !!bio },
    { label: "Hourly Rate", weight: 15, done: !!hourlyRate },
    { label: "Skills", weight: 20, done: skillsInput.trim().length > 0 },
    { label: "Resume", weight: 25, done: !!(resumeFile || profile?.resumeFileId) },
  ];
  const completion = checklist.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-gray-500 mb-8">
        This is how clients will see you on the platform.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 space-y-6"
        >
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {headline ? headline[0].toUpperCase() : "F"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {headline || "Your headline"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your profile photo comes from your account avatar.
              </p>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Availability
            </label>
            <AvailabilityToggle current={profile?.availability} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full Stack Developer | React & Node.js Expert"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder="Tell clients about your experience and expertise..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="15"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Node.js, Convex"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resume / CV
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="w-full text-sm"
            />
            {profile?.resumeFileId && !resumeFile && (
              <p className="text-xs text-emerald-600 mt-1">
                ✓ Resume already uploaded
              </p>
            )}
          </div>

          {skillsInput && (
            <div className="flex flex-wrap gap-2">
              {skillsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, i) => (
                  <span
                    key={i}
                    className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          )}

          {skillStats && skillStats.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skill Verification
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Based on your completed jobs and client ratings — automatic, no quiz needed.
              </p>
              <div className="space-y-2">
                {skillStats.map((s) => (
                  <div
                    key={s.skill}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.skill}</p>
                      <p className="text-xs text-gray-400">
                        {s.completedJobs} completed job{s.completedJobs !== 1 ? "s" : ""}
                        {s.averageRating !== null ? ` · ${s.averageRating}★ avg` : ""}
                      </p>
                    </div>
                    {s.verified ? (
                      <SkillBadge skill={s.skill} />
                    ) : (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {s.completedJobs}/3 jobs to verify
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {message && (
              <span
                className={`text-sm ${
                  message.startsWith("✓") ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {message}
              </span>
            )}
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-5">
            Complete your profile
          </h2>

          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#059669"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - completion / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {completion}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.done
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.done ? "✓" : "✕"}
                  </span>
                  <span className={item.done ? "text-gray-700" : "text-gray-400"}>
                    {item.label}
                  </span>
                </span>
                <span className="text-xs text-gray-400">+{item.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}