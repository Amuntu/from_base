import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";

const SOURCE_LABELS = { product_cta: "Product CTA", whatsapp: "WhatsApp", email: "Email" };

export default function MarketingPanel() {
  const [rfqs, setRfqs] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    base44.entities.RFQ.list("-created_date", 500).then(setRfqs);
    base44.entities.BroadcastLog.list("-created_date", 500).then(setLogs);
  }, []);

  if (rfqs === null) return <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>;

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        No RFQs yet — the funnel fills in as requests come in.
      </div>
    );
  }

  const inBroadcast = rfqs.filter((r) => ["Broadcast", "Opened", "Revealed", "Quoted"].includes(r.status)).length;
  const opened = logs.filter((l) => ["opened", "clicked", "quoted"].includes(l.status)).length;
  const revealed = rfqs.filter((r) => ["Revealed", "Quoted"].includes(r.status)).length;
  const quoted = rfqs.filter((r) => r.status === "Quoted").length;

  const funnel = [
    ["RFQs received", rfqs.length],
    ["Broadcast to suppliers", inBroadcast],
    ["Opened by suppliers", opened],
    ["Buyer details revealed", revealed],
    ["Quoted", quoted],
  ];
  const max = Math.max(...funnel.map(([, v]) => v), 1);

  const bySource = Object.entries(
    rfqs.reduce((acc, r) => { acc[r.source] = (acc[r.source] || 0) + 1; return acc; }, {})
  );
  const sourceMax = Math.max(...bySource.map(([, v]) => v), 1);

  const byCategory = Object.entries(
    rfqs.reduce((acc, r) => { if (r.category) acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catMax = Math.max(...byCategory.map(([, v]) => v), 1);

  return (
    <div>
      <h3 className="font-medium text-slate-800 mb-3">RFQ funnel</h3>
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 space-y-3">
        {funnel.map(([label, value]) => (
          <div key={label} className="flex items-center gap-4">
            <div className="w-44 text-sm text-slate-600 shrink-0">{label}</div>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-[hsl(var(--primary))] rounded" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <div className="w-8 text-sm font-medium text-right">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-slate-800 mb-3">Lead sources</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
            {bySource.length === 0 && <div className="text-sm text-slate-400">No data yet.</div>}
            {bySource.map(([source, count]) => (
              <div key={source} className="flex items-center gap-4">
                <div className="w-28 text-sm text-slate-600">{SOURCE_LABELS[source] || source}</div>
                <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                  <div className="h-full bg-slate-400 rounded" style={{ width: `${(count / sourceMax) * 100}%` }} />
                </div>
                <div className="w-6 text-sm font-medium text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-slate-800 mb-3">Top categories</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
            {byCategory.length === 0 && <div className="text-sm text-slate-400">No categories yet.</div>}
            {byCategory.map(([category, count]) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-28 text-sm text-slate-600 truncate">{category}</div>
                <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                  <div className="h-full bg-slate-400 rounded" style={{ width: `${(count / catMax) * 100}%` }} />
                </div>
                <div className="w-6 text-sm font-medium text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}