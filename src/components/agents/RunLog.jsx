import React from "react";
import { formatDistanceToNow } from "date-fns";

const LABELS = {
  lead_capture: "Lead Capture",
  broadcast: "Broadcast",
  followups: "Follow-ups",
  conversion: "Conversion",
  control_room: "Control Room",
};

export default function RunLog({ runs }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100 font-medium text-slate-800 text-sm">
        Live agent activity
      </div>
      {runs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-400">
          No agent runs yet — hit "Run All Agents" to kick off the pipeline.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {runs.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-start gap-3">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                  r.status === "success" ? "bg-emerald-500" : r.status === "error" ? "bg-red-500" : "bg-amber-400 animate-pulse"
                }`}
              />
              <div className="min-w-0">
                <div className="text-sm text-slate-800">
                  {LABELS[r.agent] || r.agent}
                  <span className="text-xs text-slate-400 ml-2">
                    {r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : ""}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{r.summary || r.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}