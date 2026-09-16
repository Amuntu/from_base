import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AgentCard({ title, description, icon: Icon, onRun, running, lastRun, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="font-medium text-slate-900 text-sm">{title}</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">{description}</p>
      {children}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className={`text-[11px] ${lastRun?.status === "error" ? "text-red-500" : lastRun ? "text-emerald-600" : "text-slate-300"}`}>
          {lastRun
            ? `${lastRun.status} · ${formatDistanceToNow(new Date(lastRun.created_date), { addSuffix: true })}`
            : "never run"}
        </span>
        <Button size="sm" onClick={onRun} disabled={running}>
          {running ? (
            <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>
          ) : "Run"}
        </Button>
      </div>
    </div>
  );
}