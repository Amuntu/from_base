import React, { useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIER_STYLE = {
  basic: "bg-slate-100 text-slate-600 border-slate-200",
  starter: "bg-slate-200 text-slate-700 border-slate-300",
  gold: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function SupplierTable({ suppliers, onChanged }) {
  const [topUp, setTopUp] = useState({});

  const addCredits = async (supplier) => {
    const amount = Number(topUp[supplier.id] || 0);
    if (!amount) return;
    await base44.entities.Supplier.update(supplier.id, { credits: (supplier.credits || 0) + amount });
    await base44.entities.CreditTransaction.create({
      supplier_id: supplier.id,
      type: "payg",
      package: `${amount} credits (manual top-up)`,
      amount: amount * 10,
      credits_added: amount,
    });
    setTopUp({ ...topUp, [supplier.id]: "" });
    onChanged();
  };

  if (suppliers.length === 0) {
    return <div className="text-center py-16 text-slate-400 text-sm">No suppliers yet. Add your first one above.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Country / Category</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Credits</TableHead>
          <TableHead>Top up</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-slate-400">{s.company} · {s.phone}</div>
            </TableCell>
            <TableCell className="text-slate-500 text-sm">{s.country} · {s.category}</TableCell>
            <TableCell><Badge variant="outline" className={TIER_STYLE[s.subscription_tier] || TIER_STYLE.basic}>{s.subscription_tier}</Badge></TableCell>
            <TableCell className="font-medium">{s.credits || 0}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={topUp[s.id] || ""}
                  onChange={(e) => setTopUp({ ...topUp, [s.id]: e.target.value })}
                  placeholder="0"
                />
                <Button size="sm" variant="outline" onClick={() => addCredits(s)}>Add</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}