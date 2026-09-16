import React, { useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const empty = {
  product_name: "", quantity: "", unit: "", target_price: "", delivery_country: "",
  delivery_date: "", description: "", category: "",
  buyer_name: "", buyer_company: "", buyer_email: "", buyer_phone: "", buyer_city: "",
};

export default function SubmitRFQ() {
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const code = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await base44.entities.RFQ.create({
      ...form,
      quantity: Number(form.quantity) || 0,
      rfq_code: code,
      source: "product_cta",
      status: "Created",
    });
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-1">Request submitted</h2>
          <p className="text-slate-500 text-sm">We're matching your request with verified suppliers now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <form onSubmit={submit} className="max-w-lg mx-auto bg-white border border-slate-200 rounded-lg p-8 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Request for Quotation</h1>
          <p className="text-slate-400 text-sm mt-1">Tell us what you need — we'll find verified suppliers.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Product</Label><Input required value={form.product_name} onChange={(e) => set("product_name", e.target.value)} /></div>
          <div><Label>Quantity</Label><Input type="number" required value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></div>
          <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="units, kg, tons..." /></div>
          <div><Label>Target price</Label><Input value={form.target_price} onChange={(e) => set("target_price", e.target.value)} placeholder="e.g. $2-3/unit" /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
          <div><Label>Delivery country</Label><Input required value={form.delivery_country} onChange={(e) => set("delivery_country", e.target.value)} /></div>
          <div><Label>Delivery date</Label><Input type="date" value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} /></div>
          <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><Label>Your name</Label><Input required value={form.buyer_name} onChange={(e) => set("buyer_name", e.target.value)} /></div>
            <div><Label>Company</Label><Input value={form.buyer_company} onChange={(e) => set("buyer_company", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.buyer_email} onChange={(e) => set("buyer_email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input required value={form.buyer_phone} onChange={(e) => set("buyer_phone", e.target.value)} /></div>
            <div className="col-span-2"><Label>City</Label><Input value={form.buyer_city} onChange={(e) => set("buyer_city", e.target.value)} /></div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</Button>
      </form>
    </div>
  );
}