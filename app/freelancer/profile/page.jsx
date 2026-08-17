"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SkillBadge from "@/components/client/SkillBadge"; // ADDED

export default function FreelancerProfilePage() {
  const profile = useQuery(api.freelancerProfiles.getMyProfile);
  const upsertProfile = useMutation(api.freelancerProfiles.upsertProfile);
  const generateUploadUrl = useMutation(api.freelancerProfiles.generateUploadUrl);

  // ADDED — verification progress per skill, computed from actual job/review history
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-gray-500 mb-8">
        This is how clients will see you on the platform.
      </p>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-gray-200 p-8 space-y-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Professional Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full Stack Developer | React & Node.js Expert"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
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
                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

        {/* ADDED — verification progress, separate from the plain skill-name preview above */}
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
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
    </div>
  );
}