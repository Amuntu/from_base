import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { localClient as base44 } from "@/api/localClient";
import ZonePublic from "@/components/reveal/ZonePublic";
import ZoneOtp from "@/components/reveal/ZoneOtp";
import ZoneGated from "@/components/reveal/ZoneGated";

export default function SupplierReveal() {
  const { rfqId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const sid = urlParams.get("sid");

  const [rfq, setRfq] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [settings, setSettings] = useState(null);
  const [stage, setStage] = useState("public"); // public -> otp -> gated
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    base44.entities.RFQ.get(rfqId).then((r) => {
      setRfq(r);
      base44.entities.RFQ.update(rfqId, { view_count: (r.view_count || 0) + 1 });
    });
    if (sid) {
      base44.entities.Supplier.get(sid).then(setSupplier);
    }
    base44.entities.AppSettings.list().then((s) => setSettings(s[0] || null));
  }, [rfqId, sid]);

  const handleContinue = () => {
    if (supplier) setStage("gated");
    else setStage("otp");
  };

  const handleVerified = async (form) => {
    const created = await base44.entities.Supplier.create({
      name: form.name,
      company: form.company,
      phone: form.phone,
      category: form.category,
      credits: 0,
      used_free_reveal: false,
    });
    setSupplier(created);
    setStage("gated");
  };

  const creditCost = settings?.reveal_credit_cost ?? 1;
  const freeAvailable = !supplier?.used_free_reveal && (settings ? settings.free_first_reveal !== false : true);

  const handleReveal = async () => {
    if (freeAvailable) {
      await base44.entities.Supplier.update(supplier.id, { used_free_reveal: true });
      setSupplier({ ...supplier, used_free_reveal: true });
    } else {
      if ((supplier.credits || 0) < creditCost) return;
      await base44.entities.Supplier.update(supplier.id, { credits: supplier.credits - creditCost });
      setSupplier({ ...supplier, credits: supplier.credits - creditCost });
    }
    if (rfq.status !== "Quoted" && rfq.status !== "Closed") {
      await base44.entities.RFQ.update(rfq.id, { status: "Revealed" });
    }
    setRevealed(true);
  };

  if (!rfq) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        {stage === "public" && <ZonePublic rfq={rfq} onContinue={handleContinue} />}
        {stage === "otp" && <ZoneOtp onVerified={handleVerified} />}
        {stage === "gated" && supplier && (
          <ZoneGated
            rfq={rfq}
            supplier={supplier}
            onReveal={handleReveal}
            revealed={revealed}
            freeAvailable={freeAvailable}
            creditCost={creditCost}
          />
        )}
      </div>
    </div>
  );
}