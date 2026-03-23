export async function GET() {
  try {
    const versions: string[] = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
      { next: { revalidate: 3600 } }
    ).then((r) => r.json());

    const version = versions[0];

    const [champJson, itemJson, spellJson, runeJson] = await Promise.all([
      fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`, { next: { revalidate: 3600 } }).then((r) => r.json()),
    ]);

    // Champions: display name → ddragon id (e.g. "Wukong" → "MonkeyKing"), plus base stats
    const championKeys: Record<string, string> = {};
    const champions: string[] = [];
    const championStats: Record<string, { tags: string[]; hp: number; mp: number; movespeed: number; armor: number; spellblock: number; attackdamage: number; attackspeed: number }> = {};
    for (const champ of Object.values(champJson.data) as Array<{ name: string; id: string; tags: string[]; stats: { hp: number; mp: number; movespeed: number; armor: number; spellblock: number; attackdamage: number; attackspeed: number } }>) {
      championKeys[champ.name] = champ.id;
      champions.push(champ.name);
      championStats[champ.name] = { tags: champ.tags, hp: champ.stats.hp, mp: champ.stats.mp, movespeed: champ.stats.movespeed, armor: champ.stats.armor, spellblock: champ.stats.spellblock, attackdamage: champ.stats.attackdamage, attackspeed: champ.stats.attackspeed };
    }
    champions.sort();

    // Items: only purchasable items on Summoner's Rift, sorted by gold cost desc
    const itemIds: Record<string, number> = {};
    const items: Array<{ id: number; name: string; gold: number; stats: Record<string, number>; description: string }> = [];
    for (const [id, item] of Object.entries(itemJson.data) as Array<[string, { name: string; plaintext?: string; gold: { total: number; purchasable: boolean }; maps: Record<string, boolean>; stats?: Record<string, number> }]>) {
      if (item.maps?.["11"] && item.gold?.purchasable) {
        itemIds[item.name] = Number(id);
        items.push({ id: Number(id), name: item.name, gold: item.gold.total ?? 0, stats: item.stats ?? {}, description: item.plaintext ?? "" });
      }
    }
    items.sort((a, b) => b.gold - a.gold || a.name.localeCompare(b.name));

    // Summoner spells available in Classic (SR) mode
    const spellKeys: Record<string, string> = {};
    const spellIdKeys: Record<number, string> = {};
    const spellNames: string[] = [];
    for (const [key, spell] of Object.entries(spellJson.data) as Array<[string, { name: string; modes: string[]; key: string }]>) {
      spellIdKeys[Number(spell.key)] = key; // numeric ID → ddragon key (e.g. 4 → "SummonerFlash")
      if (spell.modes?.includes("CLASSIC")) {
        spellKeys[spell.name] = key;
        spellNames.push(spell.name);
      }
    }
    spellNames.sort();

    // Runes: keystones (slot 0 of each path), path icons, and full ID→icon map
    const keystoneIcons: Record<string, string> = {};
    const keystoneNames: string[] = [];
    const keystoneDescs: Record<string, string> = {};
    const runePathIcons: Record<string, string> = {};
    const runePathNames: string[] = [];
    const runeIconsById: Record<number, string> = {};
    for (const path of runeJson as Array<{ id: number; name: string; icon: string; slots: Array<{ runes: Array<{ id: number; name: string; icon: string; shortDesc?: string }> }> }>) {
      runePathIcons[path.name] = path.icon;
      runePathNames.push(path.name);
      runeIconsById[path.id] = path.icon;
      for (const slot of path.slots) {
        for (const rune of slot.runes) {
          runeIconsById[rune.id] = rune.icon;
          if (slot === path.slots[0]) {
            keystoneIcons[rune.name] = rune.icon;
            keystoneNames.push(rune.name);
            keystoneDescs[rune.name] = (rune.shortDesc ?? "").replace(/<[^>]+>/g, "");
          }
        }
      }
    }

    return Response.json({
      version,
      champions,
      championKeys,
      championStats,
      items: items.map((i) => ({ id: i.id, name: i.name, gold: i.gold, stats: i.stats, description: i.description })),
      itemIds,
      spellNames,
      spellKeys,
      spellIdKeys,
      keystoneNames,
      keystoneIcons,
      keystoneDescs,
      runePathNames,
      runePathIcons,
      runeIconsById,
    });
  } catch {
    return Response.json({ error: "Failed to fetch Data Dragon" }, { status: 500 });
  }
}
