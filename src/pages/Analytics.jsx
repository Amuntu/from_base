import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenuePanel from "@/components/analytics/RevenuePanel";
import MarketingPanel from "@/components/analytics/MarketingPanel";

export default function Analytics() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Analytics</h1>
      <p className="text-slate-400 text-sm mb-8">Revenue and marketing performance.</p>
      <Tabs defaultValue="revenue">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue"><RevenuePanel /></TabsContent>
        <TabsContent value="marketing"><MarketingPanel /></TabsContent>
      </Tabs>
    </div>
  );
}