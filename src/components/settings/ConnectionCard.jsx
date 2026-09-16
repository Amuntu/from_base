import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConnectionCard({ config, inspection, busy, onSave, onInspect }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    setForm({
      base_url: config?.base_url || "",
      record_path: config?.record_path || "",
      auth_type: config?.auth_type || "none",
      auth_header: config?.auth_header || "",
      auth_token: config?.auth_token || "",
    });
  }, [config]);

  if (!form) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="font-medium text-slate-800 mb-1">External database</h3>
      <p className="text-xs text-slate-400 mb-4">
        Connect any database or API you can read with a GET request — supplier lists, product catalogs, anything.
        The AI then maps its properties to your app fields.
      </p>
      <div className="space-y-4">
        <div>
          <Label>GET endpoint URL</Label>
          <Input
            placeholder="https://api.yourdatabase.com/v1/suppliers"
            value={form.base_url}
            onChange={(e) => setForm({ ...form, base_url: e.target.value })}
          />
        </div>
        <div>
          <Label>Record path (where the array lives in the response)</Label>
          <Input
            placeholder="e.g. data.items — leave empty if the response is just an array"
            value={form.record_path}
            onChange={(e) => setForm({ ...form, record_path: e.target.value })}
          />
        </div>
        <div>
          <Label>Authentication</Label>
          <Select value={form.auth_type} onValueChange={(v) => setForm({ ...form, auth_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (public endpoint)</SelectItem>
              <SelectItem value="bearer">Bearer token</SelectItem>
              <SelectItem value="header">Custom header</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.auth_type === "header" && (
          <div>
            <Label>Header name</Label>
            <Input
              placeholder="x-api-key"
              value={form.auth_header}
              onChange={(e) => setForm({ ...form, auth_header: e.target.value })}
            />
          </div>
        )}
        {form.auth_type !== "none" && (
          <div>
            <Label>Token / key</Label>
            <Input
              type="password"
              value={form.auth_token}
              onChange={(e) => setForm({ ...form, auth_token: e.target.value })}
            />
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-5">
        <Button onClick={() => onSave(form)} disabled={busy}>{busy === "save" ? "Saving..." : "Save Connection"}</Button>
        <Button variant="outline" onClick={() => onInspect(form)} disabled={busy}>
          {busy === "inspect" ? "Connecting..." : "Connect & Inspect"}
        </Button>
      </div>
      {inspection && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-emerald-600 mb-2">✓ Connected — {inspection.count} record(s) found.</p>
          <div className="text-xs text-slate-400 mb-3">Detected properties:</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {inspection.properties.map((p) => (
              <span key={p} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-600">{p}</span>
            ))}
          </div>
          <div className="text-xs text-slate-400 mb-2">Sample records:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {inspection.samples.map((s, i) => (
              <div key={i} className="border border-slate-100 rounded p-3 text-[11px] font-mono space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(s).map(([k, v]) => (
                  <div key={k}><span className="text-slate-400">{k}:</span> <span className="text-slate-700">{v}</span></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}