import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RFQFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Input
        placeholder="Search product, company, or RFQ ID..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="max-w-xs"
      />
      <Select value={filters.source} onValueChange={(v) => set("source", v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          <SelectItem value="product_cta">Product CTA</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {["Created", "Notified", "Broadcast", "Opened", "Revealed", "Quoted", "Closed"].map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Country"
        value={filters.country}
        onChange={(e) => set("country", e.target.value)}
        className="max-w-[160px]"
      />
    </div>
  );
}