import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { TARGET_FIELDS } from "@/lib/entityFields";

export default function MappingCard({
  config, mapping, inspection, busy, aiExplanation, syncResult,
  onTargetChange, onMapChange, onAutoMap, onSave, onSync,
}) {
  const target = config?.target_entity || "Supplier";
  const fields = TARGET_FIELDS[target] || [];
  const options = inspection?.properties || [];
  const isSynced = syncResult?.summary || config?.last_sync_summary;

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium text-slate-800">Property mapping</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAutoMap} disabled={busy === "suggest"} className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {busy === "suggest" ? "Mapping..." : "AI Auto-Map"}
        </Button>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Assign each database property to the app field it should fill — manually here, or let the AI map them after
        an inspect. You can also ask the Copilot agent to inspect and set this for you.
      </p>

      <div className="mb-5 max-w-xs">
        <Label>Import into</Label>
        <Select value={target} onValueChange={onTargetChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Supplier">Suppliers</SelectItem>
            <SelectItem value="RFQ">RFQs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="grid grid-cols-[1fr_1fr] gap-3 items-center">
            <div className="text-sm text-slate-700">
              {f.label}
              {f.required && <span className="text-red-400 ml-0.5">*</span>}
            </div>
            {options.length ? (
              <Select value={mapping[f.key] || "none"} onValueChange={(v) => onMapChange(f.key, v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="— not mapped —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— not mapped —</SelectItem>
                  {options.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="run Connect & Inspect first, or type a property"
                value={mapping[f.key] || ""}
                onChange={(e) => onMapChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {aiExplanation && (
        <p className="text-xs text-slate-500 mt-4 bg-slate-50 rounded p-3 border border-slate-100">{aiExplanation}</p>
      )}

      <div className="flex gap-3 mt-5 items-center">
        <Button onClick={onSave} disabled={busy === "mapping"}>{busy === "mapping" ? "Saving..." : "Save Mapping"}</Button>
        <Button onClick={onSync} disabled={busy === "sync"}>
          {busy === "sync" ? "Syncing..." : "Sync Now"}
        </Button>
        {isSynced && <span className="text-xs text-slate-500">{isSynced}</span>}
      </div>
      {syncResult?.error && <p className="text-xs text-red-500 mt-2">✕ {syncResult.error}</p>}
    </section>
  );
}