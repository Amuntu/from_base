import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Ask the copilot to run agents, test channels, inspect the database…"
        className="flex-1 resize-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
      />
      <Button onClick={submit} disabled={disabled || !value.trim()} className="h-10 px-4">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}