import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RFQStatusBadge from "./RFQStatusBadge";
import { format } from "date-fns";

export default function RFQTable({ rfqs }) {
  if (rfqs.length === 0) {
    return <div className="text-center py-16 text-slate-400 text-sm">No RFQs match these filters.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RFQ</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rfqs.map((r) => (
          <TableRow key={r.id} className="hover:bg-slate-50">
            <TableCell>
              <Link to={`/rfq/${r.id}`} className="font-medium text-[hsl(var(--primary))] hover:underline">
                {r.rfq_code || r.id.slice(0, 8)}
              </Link>
            </TableCell>
            <TableCell>{r.product_name} <span className="text-slate-400">· {r.quantity} {r.unit}</span></TableCell>
            <TableCell>{r.delivery_country}</TableCell>
            <TableCell className="capitalize text-slate-500">{r.source?.replace("_", " ")}</TableCell>
            <TableCell><RFQStatusBadge status={r.status} /></TableCell>
            <TableCell className="text-slate-400 text-sm">
              {r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}