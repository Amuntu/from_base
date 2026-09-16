import React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ZoneGated({ rfq, supplier, onReveal, revealed, freeAvailable, creditCost = 1 }) {
  const noCredits = !revealed && !freeAvailable && (supplier.credits || 0) < creditCost;

  if (noCredits) {
    return (
      <div className="max-w-sm mx-auto text-center border border-amber-200 bg-amber-50 rounded-lg p-6">
        <Lock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
        <p className="font-medium text-amber-800 mb-1">Not enough credits</p>
        <p className="text-sm text-amber-600 mb-4">Top up now to reveal this buyer's details.</p>
        <Link to={`/purchase?sid=${supplier.id}`}>
          <Button variant="outline" className="border-amber-300">Buy Credits</Button>
        </Link>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className="max-w-sm mx-auto text-center">
        <Button size="lg" onClick={onReveal} className="px-10">
          {freeAvailable
            ? "Reveal Buyer Details (Free)"
            : `Reveal for ${creditCost} Credit${creditCost > 1 ? "s" : ""}`}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto border border-slate-200 rounded-lg p-6 bg-white">
      <div className="text-xs uppercase text-slate-400 mb-3">Buyer Details</div>
      <dl className="space-y-2 text-sm">
        {[
          ["Name", rfq.buyer_name],
          ["Company", rfq.buyer_company],
          ["Email", rfq.buyer_email],
          ["Phone", rfq.buyer_phone],
          ["City", rfq.buyer_city],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-slate-100 pb-1.5">
            <dt className="text-slate-400">{label}</dt>
            <dd className="font-medium text-slate-800">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-slate-600 mt-4">{rfq.description}</p>
    </div>
  );
}