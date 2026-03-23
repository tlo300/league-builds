export type DDragonData = {
  version: string;
  champions: string[];
  championKeys: Record<string, string>;
  items: Array<{ id: number; name: string }>;
  itemIds: Record<string, number>;
  spellNames: string[];
  spellKeys: Record<string, string>;
  keystoneNames: string[];
  keystoneIcons: Record<string, string>;
  runePathNames: string[];
  runePathIcons: Record<string, string>;
};

const CDN = "https://ddragon.leagueoflegends.com/cdn";
const RUNE_BASE = "https://ddragon.leagueoflegends.com/cdn/img";

export function championIcon(data: DDragonData, name: string): string {
  const key = data.championKeys[name] ?? name.replace(/[^a-zA-Z]/g, "");
  return `${CDN}/${data.version}/img/champion/${key}.png`;
}

export function itemIcon(data: DDragonData, name: string): string | null {
  const id = data.itemIds[name];
  return id ? `${CDN}/${data.version}/img/item/${id}.png` : null;
}

export function spellIcon(data: DDragonData, name: string): string | null {
  const key = data.spellKeys[name];
  return key ? `${CDN}/${data.version}/img/spell/${key}.png` : null;
}

export function keystoneIcon(data: DDragonData, name: string): string | null {
  const path = data.keystoneIcons[name];
  return path ? `${RUNE_BASE}/${path}` : null;
}

export function runePathIcon(data: DDragonData, name: string): string | null {
  const path = data.runePathIcons[name];
  return path ? `${RUNE_BASE}/${path}` : null;
}
