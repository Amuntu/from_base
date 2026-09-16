import React from "react";

const NODES = [
  { id: "control", label: "Control Room", x: 460, y: 16, w: 220, h: 60, type: "control" },
  { id: "lead", label: "Lead Capture", x: 130, y: 140, w: 190, h: 64, type: "agent" },
  { id: "broadcast", label: "Broadcast", x: 360, y: 140, w: 190, h: 64, type: "agent" },
  { id: "followups", label: "Follow-ups", x: 590, y: 140, w: 190, h: 64, type: "agent" },
  { id: "conversion", label: "Conversion", x: 820, y: 140, w: 190, h: 64, type: "agent" },
  { id: "whatsapp", label: "WhatsApp", x: 170, y: 268, w: 150, h: 54, type: "channel", channel: "whatsapp" },
  { id: "email", label: "Email", x: 390, y: 268, w: 150, h: 54, type: "channel", channel: "email" },
  { id: "voice", label: "AI Voice", x: 610, y: 268, w: 150, h: 54, type: "channel", channel: "voice" },
  { id: "human", label: "Human Call", x: 830, y: 268, w: 150, h: 54, type: "channel", channel: "human" },
  { id: "sources", label: "Lead Sources", x: 170, y: 372, w: 150, h: 54, type: "store" },
  { id: "rfq", label: "RFQ Store", x: 390, y: 372, w: 150, h: 54, type: "store" },
  { id: "suppliers", label: "Suppliers", x: 610, y: 372, w: 150, h: 54, type: "store" },
  { id: "stripe", label: "Stripe", x: 830, y: 372, w: 150, h: 54, type: "store" },
];

const EDGES = [
  ["control", "lead"], ["control", "broadcast"], ["control", "followups"], ["control", "conversion"],
  ["sources", "lead"], ["lead", "rfq"], ["rfq", "broadcast"],
  ["suppliers", "broadcast"], ["suppliers", "followups"], ["suppliers", "conversion"],
  ["stripe", "suppliers"],
  ["broadcast", "whatsapp"], ["broadcast", "email"],
  ["followups", "whatsapp"], ["followups", "email"], ["followups", "voice"], ["followups", "human"],
  ["conversion", "email"],
];

const AGENT_RUN_KEY = {
  lead: "lead_capture",
  broadcast: "broadcast",
  followups: "followups",
  conversion: "conversion",
  control: "control_room",
};

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

const edgePath = (a, b) => {
  const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2, by = b.y + b.h / 2;
  const mx = (ax + bx) / 2;
  return `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
};

export default function AgentGraph({ counts = {}, config = {}, runs = [], selectedId, onSelect }) {
  const channelActive = {
    whatsapp: !!(config.whatsapp_enabled && config.whatsapp_api_url && config.whatsapp_api_token),
    email: !!(config.email_enabled && config.email_api_url && config.email_api_key),
    voice: !!(config.voice_enabled && config.voice_api_url && config.voice_api_key),
  };

  const isAgentish = (n) => n.type === "agent" || n.type === "control";

  const nodeActive = (n) => {
    if (isAgentish(n) || n.type === "store") return true;
    if (n.channel === "human") return true;
    return !!channelActive[n.channel];
  };

  const rectClass = (n) => {
    if (isAgentish(n)) return "fill-primary";
    if (n.type === "store") return "fill-white stroke-slate-200";
    if (n.channel === "human") return "fill-amber-50 stroke-amber-300";
    return channelActive[n.channel] ? "fill-emerald-50 stroke-emerald-400" : "fill-slate-50 stroke-slate-200";
  };

  const dotClass = (n) => {
    if (n.channel === "human") return "fill-amber-400";
    return nodeActive(n) ? "fill-emerald-500 animate-pulse" : "fill-slate-300";
  };

  const meta = (n) => {
    if (isAgentish(n)) {
      const key = AGENT_RUN_KEY[n.id];
      const total = runs.filter((r) => r.agent === key).length;
      const last = runs.find((r) => r.agent === key);
      return total ? `${total} run${total === 1 ? "" : "s"} · last: ${last?.status || "—"}` : "never run";
    }
    switch (n.id) {
      case "sources": return `${counts.rfqs ?? 0} leads captured`;
      case "rfq": return `${counts.pendingBroadcast ?? 0} awaiting broadcast`;
      case "suppliers": return `${counts.suppliers ?? 0} suppliers`;
      case "stripe": return "credits & subscriptions";
      default:
        if (n.channel === "human") return "manual escalation";
        return channelActive[n.channel] ? "API connected" : "not configured";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between px-2 pb-3">
        <h3 className="text-sm font-medium text-slate-800">Live agent network</h3>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> active</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> manual</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> off</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 1140 460" className="w-full min-w-[880px] h-auto">
          {EDGES.map(([a, b]) => {
            const B = byId[b];
            const stroke = B.type === "channel"
              ? (B.channel === "human" ? "#fbbf24" : channelActive[B.channel] ? "#10b981" : "#cbd5e1")
              : "#94a3b8";
            return (
              <path
                key={`${a}-${b}`}
                d={edgePath(byId[a], B)}
                fill="none"
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray="5 7"
                className="edge-flow"
              />
            );
          })}
          {NODES.map((n) => (
            <g key={n.id} className="cursor-pointer hover:opacity-90" onClick={() => onSelect?.(n)}>
              {selectedId === n.id && (
                <rect x={n.x - 5} y={n.y - 5} width={n.w + 10} height={n.h + 10} rx={13} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="4 4" />
              )}
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} className={rectClass(n)} />
              <circle cx={n.x + n.w - 13} cy={n.y + 13} r={4} className={dotClass(n)} />
              <text
                x={n.x + n.w / 2}
                y={n.y + 25}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                className={isAgentish(n) ? "fill-white" : "fill-slate-900"}
              >
                {n.label}
              </text>
              <text
                x={n.x + n.w / 2}
                y={n.y + 43}
                textAnchor="middle"
                fontSize={10}
                className={isAgentish(n) ? "fill-white opacity-70" : "fill-slate-400"}
              >
                {meta(n)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}