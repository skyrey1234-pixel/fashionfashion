import React, { useRef } from "react";

/** Renders the blank garment with draggable image/text layers positioned in % of the canvas box. */
export default function MockupCanvas({ product, layers, selectedId, onSelect, onChange, showGuide = true, canvasRef }) {
  const boxRef = useRef(null);
  const drag = useRef(null);

  const startDrag = (e, layer) => {
    e.preventDefault();
    onSelect(layer.id);
    const rect = boxRef.current.getBoundingClientRect();
    drag.current = {
      id: layer.id,
      offsetX: ((e.clientX - rect.left) / rect.width) * 100 - layer.x,
      offsetY: ((e.clientY - rect.top) / rect.height) * 100 - layer.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e) => {
    if (!drag.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - drag.current.offsetX;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - drag.current.offsetY;
    onChange(drag.current.id, {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const area = product.print_area;

  return (
    <div ref={boxRef} className="relative w-full max-w-lg mx-auto select-none">
      <div ref={canvasRef} className="relative">
        <img src={product.image} alt={product.name} crossOrigin="anonymous" className="w-full rounded-xl" draggable={false} />
        {showGuide && (
          <div
            className="absolute border border-dashed border-stone-400/70 pointer-events-none rounded"
            style={{ left: `${area.x}%`, top: `${area.y}%`, width: `${area.width}%`, height: `${area.height}%` }}
          />
        )}
        {layers
          .filter((l) => l.type === "pattern")
          .map((l) => (
            <div
              key={l.id}
              onPointerDown={() => onSelect(l.id)}
              className="absolute inset-0 cursor-pointer"
              style={{
                backgroundImage: `url(${l.url})`,
                backgroundSize: `${l.width}%`,
                backgroundRepeat: "repeat",
                clipPath: product.body_clip,
                mixBlendMode: "multiply",
                opacity: l.opacity ?? 1,
              }}
            />
          ))}
        {layers.filter((l) => l.type !== "pattern").map((l) => (
          <div
            key={l.id}
            onPointerDown={(e) => startDrag(e, l)}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            className={`absolute cursor-move touch-none ${
              showGuide && selectedId === l.id ? "outline outline-2 outline-stone-900" : ""
            }`}
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: l.type === "image" ? `${l.width}%` : "auto",
              transform: `translate(-50%, -50%) rotate(${l.rotation || 0}deg)`,
            }}
          >
            {l.type === "image" ? (
              <img src={l.url} alt="" crossOrigin="anonymous" className="w-full block" draggable={false} />
            ) : (
              <span
                className="block whitespace-pre leading-tight"
                style={{
                  fontFamily: l.font,
                  color: l.color,
                  fontSize: `${l.width}px`,
                }}
              >
                {l.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}