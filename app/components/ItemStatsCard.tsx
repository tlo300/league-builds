import type { DDragonData } from "@/app/lib/ddragon";

type StatInfo = {
  label: string;
  color: string;
  format: (v: number) => string;
};

export const STAT_ORDER = [
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

export const STAT_INFO: Record<string, StatInfo> = {
  FlatHPPoolMod:             { label: "Health",                  color: "#1caa60", format: v => `+${Math.round(v)}` },
  FlatMPPoolMod:             { label: "Mana",                    color: "#5eafd8", format: v => `+${Math.round(v)}` },
  FlatPhysicalDamageMod:     { label: "Attack Damage",           color: "#c89b3c", format: v => `+${Math.round(v)}` },
  FlatMagicDamageMod:        { label: "Ability Power",           color: "#7ec8e3", format: v => `+${Math.round(v)}` },
  FlatArmorMod:              { label: "Armor",                   color: "#c8d9a3", format: v => `+${Math.round(v)}` },
  FlatSpellBlockMod:         { label: "Magic Resist",            color: "#c89bd9", format: v => `+${Math.round(v)}` },
  PercentAttackSpeedMod:     { label: "Attack Speed",            color: "#e8d5a3", format: v => `+${(v * 100).toFixed(0)}%` },
  FlatCritChanceMod:         { label: "Critical Strike Chance",  color: "#e07b39", format: v => `+${Math.round(v * 100)}%` },
  FlatMovementSpeedMod:      { label: "Move Speed",              color: "#d0d0d0", format: v => `+${Math.round(v)}` },
  PercentMovementSpeedMod:   { label: "Move Speed",              color: "#d0d0d0", format: v => `+${(v * 100).toFixed(0)}%` },
  PercentLifeStealMod:       { label: "Life Steal",              color: "#c95252", format: v => `+${Math.round(v * 100)}%` },
  FlatArmorPenetrationMod:   { label: "Lethality",               color: "#c89b3c", format: v => `+${Math.round(v)}` },
  PercentArmorPenetrationMod:{ label: "Armor Penetration",       color: "#c89b3c", format: v => `+${Math.round(v * 100)}%` },
  FlatMagicPenetrationMod:   { label: "Magic Penetration",       color: "#7ec8e3", format: v => `+${Math.round(v)}` },
  PercentMagicPenetrationMod:{ label: "Magic Penetration",       color: "#7ec8e3", format: v => `+${Math.round(v * 100)}%` },
  FlatHPRegenMod:            { label: "Health Regen",            color: "#1caa60", format: v => `+${v.toFixed(1)}` },
  FlatMPRegenMod:            { label: "Mana Regen",              color: "#5eafd8", format: v => `+${v.toFixed(1)}` },
};

type ItemEntry = NonNullable<DDragonData["items"]>[number];

type Props = {
  item: ItemEntry;
};

export function ItemStatsCard({ item }: Props) {
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
