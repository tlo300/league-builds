"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { DDragonData } from "@/app/lib/ddragon";

const CDN = "https://ddragon.leagueoflegends.com/cdn";

type StatInfo = {
  label: string;
  color: string;
  format: (v: number) => string;
};

// Ordered list of stat keys for display (matches in-game order)
const STAT_ORDER = [
  "FlatHPPoolMod",
  "FlatMPPoolMod",
  "FlatPhysicalDamageMod",
  "FlatMagicDamageMod",
  "FlatArmorMod",
  "FlatSpellBlockMod",
  "PercentAttackSpeedMod",
  "FlatCritChanceMod",
  "FlatMovementSpeedMod",
  "PercentMovementSpeedMod",
  "PercentLifeStealMod",
  "FlatArmorPenetrationMod",
  "PercentArmorPenetrationMod",
  "FlatMagicPenetrationMod",
  "PercentMagicPenetrationMod",
  "FlatHPRegenMod",
  "FlatMPRegenMod",
];

const STAT_INFO: Record<string, StatInfo> = {
  FlatHPPoolMod:            { label: "Health",                   color: "#1caa60", format: v => `+${Math.round(v)}` },
  FlatMPPoolMod:            { label: "Mana",                     color: "#5eafd8", format: v => `+${Math.round(v)}` },
  FlatPhysicalDamageMod:    { label: "Attack Damage",            color: "#c89b3c", format: v => `+${Math.round(v)}` },
  FlatMagicDamageMod:       { label: "Ability Power",            color: "#7ec8e3", format: v => `+${Math.round(v)}` },
  FlatArmorMod:             { label: "Armor",                    color: "#c8d9a3", format: v => `+${Math.round(v)}` },
  FlatSpellBlockMod:        { label: "Magic Resist",             color: "#c89bd9", format: v => `+${Math.round(v)}` },
  PercentAttackSpeedMod:    { label: "Attack Speed",             color: "#e8d5a3", format: v => `+${(v * 100).toFixed(0)}%` },
  FlatCritChanceMod:        { label: "Critical Strike Chance",   color: "#e07b39", format: v => `+${Math.round(v * 100)}%` },
  FlatMovementSpeedMod:     { label: "Move Speed",               color: "#d0d0d0", format: v => `+${Math.round(v)}` },
  PercentMovementSpeedMod:  { label: "Move Speed",               color: "#d0d0d0", format: v => `+${(v * 100).toFixed(0)}%` },
  PercentLifeStealMod:      { label: "Life Steal",               color: "#c95252", format: v => `+${Math.round(v * 100)}%` },
  FlatArmorPenetrationMod:  { label: "Lethality",                color: "#c89b3c", format: v => `+${Math.round(v)}` },
  PercentArmorPenetrationMod:{ label: "Armor Penetration",       color: "#c89b3c", format: v => `+${Math.round(v * 100)}%` },
  FlatMagicPenetrationMod:  { label: "Magic Penetration",        color: "#7ec8e3", format: v => `+${Math.round(v)}` },
  PercentMagicPenetrationMod:{ label: "Magic Penetration",       color: "#7ec8e3", format: v => `+${Math.round(v * 100)}%` },
  FlatHPRegenMod:           { label: "Health Regen",             color: "#1caa60", format: v => `+${v.toFixed(1)}` },
  FlatMPRegenMod:           { label: "Mana Regen",               color: "#5eafd8", format: v => `+${v.toFixed(1)}` },
};

type ItemEntry = NonNullable<DDragonData["items"]>[number];

type TooltipState = {
  item: ItemEntry;
  x: number;
  y: number;
};

type Props = {
  value: string;
  onChange: (name: string) => void;
  slot: number;
  ddData: DDragonData | null;
  fallbackItems: string[];
};

export function ItemPicker({ value, onChange, slot, ddData, fallbackItems }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allItems: ItemEntry[] = ddData?.items ?? fallbackItems.map(name => ({ id: 0, name }));

  const filtered = search.trim()
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const iconUrl = (item: ItemEntry) =>
    item.id > 0 && ddData ? `${CDN}/${ddData.version}/img/item/${item.id}.png` : null;

  const selectedItem = value ? allItems.find(i => i.name === value) : undefined;
  const selectedIcon = selectedItem ? iconUrl(selectedItem) : null;

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 372;
      let left = rect.left;
      if (left + panelWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - panelWidth - 8);
      }
      // Show above if not enough space below
      const panelHeight = 360;
      const top = rect.bottom + window.innerHeight - rect.bottom > panelHeight
        ? rect.bottom + 4
        : rect.top - panelHeight - 4;
      setDropdownPos({ top, left });
    }
    setOpen(true);
    setSearch("");
  };

  useEffect(() => {
    if (open && searchRef.current) {
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

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

  const handleItemHover = useCallback((item: ItemEntry, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 248;
    const x = rect.right + tooltipWidth + 12 <= window.innerWidth
      ? rect.right + 8
      : rect.left - tooltipWidth - 8;
    setTooltip({ item, x, y: rect.top });
  }, []);

  return (
    <div className="flex items-center gap-2" ref={wrapperRef}>
      <span className="w-5 h-5 rounded bg-[#1e2a3a] text-[#8a9bb0] text-xs flex items-center justify-center shrink-0">
        {slot}
      </span>
      <div className="flex-1 min-w-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-xs hover:border-[#c89b3c]/50 focus:outline-none focus:border-[#c89b3c] transition-colors text-left"
        >
          {selectedIcon ? (
            <img
              src={selectedIcon}
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
            {value || `Item ${slot}...`}
          </span>
          {value && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onChange(""); }}
              className="text-[#4a5568] hover:text-[#8a9bb0] text-sm leading-none px-0.5 cursor-pointer"
            >
              ×
            </span>
          )}
        </button>

        {open && dropdownPos && (
          <div
            className="fixed z-[200] bg-[#0d1117] border border-[#1e2a3a] rounded-xl shadow-2xl flex flex-col"
            style={{ top: dropdownPos.top, left: dropdownPos.left, width: 372 }}
          >
            <div className="p-2 border-b border-[#1e2a3a] shrink-0">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-xs text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
              />
            </div>
            <div className="px-2 py-1 shrink-0 text-[0.6rem] text-[#4a5568] border-b border-[#1e2a3a]">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </div>
            <div className="overflow-y-auto p-2" style={{ maxHeight: 296 }}>
              {filtered.length === 0 ? (
                <div className="text-center text-[#4a5568] text-xs py-8">No items found</div>
              ) : (
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
                  {filtered.map(item => {
                    const icon = iconUrl(item);
                    const isSelected = value === item.name;
                    return (
                      <button
                        key={item.id || item.name}
                        type="button"
                        onClick={() => { onChange(item.name); setOpen(false); setTooltip(null); }}
                        onMouseEnter={e => handleItemHover(item, e)}
                        onMouseLeave={() => setTooltip(null)}
                        title={item.name}
                        className={`aspect-square rounded border transition-all duration-100 hover:scale-110 hover:z-10 relative ${
                          isSelected
                            ? "border-[#c89b3c] ring-1 ring-[#c89b3c]/50 brightness-125"
                            : "border-[#1e2a3a] hover:border-[#c89b3c]/60"
                        }`}
                      >
                        {icon ? (
                          <img
                            src={icon}
                            alt={item.name}
                            className="w-full h-full rounded"
                            loading="lazy"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-[#1e2a3a] flex items-center justify-center">
                            <span className="text-[0.4rem] text-[#8a9bb0] p-0.5 leading-tight text-center">
                              {item.name.substring(0, 4)}
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
      </div>

      {tooltip && (
        <div
          className="fixed z-[300] pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <ItemTooltip item={tooltip.item} />
        </div>
      )}
    </div>
  );
}

function ItemTooltip({ item }: { item: ItemEntry }) {
  const statsToShow = item.stats
    ? STAT_ORDER
        .filter(key => (item.stats![key] ?? 0) > 0 && STAT_INFO[key])
        .map(key => ({ key, value: item.stats![key], info: STAT_INFO[key] }))
    : [];

  return (
    <div className="bg-[#06080f] border border-[#c89b3c]/50 rounded-lg shadow-2xl overflow-hidden" style={{ minWidth: 200, maxWidth: 248 }}>
      {/* Header */}
      <div className="bg-[#0d1117] border-b border-[#1e2a3a] px-3 py-2">
        <div className="text-sm font-bold text-[#c89b3c] leading-snug">{item.name}</div>
        {item.gold != null && item.gold > 0 && (
          <div className="text-xs text-[#e8b84b] flex items-center gap-1 mt-0.5">
            <span>◈</span>
            <span>{item.gold} gold</span>
          </div>
        )}
      </div>

      {/* Stats */}
      {statsToShow.length > 0 && (
        <div className="px-3 py-2 space-y-0.5">
          {statsToShow.map(({ key, value, info }) => (
            <div key={key} className="text-xs flex items-center justify-between gap-4">
              <span style={{ color: info.color }}>{info.label}</span>
              <span style={{ color: info.color }} className="font-semibold tabular-nums whitespace-nowrap">
                {info.format(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className={`px-3 py-2 text-[0.65rem] text-[#8a9bb0] leading-relaxed ${statsToShow.length > 0 ? "border-t border-[#1e2a3a]" : ""}`}>
          {item.description}
        </div>
      )}
    </div>
  );
}
