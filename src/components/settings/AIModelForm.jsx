import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AIModelForm() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.AgentConfig.list().then((c) => {
      const rec = c[0] || null;
      setConfig(rec);
      setForm({
        llm_provider: rec?.llm_provider || "builtin",
        llm_model: rec?.llm_model || "",
        llm_base_url: rec?.llm_base_url || "",
        llm_api_key: rec?.llm_api_key || "",
      });
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
    toast({ title: "AI model settings saved" });
  };

  const test = async () => {
    setTesting(true);
    try {
      await save();
      const res = await base44.functions.invoke("testLlm", {});
      toast({
        title: `Model online — ${res.data.provider}`,
        description: `"${res.data.reply}" (${res.data.ms}ms)`,
      });
    } catch (e) {
      toast({ title: "Model test failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    }
    setTesting(false);
  };

  const custom = form.llm_provider === "custom";

  return (
    <form onSubmit={onSave} className="max-w-xl">
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div>
          <Label>Model provider</Label>
          <p className="text-xs text-slate-400 mb-2">
            Use the built-in platform model, or connect any OpenAI-compatible API for full control.
          </p>
          <Select value={form.llm_provider} onValueChange={(v) => setForm({ ...form, llm_provider: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="builtin">Built-in platform model</SelectItem>
              <SelectItem value="custom">Custom API (OpenAI-compatible)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {custom && (
          <>
            <div>
              <Label>Model name</Label>
              <Input
                placeholder="e.g. gpt-4o-mini"
                value={form.llm_model}
                onChange={(e) => setForm({ ...form, llm_model: e.target.value })}
              />
            </div>
            <div>
              <Label>Base URL</Label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={form.llm_base_url}
                onChange={(e) => setForm({ ...form, llm_base_url: e.target.value })}
              />
            </div>
            <div>
              <Label>API key</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={form.llm_api_key}
                onChange={(e) => setForm({ ...form, llm_api_key: e.target.value })}
              />
            </div>
          </>
        )}
        <p className="text-xs text-slate-400">
          All agents — Lead Capture, Broadcast, Follow-ups, Conversion, and the Control Room — use this model for
          parsing, supplier matching, and message drafting.
        </p>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          <Button type="button" variant="outline" onClick={test} disabled={testing}>
            {testing ? "Testing..." : "Save & Test Model"}
          </Button>
        </div>
      </section>
    </form>
  );
}