import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function ZonePublic({ rfq, onContinue }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{rfq.rfq_code}</div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">{rfq.product_name}</h1>
      <p className="text-slate-500 mb-6">A verified buyer in {rfq.delivery_country} needs this product</p>

      <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden mb-6">
        {[
          ["Quantity", `${rfq.quantity} ${rfq.unit || ""}`],
          ["Target price", rfq.target_price || "—"],
          ["Delivery by", rfq.delivery_date || "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white py-4 px-2">
            <div className="text-[11px] uppercase text-slate-400 mb-1">{label}</div>
            <div className="font-medium text-slate-800">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
        <Eye className="w-4 h-4" /> {rfq.view_count || 0} suppliers viewed this request
      </div>

      <Button size="lg" onClick={onContinue} className="px-10">Send Your Quotation →</Button>
    </div>
  );
}