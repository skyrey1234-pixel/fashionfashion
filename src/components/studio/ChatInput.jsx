import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import AttachmentPicker from "@/components/studio/AttachmentPicker";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState([]);
  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if ((!text && files.length === 0) || disabled) return;
    setValue("");
    setFiles([]);
    onSend(text || "Here are my references — design from these.", files);
  };
  return (
    <form onSubmit={submit}>
      <div className="relative">
        <AttachmentPicker files={files} setFiles={setFiles} disabled={disabled} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe the piece — or attach a photo or document to edit…"
          disabled={disabled}
          className="w-full rounded-full border border-stone-300 bg-white px-6 py-4 pl-12 pr-14 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors shadow-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || (!value.trim() && files.length === 0)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center hover:bg-amber-800 transition-colors duration-300 disabled:opacity-30"
          aria-label="Send"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}