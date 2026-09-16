import React, { useState } from "react";
import { Link } from "react-router-dom";
import { localClient as base44 } from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { X, Play, ArrowRight, Settings2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AGENT_INFO = {
  control: { id: "control_room", title: "Control Room", desc: "Master agent — runs the whole pipeline end-to-end in one shot." },
  lead: { id: "lead_capture", title: "Lead Capture", desc: "Parses raw leads — WhatsApp messages, emails, pasted text — into structured RFQs." },
  broadcast: { id: "broadcast", title: "Broadcast", desc: "AI-matches the best suppliers to each RFQ, drafts the invite, and sends it." },
  followups: { id: "followups", title: "Follow-ups", desc: "Runs the timed cadence — WhatsApp nudge, AI voice call, human call, email + retarget." },
  conversion: { id: "conversion", title: "Conversion", desc: "Nudges suppliers who revealed buyer details to submit their quotes." },
};

const STORE_INFO = {
  sources: { to: "/", label: "Open Control Room" },
  rfq: { to: "/", label: "Open Control Room" },
  suppliers: { to: "/suppliers", label: "Open Suppliers" },
  stripe: { to: "/purchase", label: "Open Purchase" },
};

export default function NodeInspector({ node, config, counts, runs, onClose, onRunAgent, onUpdateConfig }) {
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const testChannel = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("testChannel", { channel: node.channel, target });
      setResult(res.data);
    } catch (e) {
      setResult({ ok: false, error: e.response?.data?.error || e.message });
    }
    setBusy(false);
  };

  const agentInfo = AGENT_INFO[node.id];
  const storeInfo = STORE_INFO[node.id];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-900 text-sm">{node.label}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>

      {agentInfo && (
        <div>
          <p className="text-xs text-slate-500 mb-4">{agentInfo.desc}</p>
          <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3 mb-4">
            <div className="flex justify-between"><span className="text-slate-400">Total runs</span><span className="text-slate-700">{runs.filter((r) => r.agent === agentInfo.id).length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Last run</span><span className="text-slate-700">{(() => { const l = runs.find((r) => r.agent === agentInfo.id); return l ? `${l.status} · ${formatDistanceToNow(new Date(l.created_date), { addSuffix: true })}` : "never"; })()}</span></div>
          </div>
          <Button size="sm" onClick={() => onRunAgent(agentInfo.id)} className="gap-1.5 w-full">
            <Play className="w-3.5 h-3.5" />
            Run {agentInfo.title}
          </Button>
        </div>
      )}

      {node.type === "channel" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400">Channel enabled</span>
            <Switch
              checked={!!config[`${node.channel}_enabled`]}
              onCheckedChange={(v) => onUpdateConfig({ [`${node.channel}_enabled`]: v })}
            />
          </div>
          {node.channel === "human" ? (
            <p className="text-xs text-slate-500">
              Human calls are manual escalations — they appear in the Follow-ups queue for your team to place.
            </p>
          ) : (
            <>
              <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                <div className="flex justify-between"><span className="text-slate-400">Endpoint</span><span className="text-slate-700 font-mono text-[10px] truncate max-w-[140px]">{config[`${node.channel}_api_url`] || "not set"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className={node.channel && config[`${node.channel}_enabled`] ? "text-emerald-600" : "text-slate-400"}>{node.channel && config[`${node.channel}_enabled`] ? "enabled" : "disabled"}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Send a test</Label>
                <Input
                  placeholder={node.channel === "email" ? "test@example.com" : "+963 900 000 000"}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={testChannel} disabled={busy || !target.trim()} className="w-full">
                  {busy ? "Sending…" : "Send Test Message"}
                </Button>
                {result && (
                  <p className={`text-xs ${result.ok ? "text-emerald-600" : "text-red-500"}`}>
                    {result.ok ? `✓ ${result.summary}` : `✕ ${result.error}`}
                  </p>
                )}
              </div>
              <Link to="/settings" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mt-4">
                <Settings2 className="w-3.5 h-3.5" />
                Configure in Settings
              </Link>
            </>
          )}
        </div>
      )}

      {storeInfo && (
        <div>
          <p className="text-xs text-slate-500 mb-4">{node.meta}</p>
          <Link to={storeInfo.to}>
            <Button size="sm" variant="outline" className="gap-1.5 w-full">
              {storeInfo.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}