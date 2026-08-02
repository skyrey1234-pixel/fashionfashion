import React, { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import ChatMessage from "@/components/studio/ChatMessage";
import WorkingIndicator from "@/components/studio/WorkingIndicator";

export default function EditorChat({ messages, working, onSend }) {
  const [value, setValue] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, working]);

  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || working) return;
    setValue("");
    onSend(text);
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-3">Design Assistant</p>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role}>
            <span className="whitespace-pre-line">{m.text}</span>
          </ChatMessage>
        ))}
        {working && (
          <ChatMessage role="assistant">
            <WorkingIndicator stage={working} />
          </ChatMessage>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="pt-3">
        <div className="relative">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe your next change…"
            disabled={!!working}
            className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 pr-12 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!!working || !value.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center hover:bg-amber-800 transition-colors disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}