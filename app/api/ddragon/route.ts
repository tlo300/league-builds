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

    // Champions: display name → ddragon id (e.g. "Wukong" → "MonkeyKing")
    const championKeys: Record<string, string> = {};
    const champions: string[] = [];
    for (const champ of Object.values(champJson.data) as Array<{ name: string; id: string }>) {
      championKeys[champ.name] = champ.id;
      champions.push(champ.name);
    }
    champions.sort();

    // Items: only purchasable items on Summoner's Rift, sorted by gold cost desc
    const itemIds: Record<string, number> = {};
    const items: Array<{ id: number; name: string; gold: number }> = [];
    for (const [id, item] of Object.entries(itemJson.data) as Array<[string, { name: string; gold: { total: number; purchasable: boolean }; maps: Record<string, boolean> }]>) {
      if (item.maps?.["11"] && item.gold?.purchasable) {
        itemIds[item.name] = Number(id);
        items.push({ id: Number(id), name: item.name, gold: item.gold.total ?? 0 });
      }
    }
    items.sort((a, b) => b.gold - a.gold || a.name.localeCompare(b.name));

    // Summoner spells available in Classic (SR) mode
    const spellKeys: Record<string, string> = {};
    const spellNames: string[] = [];
    for (const [key, spell] of Object.entries(spellJson.data) as Array<[string, { name: string; modes: string[] }]>) {
      if (spell.modes?.includes("CLASSIC")) {
        spellKeys[spell.name] = key;
        spellNames.push(spell.name);
      }
    }
    spellNames.sort();

    // Runes: keystones (slot 0 of each path) and path icons
    const keystoneIcons: Record<string, string> = {};
    const keystoneNames: string[] = [];
    const runePathIcons: Record<string, string> = {};
    const runePathNames: string[] = [];
    for (const path of runeJson as Array<{ name: string; icon: string; slots: Array<{ runes: Array<{ name: string; icon: string }> }> }>) {
      runePathIcons[path.name] = path.icon;
      runePathNames.push(path.name);
      for (const rune of path.slots[0].runes) {
        keystoneIcons[rune.name] = rune.icon;
        keystoneNames.push(rune.name);
      }
    }

    return Response.json({
      version,
      champions,
      championKeys,
      items: items.map((i) => ({ id: i.id, name: i.name })),
      itemIds,
      spellNames,
      spellKeys,
      keystoneNames,
      keystoneIcons,
      runePathNames,
      runePathIcons,
    });
  } catch {
    return Response.json({ error: "Failed to fetch Data Dragon" }, { status: 500 });
  }
}
