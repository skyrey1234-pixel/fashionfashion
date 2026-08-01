import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  };
  return (
    <form onSubmit={submit} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe the piece you'd like designed…"
        disabled={disabled}
        className="w-full rounded-full border border-stone-300 bg-white px-6 py-4 pr-14 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors shadow-sm disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center hover:bg-amber-800 transition-colors duration-300 disabled:opacity-30"
        aria-label="Send"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </form>
  );
}