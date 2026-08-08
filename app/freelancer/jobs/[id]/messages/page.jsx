"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

export default function JobMessagesPage() {
  const params = useParams();
  const messages = useQuery(api.messages.listForJob, { jobId: params.id });
  const sendMessage = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      let fileId = undefined;

      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        fileId = storageId;
      }

      await sendMessage({
        jobId: params.id,
        content: text,
        fileId,
      });

      setText("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Project Chat</h1>
      <p className="text-gray-500 mb-6">
        Message and share files for this project.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 h-96 overflow-y-auto space-y-3">
        {messages?.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages?.map((m) => (
          <div key={m._id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              {m.senderName || "User"}
            </p>
            {m.content && <p className="text-sm text-gray-800">{m.content}</p>}
            {m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 text-xs mt-1 inline-block"
              >
                📎 View attached file
              </a>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}