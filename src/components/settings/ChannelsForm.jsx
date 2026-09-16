import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const SECTIONS = [
  {
    key: "whatsapp",
    title: "WhatsApp Business API",
    hint: "Used by the Broadcast and Follow-ups agents to message suppliers.",
    enableField: "whatsapp_enabled",
    testLabel: "Test phone number",
    fields: [
      { key: "whatsapp_api_url", label: "Messages endpoint URL", placeholder: "https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages" },
      { key: "whatsapp_api_token", label: "Access token", password: true },
    ],
  },
  {
    key: "email",
    title: "Email API",
    hint: "Any endpoint that accepts { to, subject, text } with a Bearer token.",
    enableField: "email_enabled",
    testLabel: "Test email address",
    fields: [
      { key: "email_api_url", label: "Endpoint URL", placeholder: "https://api.your-email-service.com/send" },
      { key: "email_api_key", label: "API key", password: true },
      { key: "email_from_name", label: "From name", placeholder: "Abraa" },
    ],
  },
  {
    key: "voice",
    title: "AI Voice Call API",
    hint: "Any endpoint that accepts { phone_number, script, voice_id } — the agent writes the call script itself.",
    enableField: "voice_enabled",
    testLabel: "Test phone number",
    fields: [
      { key: "voice_api_url", label: "Endpoint URL" },
      { key: "voice_api_key", label: "API key", password: true },
      { key: "voice_id", label: "Voice ID", placeholder: "river" },
    ],
  },
];

const ALL_FIELDS = [
  "whatsapp_enabled", "whatsapp_api_url", "whatsapp_api_token",
  "email_enabled", "email_api_url", "email_api_key", "email_from_name",
  "voice_enabled", "voice_api_url", "voice_api_key", "voice_id",
];

export default function ChannelsForm() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testTargets, setTestTargets] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.AgentConfig.list().then((c) => {
      const rec = c[0] || null;
      setConfig(rec);
      setForm(Object.fromEntries(ALL_FIELDS.map((f) => [f, rec?.[f] ?? (f.endsWith("_enabled") ? false : "")])));
    });
  }, []);

  if (!form) return <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>;

  const save = async () => {
    setSaving(true);
    const saved = config?.id
      ? await base44.entities.AgentConfig.update(config.id, form)
      : await base44.entities.AgentConfig.create(form);
    setConfig(saved);
    setSaving(false);
  };

  const onSave = async (e) => {
    e.preventDefault();
    await save();
    toast({ title: "Channel APIs saved" });
  };

  const runTest = async (key) => {
    const target = (testTargets[key] || "").trim();
    setTesting(key);
    try {
      await save();
      const res = await base44.functions.invoke("testChannel", { channel: key, target });
      setTestResults((r) => ({ ...r, [key]: res.data }));
    } catch (e) {
      setTestResults((r) => ({ ...r, [key]: { ok: false, error: e.response?.data?.error || e.message } }));
    }
    setTesting(null);
  };

  return (
    <form onSubmit={onSave} className="max-w-xl space-y-6">
      {SECTIONS.map((sec) => (
        <section key={sec.key} className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-slate-800">{sec.title}</h3>
            <Switch
              checked={form[sec.enableField]}
              onCheckedChange={(v) => setForm({ ...form, [sec.enableField]: v })}
            />
          </div>
          <p className="text-xs text-slate-400 mb-4">{sec.hint}</p>
          <div className="space-y-4">
            {sec.fields.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  type={f.password ? "password" : "text"}
                  placeholder={f.placeholder || ""}
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 border-t border-slate-100 pt-4 mt-4">
            <div className="flex-1">
              <Label>{sec.testLabel}</Label>
              <Input
                placeholder="+963 900 000 000"
                value={testTargets[sec.key] || ""}
                onChange={(e) => setTestTargets((t) => ({ ...t, [sec.key]: e.target.value }))}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => runTest(sec.key)} disabled={testing === sec.key}>
              {testing === sec.key ? "Sending..." : "Send Test"}
            </Button>
          </div>
          {testResults[sec.key] && (
            <p className={`text-xs mt-2 ${testResults[sec.key].ok ? "text-emerald-600" : "text-red-500"}`}>
              {testResults[sec.key].ok ? `✓ ${testResults[sec.key].summary}` : `✕ ${testResults[sec.key].error}`}
            </p>
          )}
        </section>
      ))}
      <p className="text-xs text-slate-400">
        Until a channel is configured, agents still queue every message with working reveal links — sends start
        automatically once the APIs are connected here.
      </p>
      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Channels"}</Button>
    </form>
  );
}