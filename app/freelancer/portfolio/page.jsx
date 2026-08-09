"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Plus,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  Link2,
} from "lucide-react";

export default function PortfolioPage() {
  const items = useQuery(api.portfolioItems.getMyPortfolio);
  const generateUploadUrl = useMutation(api.portfolioItems.generateUploadUrl);
  const addPortfolioItem = useMutation(api.portfolioItems.addPortfolioItem);
  const deletePortfolioItem = useMutation(api.portfolioItems.deletePortfolioItem);

  const [showForm, setShowForm] = useState(false);
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
      await addPortfolioItem({ title, description, projectUrl, imageFileId });
      setTitle("");
      setDescription("");
      setProjectUrl("");
      setFile(null);
      setShowForm(false);
      e.target.reset();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const withLinks = items?.filter((i) => i.projectUrl).length ?? 0;
  const withImages = items?.filter((i) => i.imageUrl).length ?? 0;

  return (
    <div className="-m-6 md:-m-10">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 md:rounded-3xl md:mx-10 md:mt-10 px-6 md:px-10 py-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <FolderOpen size={110} className="text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
          <p className="text-emerald-100 text-sm mt-2">
            Showcase your past work to attract clients and win more projects.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition mt-5"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10 pt-6 space-y-6">
        {/* Overview stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<FolderOpen size={18} />}
            value={items?.length ?? 0}
            label="Total Projects"
            color="bg-emerald-600"
          />
          <StatCard
            icon={<ImageIcon size={18} />}
            value={withImages}
            label="With Images"
            color="bg-blue-500"
          />
          <StatCard
            icon={<Link2 size={18} />}
            value={withLinks}
            label="With Links"
            color="bg-purple-500"
          />
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={3}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
            />
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="Project link (optional)"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Project image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Add Portfolio Item"}
            </button>
          </form>
        )}

        {items?.length === 0 && !showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-4">
              No portfolio items yet — add your first project to attract
              clients.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-emerald-600 text-sm font-semibold hover:underline"
            >
              + Add your first project
            </button>
          </div>
        )}

        {/* List view */}
        <div className="space-y-3">
          {items?.map((item) => (
            <PortfolioRow
              key={item._id}
              item={item}
              onDelete={() => deletePortfolioItem({ id: item._id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`${color} text-white w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function PortfolioRow({ item, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={22} className="text-emerald-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {item.description || "No description"}
        </p>
        {item.projectUrl && (
          <a>
            href={item.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-1 hover:underline w-fit"
        
            View Project <ExternalLink size={11} />
          </a>
        )}
      </div>

      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-500 transition shrink-0 p-2"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}