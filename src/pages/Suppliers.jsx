import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierTable from "@/components/suppliers/SupplierTable";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.entities.Supplier.list("-created_date", 200).then((d) => { setSuppliers(d); setLoading(false); });

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Suppliers</h1>
      <p className="text-slate-400 text-sm mb-8">Registered suppliers, credits, and subscription tiers.</p>
      <SupplierForm onCreated={load} />
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg">
          <SupplierTable suppliers={suppliers} onChanged={load} />
        </div>
      )}
    </div>
  );
}