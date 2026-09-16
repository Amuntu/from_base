import React, { useEffect, useRef, useState } from "react";
import { localClient as base44 } from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import MessageBubble from "@/components/copilot/MessageBubble";
import ChatInput from "@/components/copilot/ChatInput";

const AGENT = "abraa_copilot";

const SUGGESTIONS = [
  "What needs my attention right now?",
  "Run all agents",
  "How many suppliers do we have?",
  "Inspect the connected database",
];

export default function Copilot() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      const convs = await base44.agents.listConversations({ agent_name: AGENT });
      let conv = convs[0];
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT,
          metadata: { name: "Operations" },
        });
      }
      setConversation(conv);
      if (conv.messages?.length) setMessages(conv.messages);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!conversation) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
    });
    return unsubscribe;
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const newChat = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT,
      metadata: { name: "Operations" },
    });
    setConversation(conv);
    setMessages([]);
  };

  const send = async (text) => {
    await base44.agents.addMessage(conversation, { role: "user", content: text });
  };

  const assistantBusy = messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Operations Copilot
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your AI operator — ask for actions, data, or let it run the whole pipeline.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={newChat} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-center text-sm text-slate-400 py-8">Loading…</p>}
          {!loading && messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 mb-5">Ask me anything about your operations — or start with:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
          {assistantBusy && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-slate-100 p-3">
          <ChatInput onSend={send} disabled={assistantBusy || !conversation} />
        </div>
      </div>
    </div>
  );
}