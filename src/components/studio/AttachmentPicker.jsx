import React, { useRef } from "react";
import { Paperclip, X, FileText, ImageIcon } from "lucide-react";

export default function AttachmentPicker({ files, setFiles, disabled }) {
  const inputRef = useRef(null);
  return (
    <>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-full pl-3 pr-1.5 py-1 text-xs text-stone-600">
              {f.type.startsWith("image/") ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span className="max-w-[140px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="w-4 h-4 rounded-full hover:bg-stone-200 flex items-center justify-center"
                aria-label={`Remove ${f.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.md,.txt,.pdf,.csv,.json"
        className="hidden"
        onChange={(e) => {
          setFiles([...files, ...Array.from(e.target.files)]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-stone-400 hover:text-stone-900 flex items-center justify-center transition-colors disabled:opacity-30"
        aria-label="Attach files"
      >
        <Paperclip className="w-4 h-4" />
      </button>
    </>
  );
}