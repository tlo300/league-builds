"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

export type GridItem = {
  value: string;
  iconUrl: string | null;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: GridItem[];
  placeholder?: string;
  /** Show search input. Auto-true when items.length > 16. */
  showSearch?: boolean;
  /** Number of icon columns in the grid. */
  columns?: number;
  /** Panel pixel width. Defaults to columns * 52 + 16. */
  panelWidth?: number;
  maxDropdownHeight?: number;
  /** When true, hides the × clear button. */
  required?: boolean;
  /** Render the tooltip body content for a hovered item. */
  renderTooltipContent?: (item: GridItem) => ReactNode;
};

type TooltipState = {
  item: GridItem;
  x: number;
  y: number;
};

export function IconGridPicker({
  value,
  onChange,
  items,
  placeholder = "Select...",
  showSearch,
  columns = 6,
  panelWidth,
  maxDropdownHeight = 280,
  required,
  renderTooltipContent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const shouldShowSearch = showSearch ?? items.length > 16;
  const pWidth = panelWidth ?? columns * 52 + 16;

  const filtered = search.trim()
    ? items.filter(i => i.value.toLowerCase().includes(search.toLowerCase()))
    : items;

  const selectedItem = value ? items.find(i => i.value === value) : undefined;

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.left;
      if (left + pWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pWidth - 8);
      const panelH = maxDropdownHeight + (shouldShowSearch ? 80 : 0) + 16;
      const top = window.innerHeight - rect.bottom > panelH
        ? rect.bottom + 4
        : rect.top - panelH - 4;
      setDropdownPos({ top, left });
    }
    setOpen(true);
    setSearch("");
  };

  useEffect(() => {
    if (open && shouldShowSearch && searchRef.current) {
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open, shouldShowSearch]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setTooltip(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setTooltip(null); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleItemHover = useCallback((item: GridItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!renderTooltipContent) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipW = 248;
    const x = rect.right + tooltipW + 8 <= window.innerWidth
      ? rect.right + 8
      : rect.left - tooltipW - 8;
    setTooltip({ item, x, y: rect.top });
  }, [renderTooltipContent]);

  return (
    <div className="w-full" ref={wrapperRef}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-xs hover:border-[#c89b3c]/50 focus:outline-none focus:border-[#c89b3c] transition-colors text-left"
      >
        {selectedItem?.iconUrl ? (
          <img
            src={selectedItem.iconUrl}
            alt={value}
            className="w-6 h-6 rounded shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-6 h-6 rounded bg-[#1e2a3a] border border-dashed border-[#2a3a4a] flex items-center justify-center shrink-0">
            <span className="text-[#4a5568] text-xs leading-none">+</span>
          </div>
        )}
        <span className={`flex-1 truncate ${value ? "text-[#e8d5a3]" : "text-[#4a5568]"}`}>
          {value || placeholder}
        </span>
        {value && !required && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(""); }}
            className="text-[#4a5568] hover:text-[#8a9bb0] text-sm leading-none px-0.5 cursor-pointer"
          >
            ×
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && dropdownPos && (
        <div
          className="fixed z-[200] bg-[#0d1117] border border-[#1e2a3a] rounded-xl shadow-2xl flex flex-col"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: pWidth }}
        >
          {shouldShowSearch && (
            <div className="p-2 border-b border-[#1e2a3a] shrink-0">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-xs text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
              />
            </div>
          )}
          {shouldShowSearch && (
            <div className="px-2 py-1 shrink-0 text-[0.6rem] text-[#4a5568] border-b border-[#1e2a3a]">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
          <div className="overflow-y-auto p-2" style={{ maxHeight: maxDropdownHeight }}>
            {filtered.length === 0 ? (
              <div className="text-center text-[#4a5568] text-xs py-6">No results</div>
            ) : (
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {filtered.map(item => {
                  const isSelected = value === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => { onChange(item.value); setOpen(false); setTooltip(null); }}
                      onMouseEnter={renderTooltipContent ? e => handleItemHover(item, e) : undefined}
                      onMouseLeave={renderTooltipContent ? () => setTooltip(null) : undefined}
                      title={item.value}
                      className={`aspect-square rounded border transition-all duration-100 hover:scale-110 hover:z-10 relative ${
                        isSelected
                          ? "border-[#c89b3c] ring-1 ring-[#c89b3c]/50 brightness-125"
                          : "border-[#1e2a3a] hover:border-[#c89b3c]/60"
                      }`}
                    >
                      {item.iconUrl ? (
                        <img
                          src={item.iconUrl}
                          alt={item.value}
                          className="w-full h-full rounded"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-[#1e2a3a] flex items-center justify-center">
                          <span className="text-[0.45rem] text-[#8a9bb0] p-0.5 leading-tight text-center">
                            {item.value.substring(0, 6)}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && renderTooltipContent && (
        <div
          className="fixed z-[300] pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="bg-[#06080f] border border-[#c89b3c]/50 rounded-lg shadow-2xl overflow-hidden" style={{ minWidth: 180, maxWidth: 248 }}>
            {renderTooltipContent(tooltip.item)}
          </div>
        </div>
      )}
    </div>
  );
}
