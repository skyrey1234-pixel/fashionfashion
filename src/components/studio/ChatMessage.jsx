import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ChatMessage({ role, children }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center mr-3 shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-amber-200" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
          isUser
            ? "bg-stone-900 text-stone-50 rounded-br-sm"
            : "bg-white border border-stone-200/80 text-stone-700 rounded-bl-sm shadow-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}