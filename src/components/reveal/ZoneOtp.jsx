import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ZoneOtp({ onVerified }) {
  const [step, setStep] = useState("phone");
  const [form, setForm] = useState({ phone: "", name: "", company: "", category: "", code: "" });
  const [error, setError] = useState("");

  const sendCode = (e) => {
    e.preventDefault();
    if (!form.phone) return;
    setStep("verify");
  };

  const verify = (e) => {
    e.preventDefault();
    if (form.code !== "123456") {
      setError("Incorrect code. Demo code is 123456.");
      return;
    }
    if (!form.name || !form.company) {
      setError("Please fill in your name and company.");
      return;
    }
    onVerified(form);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-lg font-semibold text-center mb-1">Verify to continue</h2>
      <p className="text-sm text-slate-400 text-center mb-6">One-time verification to unlock buyer details</p>

      {step === "phone" && (
        <form onSubmit={sendCode} className="space-y-4">
          <div>
            <Label>Phone number</Label>
            <Input autoFocus value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+971 5X XXX XXXX" />
          </div>
          <Button type="submit" className="w-full">Send Code</Button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={verify} className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Textiles" />
          </div>
          <div>
            <Label>Verification code <span className="text-slate-400 text-xs">(demo: 123456)</span></Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={6} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Verify & Continue</Button>
        </form>
      )}
    </div>
  );
}