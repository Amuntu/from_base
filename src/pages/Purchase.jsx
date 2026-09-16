import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import PackageCard from "@/components/purchase/PackageCard";

const CREDIT_PACKAGES = [
  { key: "credits_10", name: "10 Credits", price: "$100", per: "$10 per credit", highlight: false },
  { key: "credits_50", name: "50 Credits", price: "$450", per: "$9 per credit", highlight: true },
  { key: "credits_100", name: "100 Credits", price: "$800", per: "$8 per credit", highlight: false },
];

const SUBSCRIPTIONS = [
  {
    key: "starter", name: "Starter", price: "$49/mo", per: "40 credits every month", highlight: false,
    perks: ["40 credits monthly", "Starter tier badge"],
  },
  {
    key: "gold", name: "Gold", price: "$199/mo", per: "150 credits every month", highlight: true,
    perks: ["150 credits monthly", "Gold tier badge", "Priority support"],
  },
];

export default function Purchase() {
  const urlParams = new URLSearchParams(window.location.search);
  const sid = urlParams.get("sid");
  const success = urlParams.get("status") === "success";

  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(sid || "");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.Supplier.list("-created_date", 200).then(setSuppliers);
  }, []);

  const selected = suppliers.find((s) => s.id === supplierId);

  const buy = async (pkgKey) => {
    if (!supplierId) {
      setError("Select your supplier profile first.");
      return;
    }
    setError("");
    setBusy(pkgKey);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", { package: pkgKey, supplier_id: supplierId });
      if (window.self !== window.top) {
        alert("Checkout works only from the published app — open the app in a new tab to complete your purchase.");
        return;
      }
      window.location.href = res.data.url;
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setBusy(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Buy Credits</h1>
          <p className="text-slate-400 text-sm mt-1">Credits reveal verified buyer details on live RFQs.</p>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 justify-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-3 text-sm">
            <CheckCircle2 className="w-4 h-4" /> Payment received — your credits are on their way.
          </div>
        )}

        {error && <div className="mb-6 text-center text-sm text-red-500">{error}</div>}

        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-8">
          {sid && selected ? (
            <div className="text-sm text-slate-600">
              Buying for: <span className="font-medium text-slate-900">{selected.name}</span> — {selected.credits || 0} credits
            </div>
          ) : (
            <div>
              <div className="text-sm text-slate-600 mb-2">Select your supplier profile:</div>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose supplier..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — {s.company || s.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {CREDIT_PACKAGES.map((p) => (
            <PackageCard key={p.key} {...p} busy={busy === p.key} onBuy={() => buy(p.key)} />
          ))}
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-1">Subscriptions</h2>
        <p className="text-slate-400 text-sm mb-4">Monthly credits at a better rate.</p>
        <div className="grid grid-cols-2 gap-4">
          {SUBSCRIPTIONS.map((p) => (
            <PackageCard key={p.key} {...p} busy={busy === p.key} onBuy={() => buy(p.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}