import React from "react";
import { Badge } from "@/components/ui/badge";

const STYLES = {
  Created: "bg-slate-100 text-slate-700 border-slate-200",
  Notified: "bg-blue-50 text-blue-700 border-blue-200",
  Broadcast: "bg-amber-50 text-amber-700 border-amber-200",
  Opened: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Revealed: "bg-teal-50 text-teal-700 border-teal-200",
  Quoted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-200 text-slate-500 border-slate-300",
};

export default function RFQStatusBadge({ status }) {
  return (
    <Badge variant="outline" className={`font-medium ${STYLES[status] || STYLES.Created}`}>
      {status}
    </Badge>
  );
}