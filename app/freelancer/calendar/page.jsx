"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const proposals = useQuery(api.proposals.getMyProposals);
  const reviews = useQuery(api.reviews.getMyReviews);
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events = {};
  proposals?.forEach((p) => {
    const d = new Date(p._creationTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      events[day] = events[day] || [];
      events[day].push({ type: "proposal", label: "Proposal sent" });
    }
  });
  reviews?.forEach((r) => {
    const d = new Date(r._creationTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      events[day] = events[day] || [];
      events[day].push({ type: "review", label: "Review received" });
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="-m-6 md:-m-10">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 md:rounded-3xl md:mx-10 md:mt-10 px-6 md:px-10 py-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <CalendarIcon size={110} className="text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-emerald-100 text-sm mt-2">
            Your proposal and review activity at a glance.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10 pt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">
              {current.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(new Date(year, month - 1, 1))}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrent(new Date(year, month + 1, 1))}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl p-2 text-xs ${
                  d === null
                    ? ""
                    : isToday(d)
                    ? "bg-emerald-600 text-white font-bold"
                    : "border border-gray-100 text-gray-700"
                }`}
              >
                {d && (
                  <>
                    <span>{d}</span>
                    {events[d] && (
                      <div className="flex gap-0.5 mt-1">
                        {events[d].map((e, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              e.type === "proposal" ? "bg-blue-400" : "bg-amber-400"
                            } ${isToday(d) ? "opacity-100" : ""}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Proposal sent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Review received
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}