import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

export default function BroadcastPanel({ rfq, logs, onBroadcast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.entities.Supplier.list("-created_date", 200).then(setSuppliers);
  }, []);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const broadcast = async () => {
    if (selected.length === 0) return;
    setSending(true);
    const chosen = suppliers.filter((s) => selected.includes(s.id));
    await base44.entities.BroadcastLog.bulkCreate(
      chosen.map((s) => ({
        rfq_id: rfq.id,
        supplier_id: s.id,
        supplier_name: s.name,
        channel: "email",
        status: "sent",
        unique_token: Math.random().toString(36).slice(2, 10),
      }))
    );
    await base44.entities.RFQ.update(rfq.id, { status: "Broadcast" });
    setSelected([]);
    setSending(false);
    onBroadcast();
  };

  const notifiedIds = new Set(logs.map((l) => l.supplier_id));

  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-800">Broadcast to Suppliers</h3>
        <Button onClick={broadcast} disabled={sending || selected.length === 0} className="gap-2">
          <Radio className="w-4 h-4" /> {sending ? "Broadcasting..." : `Broadcast GO (${selected.length})`}
        </Button>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {suppliers.map((s) => (
          <label key={s.id} className="flex items-center gap-3 py-2 px-1 text-sm cursor-pointer">
            <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
            <span className="flex-1">{s.name} <span className="text-slate-400">· {s.country} · {s.category}</span></span>
            {notifiedIds.has(s.id) && <span className="text-xs text-emerald-600">already notified</span>}
          </label>
        ))}
        {suppliers.length === 0 && <div className="text-slate-400 text-sm py-4">Add suppliers first on the Suppliers page.</div>}
      </div>
    </div>
  );
}