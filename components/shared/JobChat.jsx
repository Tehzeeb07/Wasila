"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function JobChat({ jobId, currentUserId }) {
  const messages = useQuery(api.messages.listForJob, { jobId });
  const typingUsers = useQuery(api.messages.getTypingUsers, { jobId });
  const send = useMutation(api.messages.send);
  const setTyping = useMutation(api.messages.setTyping);
  const markRead = useMutation(api.messages.markRead);

  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages && messages.length > 0) {
      markRead({ jobId });
    }
  }, [messages, jobId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInputChange(e) {
    setContent(e.target.value);

    if (typingTimeoutRef.current) return;
    setTyping({ jobId });
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1000);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await send({ jobId, content: content.trim() });
    setContent("");
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#2E3820] rounded-xl border border-[#556B2F]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages === undefined && (
          <p className="text-green-200 text-sm">Loading messages…</p>
        )}
        {messages?.length === 0 && (
          <p className="text-green-200 text-sm">No messages yet — say hello!</p>
        )}
        {messages?.map((m) => {
          const isMe = m.senderUserId === currentUserId;
          const seen = m.readBy && m.readBy.length > 0;
          return (
            <div
              key={m._id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-[#3D4A2A]"
                    : "bg-[#425030] text-green-50"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold mb-0.5 opacity-80">
                    {m.senderName}
                  </p>
                )}
                <p>{m.content}</p>
                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-xs block mt-1"
                  >
                    📎 Attachment
                  </a>
                )}
              </div>
              {isMe && (
                <span className="text-[10px] text-green-300 mt-1">
                  {seen ? "Seen" : "Sent"}
                </span>
              )}
            </div>
          );
        })}

        {typingUsers && typingUsers.length > 0 && (
          <p className="text-xs text-green-300 italic">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-[#556B2F] p-3"
      >
        <input
          value={content}
          onChange={handleInputChange}
          placeholder="Type a message…"
          className="flex-1 bg-[#3D4A2A] text-green-50 placeholder-green-300 rounded-lg px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-primary text-[#3D4A2A] font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}