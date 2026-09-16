import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { useToast } from "@/components/ui/use-toast";
import ConnectionCard from "@/components/settings/ConnectionCard";
import MappingCard from "@/components/settings/MappingCard";

export default function DatabaseForm() {
  const [config, setConfig] = useState(undefined);
  const [inspection, setInspection] = useState(null);
  const [mapping, setMapping] = useState({});
  const [aiExplanation, setAiExplanation] = useState("");
  const [syncResult, setSyncResult] = useState(null);
  const [busy, setBusy] = useState(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const recs = await base44.entities.DatabaseConfig.list();
    const rec = recs[0] || null;
    setConfig(rec);
    setMapping(rec?.mapping || {});
  };

  const saveConfig = async (fields) => {
    const saved = config?.id
      ? await base44.entities.DatabaseConfig.update(config.id, fields)
      : await base44.entities.DatabaseConfig.create(fields);
    setConfig(saved);
    return saved;
  };

  const saveConnection = async (form) => {
    setBusy("save");
    await saveConfig(form);
    setBusy(null);
    toast({ title: "Database connection saved" });
  };

  const inspect = async (form) => {
    setBusy("inspect");
    try {
      const saved = await saveConfig(form);
      const res = await base44.functions.invoke("databaseConnect", { action: "inspect" });
      setInspection(res.data);
      setSyncResult(null);
      toast({ title: `Connected — ${res.data.count} record(s) found` });
    } catch (e) {
      toast({ title: "Connection failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const autoMap = async () => {
    setBusy("suggest");
    try {
      const res = await base44.functions.invoke("databaseConnect", { action: "suggest" });
      setMapping((m) => ({ ...m, ...res.data.mapping }));
      setInspection((i) => i || { properties: res.data.properties });
      setAiExplanation(res.data.explanation);
      toast({ title: "AI mapped the properties", description: "Review and save below." });
    } catch (e) {
      toast({ title: "AI mapping failed", description: e.response?.data?.error || e.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const saveMapping = async () => {
    setBusy("mapping");
    const saved = await saveConfig({ mapping });
    setConfig(saved);
    setBusy(null);
    toast({ title: "Mapping saved" });
    return saved;
  };

  const sync = async () => {
    setBusy("sync");
    try {
      await saveConfig({ mapping });
      const res = await base44.functions.invoke("databaseConnect", { action: "sync" });
      setSyncResult(res.data);
      await load();
      toast({ title: "Sync complete", description: res.data.summary });
    } catch (e) {
      setSyncResult({ error: e.response?.data?.error || e.message });
    }
    setBusy(null);
  };

  if (config === undefined) return <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <ConnectionCard
        config={config}
        inspection={inspection}
        busy={busy}
        onSave={saveConnection}
        onInspect={inspect}
      />
      <MappingCard
        config={config}
        mapping={mapping}
        inspection={inspection}
        busy={busy}
        aiExplanation={aiExplanation}
        syncResult={syncResult}
        onTargetChange={(v) => { setMapping({}); saveConfig({ target_entity: v }); }}
        onMapChange={(field, value) => setMapping((m) => ({ ...m, [field]: value }))}
        onAutoMap={autoMap}
        onSave={saveMapping}
        onSync={sync}
      />
    </div>
  );
}