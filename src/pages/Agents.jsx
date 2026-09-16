import React, { useCallback, useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Inbox, Send, MessageSquareText, Target, Cpu, Play } from "lucide-react";
import AgentGraph from "@/components/agents/AgentGraph";
import AgentCard from "@/components/agents/AgentCard";
import NodeInspector from "@/components/agents/NodeInspector";
import RunLog from "@/components/agents/RunLog";

const AGENTS = [
  { id: "lead_capture", title: "Lead Capture", icon: Inbox, description: "Parses raw leads — WhatsApp messages, emails, pasted text — into structured RFQs." },
  { id: "broadcast", title: "Broadcast", icon: Send, description: "AI-matches the best suppliers to each RFQ, drafts the invite, and sends it through your channels." },
  { id: "followups", title: "Follow-ups", icon: MessageSquareText, description: "Runs the timed cadence — WhatsApp nudge, AI voice call, human call, email + retarget." },
  { id: "conversion", title: "Conversion", icon: Target, description: "Nudges suppliers who revealed buyer details to submit their quotes." },
  { id: "control_room", title: "Control Room", icon: Cpu, description: "The master agent — runs the whole pipeline end-to-end in one shot." },
];

export default function Agents() {
  const [data, setData] = useState(null);
  const [running, setRunning] = useState(null);
  const [leadText, setLeadText] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    const [rfqs, suppliers, logs, followups, runs, configs] = await Promise.all([
      base44.entities.RFQ.list("-created_date", 200),
      base44.entities.Supplier.list("-created_date", 200),
      base44.entities.BroadcastLog.list("-created_date", 200),
      base44.entities.FollowUpLog.filter({ status: "pending" }, "-created_date", 200),
      base44.entities.AgentRun.list("-created_date", 20),
      base44.entities.AgentConfig.list("-created_date", 1),
    ]);
    setData({ rfqs, suppliers, logs, followups, runs, config: configs[0] || {} });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const subs = ["AgentRun", "RFQ", "BroadcastLog", "FollowUpLog", "AgentConfig"].map((e) => base44.entities[e].subscribe(refresh));
    return () => subs.forEach((u) => u());
  }, [refresh]);

  const runAgent = useCallback(async (agent, extra = {}) => {
    setRunning(agent);
    try {
      const res = await base44.functions.invoke("agentRun", { agent, ...extra });
      toast({
        title: `${AGENTS.find((a) => a.id === agent)?.title || agent} finished`,
        description: res.data.summary,
      });
      if (agent === "lead_capture" && res.data.count > 0) setLeadText("");
      await refresh();
    } catch (e) {
      toast({ title: "Agent failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    }
    setRunning(null);
  }, [refresh, toast]);

  const updateConfig = async (fields) => {
    const configs = await base44.entities.AgentConfig.list();
    const updated = configs[0]
      ? await base44.entities.AgentConfig.update(configs[0].id, fields)
      : await base44.entities.AgentConfig.create(fields);
    setData((d) => (d ? { ...d, config: updated } : d));
    toast({ title: "Updated", description: Object.keys(fields).join(", ").replace(/_/g, " ") });
  };

  if (!data) return <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>;

  const counts = {
    rfqs: data.rfqs.length,
    pendingBroadcast: data.rfqs.filter((r) => ["Created", "Notified"].includes(r.status)).length,
    suppliers: data.suppliers.length,
    pendingFollowups: data.followups.length,
    revealed: data.rfqs.filter((r) => r.status === "Revealed").length,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI Agents</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your autonomous operations team — click any node to inspect, enable, disable, or test it.
          </p>
        </div>
        <Button onClick={() => runAgent("control_room")} disabled={!!running} className="gap-2">
          <Play className="w-4 h-4" />
          {running === "control_room" ? "Running All..." : "Run All Agents"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
        <AgentGraph
          counts={counts}
          config={data.config}
          runs={data.runs}
          selectedId={selectedNode?.id}
          onSelect={(node) => setSelectedNode(node)}
        />
        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            config={data.config}
            counts={counts}
            runs={data.runs}
            onClose={() => setSelectedNode(null)}
            onRunAgent={runAgent}
            onUpdateConfig={updateConfig}
          />
        )}
        {!selectedNode && (
          <div className="border border-dashed border-slate-200 rounded-lg p-5 text-xs text-slate-400 text-center xl:sticky xl:top-6">
            Click a node in the network to inspect it — enable or disable channels, send test messages, run agents, and jump to the data.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
        {AGENTS.map((a) => {
          const lastRun = data.runs.find((r) => r.agent === a.id);
          return (
            <AgentCard
              key={a.id}
              title={a.title}
              description={a.description}
              icon={a.icon}
              running={running === a.id}
              lastRun={lastRun}
              onRun={() => runAgent(a.id, a.id === "lead_capture" ? { lead_text: leadText } : {})}
            >
              {a.id === "lead_capture" && (
                <textarea
                  value={leadText}
                  onChange={(e) => setLeadText(e.target.value)}
                  placeholder="Paste a raw lead — e.g. 'Hi, we need 5,000 cotton t-shirts delivered to Germany by March...'"
                  className="w-full text-xs border border-slate-200 rounded-md p-2 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
            </AgentCard>
          );
        })}
      </div>

      <div className="mt-8">
        <RunLog runs={data.runs} />
      </div>
    </div>
  );
}