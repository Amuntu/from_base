import React, { useEffect, useMemo, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import RFQFilters from "@/components/rfq/RFQFilters";
import RFQTable from "@/components/rfq/RFQTable";

export default function Dashboard() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", source: "all", status: "all", country: "" });

  useEffect(() => {
    base44.entities.RFQ.list("-created_date", 200).then((data) => {
      setRfqs(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return rfqs.filter((r) => {
      if (filters.source !== "all" && r.source !== filters.source) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.country && !r.delivery_country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${r.product_name} ${r.buyer_company} ${r.rfq_code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rfqs, filters]);

  const kpis = useMemo(() => ({
    total: rfqs.length,
    broadcast: rfqs.filter((r) => ["Broadcast", "Opened", "Revealed", "Quoted"].includes(r.status)).length,
    quoted: rfqs.filter((r) => r.status === "Quoted").length,
  }), [rfqs]);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Control Room</h1>
          <p className="text-slate-400 text-sm mt-1">Every RFQ, every source, in one place.</p>
        </div>
        <Link to="/submit-rfq">
          <Button className="gap-2"><Plus className="w-4 h-4" /> New RFQ</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden mb-8">
        {[
          ["Total RFQs", kpis.total],
          ["In Broadcast Pipeline", kpis.broadcast],
          ["Quoted", kpis.quoted],
        ].map(([label, value]) => (
          <div key={label} className="bg-white py-6 px-6">
            <div className="text-xs uppercase text-slate-400 mb-1">{label}</div>
            <div className="text-3xl font-semibold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <RFQFilters filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg">
          <RFQTable rfqs={filtered} />
        </div>
      )}
    </div>
  );
}