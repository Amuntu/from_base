import React, { useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const CADENCE = [
  ["followup_whatsapp_hours", "whatsapp_enabled", "WhatsApp nudge"],
  ["followup_ai_call_hours", "ai_call_enabled", "AI voice call"],
  ["followup_human_call_hours", "human_call_enabled", "Human call"],
  ["followup_email_hours", "retargeting_enabled", "Email + retargeting"],
];

export default function SettingsForm({ settings, onSaved }) {
  const [form, setForm] = useState({
    reveal_credit_cost: settings?.reveal_credit_cost ?? 1,
    free_first_reveal: settings ? settings.free_first_reveal !== false : true,
    followup_whatsapp_hours: settings?.followup_whatsapp_hours ?? 4,
    followup_ai_call_hours: settings?.followup_ai_call_hours ?? 24,
    followup_human_call_hours: settings?.followup_human_call_hours ?? 48,
    followup_email_hours: settings?.followup_email_hours ?? 168,
    whatsapp_enabled: settings ? settings.whatsapp_enabled !== false : true,
    ai_call_enabled: settings ? settings.ai_call_enabled !== false : true,
    human_call_enabled: settings ? settings.human_call_enabled !== false : true,
    retargeting_enabled: settings?.retargeting_enabled === true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const saved = settings?.id
      ? await base44.entities.AppSettings.update(settings.id, form)
      : await base44.entities.AppSettings.create(form);
    setSaving(false);
    toast({ title: "Settings saved" });
    onSaved(saved);
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-8">
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="font-medium text-slate-800 mb-4">Pricing</h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>Credits per reveal</Label>
              <p className="text-xs text-slate-400">How many credits a supplier spends to reveal buyer details.</p>
            </div>
            <Input
              type="number"
              min="1"
              className="w-24"
              value={form.reveal_credit_cost}
              onChange={(e) => setForm({ ...form, reveal_credit_cost: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Free first reveal</Label>
              <p className="text-xs text-slate-400">New suppliers get their first reveal for free.</p>
            </div>
            <Switch checked={form.free_first_reveal} onCheckedChange={(v) => setForm({ ...form, free_first_reveal: v })} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="font-medium text-slate-800 mb-1">Follow-up cadence</h3>
        <p className="text-xs text-slate-400 mb-4">Hours after broadcast with no response before each step fires.</p>
        <div className="space-y-4">
          {CADENCE.map(([hoursKey, enabledKey, label]) => (
            <div key={hoursKey} className="flex items-center justify-between">
              <Label>{label}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  className="w-24"
                  value={form[hoursKey]}
                  onChange={(e) => setForm({ ...form, [hoursKey]: Number(e.target.value) || 0 })}
                />
                <span className="text-xs text-slate-400 w-8">hrs</span>
                <Switch
                  checked={form[enabledKey]}
                  onCheckedChange={(v) => setForm({ ...form, [enabledKey]: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
    </form>
  );
}