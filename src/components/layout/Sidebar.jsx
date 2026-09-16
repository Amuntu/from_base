import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Users, MessageSquareText, TrendingUp, SlidersHorizontal, Bot, MessageCircle } from "lucide-react";

const links = [
  { to: "/", label: "Control Room", icon: LayoutGrid },
  { to: "/agents", label: "AI Agents", icon: Bot },
  { to: "/copilot", label: "Copilot", icon: MessageCircle },
  { to: "/suppliers", label: "Suppliers", icon: Users },
  { to: "/followups", label: "Follow-ups", icon: MessageSquareText },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: SlidersHorizontal },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 h-screen sticky top-0 flex flex-col bg-white">
      <div className="px-6 py-7 border-b border-slate-100">
        <div className="text-lg font-semibold text-[hsl(var(--primary))] tracking-tight">ABRAA</div>
        <div className="text-xs text-slate-400 mt-0.5">Operations Command Center</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === to ? "bg-slate-100 text-[hsl(var(--primary))] font-medium" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}