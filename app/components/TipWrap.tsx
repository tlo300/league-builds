"use client";

import { useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DDragonData } from "@/app/lib/ddragon";
import { ItemStatsCard } from "@/app/components/ItemStatsCard";

type TipState = { x: number; y: number };

type TipWrapProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Wraps any icon with a hover tooltip showing just the name. */
export function TipWrap({ label, children, className }: TipWrapProps) {
  const [tip, setTip] = useState<TipState | null>(null);

  const handleEnter = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tipW = 180;
    const x = rect.right + tipW + 8 <= window.innerWidth ? rect.right + 6 : rect.left - tipW - 6;
    setTip({ x, y: rect.top });
  }, []);

  return (
    <div
      className={className ?? "inline-flex"}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setTip(null)}
    >
      {children}
      {tip && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[500] pointer-events-none"
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="bg-[#06080f] border border-[#c89b3c]/50 rounded-lg shadow-2xl px-3 py-2" style={{ maxWidth: 180 }}>
            <div className="text-sm font-bold text-[#c89b3c] leading-snug">{label}</div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

type ItemTipWrapProps = {
  item: NonNullable<DDragonData["items"]>[number] | null | undefined;
  children: ReactNode;
  className?: string;
};

/** Wraps an item icon with a hover tooltip showing full item stats. */
export function ItemTipWrap({ item, children, className }: ItemTipWrapProps) {
  const [tip, setTip] = useState<TipState | null>(null);

  const handleEnter = useCallback((e: React.MouseEvent) => {
    if (!item) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tipW = 248;
    const x = rect.right + tipW + 8 <= window.innerWidth ? rect.right + 6 : rect.left - tipW - 6;
    setTip({ x, y: rect.top });
  }, [item]);

  if (!item) return <>{children}</>;

  return (
    <div
      className={className ?? "inline-flex"}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setTip(null)}
    >
      {children}
      {tip && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[500] pointer-events-none"
          style={{ left: tip.x, top: tip.y }}
        >
          <ItemStatsCard item={item} />
        </div>,
        document.body
      )}
    </div>
  );
}
