import React, { useEffect, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsForm from "@/components/settings/SettingsForm";
import AIModelForm from "@/components/settings/AIModelForm";
import ChannelsForm from "@/components/settings/ChannelsForm";
import DatabaseForm from "@/components/settings/DatabaseForm";

export default function Settings() {
  const [settings, setSettings] = useState(undefined);

  useEffect(() => {
    base44.entities.AppSettings.list().then((s) => setSettings(s[0] || null));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Settings</h1>
      <p className="text-slate-400 text-sm mb-8">
        Pricing, follow-up cadence, AI model, channel APIs, and your external database.
      </p>
      <Tabs defaultValue="platform">
        <TabsList className="mb-6">
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="ai">AI Model</TabsTrigger>
          <TabsTrigger value="apis">Channels & APIs</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        <TabsContent value="platform">
          {settings === undefined ? (
            <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
          ) : (
            <SettingsForm settings={settings} onSaved={setSettings} />
          )}
        </TabsContent>
        <TabsContent value="ai"><AIModelForm /></TabsContent>
        <TabsContent value="apis"><ChannelsForm /></TabsContent>
        <TabsContent value="database"><DatabaseForm /></TabsContent>
      </Tabs>
    </div>
  );
}