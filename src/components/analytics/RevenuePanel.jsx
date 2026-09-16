import React, { useEffect, useMemo, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RevenuePanel() {
  const [txs, setTxs] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    base44.entities.CreditTransaction.list("-created_date", 500).then(setTxs);
    base44.entities.Supplier.list("-created_date", 200).then(setSuppliers);
  }, []);

  const monthly = useMemo(() => {
    if (!txs) return [];
    const byMonth = {};
    for (const t of txs) {
      if (!t.created_date) continue;
      const key = format(new Date(t.created_date), "yyyy-MM");
      byMonth[key] = (byMonth[key] || 0) + (t.amount || 0);
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => ({ month: format(new Date(`${key}-01`), "MMM yy"), revenue }));
  }, [txs]);

  if (txs === null) return <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>;

  const total = txs.reduce((a, t) => a + (t.amount || 0), 0);
  const payg = txs.filter((t) => t.type === "payg").reduce((a, t) => a + (t.amount || 0), 0);
  const sub = txs.filter((t) => t.type === "subscription").reduce((a, t) => a + (t.amount || 0), 0);
  const creditsSold = txs.reduce((a, t) => a + (t.credits_added || 0), 0);
  const names = new Map(suppliers.map((s) => [s.id, s.name]));

  return (
    <div>
      <div className="grid grid-cols-4 gap-px bg-slate-200 rounded-lg overflow-hidden mb-8">
        {[
          ["Total revenue", `$${total.toLocaleString()}`],
          ["PAYG revenue", `$${payg.toLocaleString()}`],
          ["Subscription revenue", `$${sub.toLocaleString()}`],
          ["Credits sold", creditsSold],
        ].map(([label, value]) => (
          <div key={label} className="bg-white py-6 px-6">
            <div className="text-xs uppercase text-slate-400 mb-1">{label}</div>
            <div className="text-2xl font-semibold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          No transactions yet. Revenue appears here once suppliers buy credits.
        </div>
      ) : (
        <>
          <h3 className="font-medium text-slate-800 mb-3">Monthly revenue</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-5 mb-8" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="revenue" fill="hsl(213 73% 16%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="font-medium text-slate-800 mb-3">Recent transactions</h3>
          <div className="bg-white border border-slate-200 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.slice(0, 10).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{names.get(t.supplier_id) || "—"}</TableCell>
                    <TableCell className="text-slate-500">{t.package || "—"}</TableCell>
                    <TableCell className="capitalize text-slate-500">{t.type}</TableCell>
                    <TableCell className="font-medium">${(t.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>+{t.credits_added || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}