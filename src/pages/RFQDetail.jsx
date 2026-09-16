import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { localClient as base44 } from "@/api/localClient";
import { ArrowLeft, Copy } from "lucide-react";
import RFQStatusBadge from "@/components/rfq/RFQStatusBadge";
import BroadcastPanel from "@/components/rfq/BroadcastPanel";

export default function RFQDetail() {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [logs, setLogs] = useState([]);

  const load = async () => {
    const r = await base44.entities.RFQ.get(id);
    setRfq(r);
    const l = await base44.entities.BroadcastLog.filter({ rfq_id: id }, "-created_date", 200);
    setLogs(l);
  };

  useEffect(() => { load(); }, [id]);

  if (!rfq) return <div className="text-slate-400 text-sm">Loading...</div>;

  const copyLink = (log) => {
    const url = `${window.location.origin}/reveal/${rfq.id}?sid=${log.supplier_id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Control Room
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">{rfq.rfq_code}</div>
          <h1 className="text-2xl font-semibold text-slate-900">{rfq.product_name}</h1>
        </div>
        <RFQStatusBadge status={rfq.status} />
      </div>

      <div className="grid grid-cols-4 gap-px bg-slate-200 rounded-lg overflow-hidden mb-8">
        {[
          ["Quantity", `${rfq.quantity} ${rfq.unit || ""}`],
          ["Target price", rfq.target_price || "—"],
          ["Country", rfq.delivery_country],
          ["Category", rfq.category || "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white py-4 px-4">
            <div className="text-[11px] uppercase text-slate-400 mb-1">{label}</div>
            <div className="font-medium text-slate-800">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-8">
        <div className="text-xs uppercase text-slate-400 mb-2">Buyer</div>
        <p className="text-sm text-slate-700">{rfq.buyer_name} — {rfq.buyer_company} · {rfq.buyer_email} · {rfq.buyer_phone}</p>
        <p className="text-sm text-slate-500 mt-2">{rfq.description}</p>
      </div>

      <BroadcastPanel rfq={rfq} logs={logs} onBroadcast={load} />

      {logs.length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="font-medium text-slate-800 mb-3">Broadcast Log</h3>
          <div className="divide-y divide-slate-100">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 text-sm">
                <span>{l.supplier_name}</span>
                <span className="text-slate-400 capitalize">{l.status}</span>
                <button onClick={() => copyLink(l)} className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline text-xs">
                  <Copy className="w-3 h-3" /> Copy link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}