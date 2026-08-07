"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PortfolioPage() {
  const items = useQuery(api.portfolioItems.getMyPortfolio);
  const generateUploadUrl = useMutation(api.portfolioItems.generateUploadUrl);
  const addPortfolioItem = useMutation(api.portfolioItems.addPortfolioItem);
  const deletePortfolioItem = useMutation(api.portfolioItems.deletePortfolioItem);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageFileId = undefined;

      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageFileId = storageId;
      }

      await addPortfolioItem({
        title,
        description,
        projectUrl,
        imageFileId,
      });

      setTitle("");
      setDescription("");
      setProjectUrl("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Portfolio</h1>
      <p className="text-gray-500 mb-8">
        Showcase your past work to attract clients.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-8"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="url"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="Project link (optional)"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Add Portfolio Item"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items?.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            {item.projectUrl && (
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 text-sm mt-2 inline-block"
              >
                View Project →
              </a>
            )}
            <button
              onClick={() => deletePortfolioItem({ id: item._id })}
              className="text-xs text-red-500 mt-3 block"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}