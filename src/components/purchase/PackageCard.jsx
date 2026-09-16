import React from "react";
import { Button } from "@/components/ui/button";

export default function PackageCard({ name, price, per, perks = [], highlight, busy, onBuy }) {
  return (
    <div className={`border rounded-lg p-5 flex flex-col bg-white ${highlight ? "border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary))]" : "border-slate-200"}`}>
      <div className="font-medium text-slate-900">{name}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{price}</div>
      <div className="text-xs text-slate-400 mb-3">{per}</div>
      {perks.length > 0 && (
        <ul className="text-xs text-slate-500 space-y-1 mb-4">
          {perks.map((perk) => <li key={perk}>· {perk}</li>)}
        </ul>
      )}
      <Button onClick={onBuy} disabled={busy} className="mt-auto w-full">{busy ? "Redirecting..." : "Buy Now"}</Button>
    </div>
  );
}