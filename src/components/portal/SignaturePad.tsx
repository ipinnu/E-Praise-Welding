"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface SignaturePadProps {
  onSubmit: (blob: Blob) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export default function SignaturePad({ onSubmit, onCancel, submitting }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (("clientX" in e ? e.clientX : e.clientX) - rect.left) * scaleX,
      y: (("clientY" in e ? e.clientY : e.clientY) - rect.top) * scaleY,
    };
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const point = "touches" in e
      ? getPos(e.touches[0], canvas)
      : getPos(e.nativeEvent as MouseEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const point = "touches" in e
      ? getPos(e.touches[0], canvas)
      : getPos(e.nativeEvent as MouseEvent, canvas);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setIsEmpty(false);
  }, []);

  const endDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }

  function submit() {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    canvas.toBlob((blob) => {
      if (blob) onSubmit(blob);
    }, "image/png");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-black bg-white relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full touch-none cursor-crosshair block"
          style={{ height: "160px" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-kanit text-black/20 text-sm uppercase tracking-widest">
              Sign here
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={clear}
          className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40 hover:text-black border-b border-black/20 hover:border-black transition-all duration-150"
        >
          Clear
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="font-kanit font-bold text-xs uppercase tracking-widest px-5 py-2.5 border-2 border-black text-black hover:bg-black hover:text-white transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isEmpty || submitting}
            className="font-kanit font-black text-xs uppercase tracking-widest px-6 py-2.5 bg-yellow-DEFAULT text-black border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
          >
            {submitting ? "Submitting…" : "Submit Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}
