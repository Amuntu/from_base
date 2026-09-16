import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { localClient as base44 } from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Phone, MessageSquareText, Bot, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STAGE_META = {
  whatsapp: { icon: MessageSquareText },
  ai_voice: { icon: Bot },
  human_call: { icon: Phone },
  email_retarget: { icon: Mail },
};
const STAGE_LABELS = {
  whatsapp: "WhatsApp nudge",
  ai_voice: "AI voice call",
  human_call: "Human call",
  email_retarget: "Email + retarget",
};
const ORDER = ["whatsapp", "ai_voice", "human_call", "email_retarget"];

export default function FollowUps() {
  const [pending, setPending] = useState(null);
  const [sweeping, setSweeping] = useState(false);
  const { toast } = useToast();

  const load = () =>
    base44.entities.FollowUpLog.filter({ status: "pending" }, "created_date", 500).then(setPending);
  useEffect(() => { load(); }, []);

  const runSweep = async () => {
    setSweeping(true);
    try {
      const res = await base44.functions.invoke("followupSweep", {});
      toast({
        title: "Sweep complete",
        description: `${res.data.created} new follow-up(s) queued from ${res.data.scanned} stale broadcasts.`,
      });
      await load();
    } catch (e) {
      toast({ title: "Sweep failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    }
    setSweeping(false);
  };

  const markDone = async (id) => {
    await base44.entities.FollowUpLog.update(id, { status: "done" });
    setPending((p) => p.filter((f) => f.id !== id));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Follow-ups</h1>
          <p className="text-slate-400 text-sm mt-1">Suppliers who haven't responded — escalated on a timed cadence.</p>
        </div>
        <Button onClick={runSweep} disabled={sweeping} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${sweeping ? "animate-spin" : ""}`} />
          {sweeping ? "Sweeping..." : "Run Follow-up Sweep"}
        </Button>
      </div>

      {pending === null ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : pending.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          No pending follow-ups. Run a sweep to check for stale broadcasts.
        </div>
      ) : (
        <div className="space-y-8">
          {ORDER.map((stage) => {
            const items = pending.filter((f) => f.stage === stage);
            if (items.length === 0) return null;
            const Icon = STAGE_META[stage].icon;
            return (
              <div key={stage}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <h3 className="font-medium text-slate-800">{STAGE_LABELS[stage]}</h3>
                  <span className="text-xs text-slate-400">{items.length} pending</span>
                </div>
                <div className="space-y-2">
                  {items.map((f) => (
                    <div key={f.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium">{f.supplier_name}</span>
                        <Link to={`/rfq/${f.rfq_id}`} className="text-slate-400 hover:underline ml-2">
                          {f.rfq_code || "RFQ"}
                        </Link>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          queued {f.created_date ? formatDistanceToNow(new Date(f.created_date), { addSuffix: true }) : ""}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => markDone(f.id)}>Mark Done</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}