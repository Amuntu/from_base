import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_META = {
  pending: { label: "Working…", icon: Loader2, spin: true, cls: "text-slate-400" },
  running: { label: "Working…", icon: Loader2, spin: true, cls: "text-slate-400" },
  in_progress: { label: "Working…", icon: Loader2, spin: true, cls: "text-slate-400" },
  success: { label: "Done", icon: CheckCircle2, cls: "text-emerald-600" },
  completed: { label: "Done", icon: CheckCircle2, cls: "text-emerald-600" },
  failed: { label: "Failed", icon: XCircle, cls: "text-red-500" },
  error: { label: "Failed", icon: XCircle, cls: "text-red-500" },
};

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const raw = String(toolCall.results ?? "");
  const failed = ["failed", "error"].includes(toolCall.status) || /error|failed/i.test(raw);
  const meta = failed ? STATUS_META.error : STATUS_META[toolCall.status] || STATUS_META.pending;

  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try { parsedResults = JSON.parse(parsedResults); } catch { parsedResults = raw; }
  }

  const Icon = meta.icon;
  return (
    <div className="mt-2 text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 ${meta.cls}`}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <Icon className={`w-3.5 h-3.5 ${meta.spin ? "animate-spin" : ""}`} />
        <span className="font-mono">{toolCall.name}</span>
        <span>— {meta.label}</span>
      </button>
      {expanded && (
        <div className="mt-1.5 ml-6 space-y-1.5 text-slate-500">
          <div>
            <span className="text-slate-400">Parameters:</span>
            <pre className="whitespace-pre-wrap font-mono bg-slate-50 rounded p-2 mt-1">{toolCall.arguments_string || "{}"}</pre>
          </div>
          <div>
            <span className="text-slate-400">Result:</span>
            <pre className="whitespace-pre-wrap font-mono bg-slate-50 rounded p-2 mt-1">{JSON.stringify(parsedResults, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-slate-50 border border-slate-100"}`}>
        {message.content && (
          isUser
            ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            : <div className="text-sm leading-relaxed [&_li]:ml-4 [&_ul]:list-disc [&_ol]:list-decimal [&_strong]:font-semibold">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
        )}
        {message.tool_calls?.map((toolCall, i) => <FunctionDisplay key={i} toolCall={toolCall} />)}
      </div>
    </div>
  );
}