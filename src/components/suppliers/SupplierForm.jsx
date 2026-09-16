import React, { useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const empty = { name: "", company: "", email: "", phone: "", country: "", category: "" };

export default function SupplierForm({ onCreated }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSaving(true);
    await base44.entities.Supplier.create({ ...form, credits: 0 });
    setForm(empty);
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-6 gap-3 mb-6 items-end">
      <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Supplier"}</Button>
    </form>
  );
}