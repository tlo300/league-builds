"use client";

import { useState, useEffect, useCallback } from "react";
import type { Build } from "@/db/schema";
import { type DDragonData, championIcon, spellIcon, itemIcon, keystoneIcon, runePathIcon } from "@/app/lib/ddragon";

const CHAMPIONS = [
  "Aatrox","Ahri","Akali","Akshan","Alistar","Amumu","Anivia","Annie","Aphelios",
  "Ashe","Aurelion Sol","Azir","Bard","Bel'Veth","Blitzcrank","Brand","Braum",
  "Caitlyn","Camille","Cassiopeia","Cho'Gath","Corki","Darius","Diana","Dr. Mundo",
  "Draven","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz",
  "Galio","Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger",
  "Illaoi","Irelia","Ivern","Janna","Jarvan IV","Jax","Jayce","Jhin","Jinx",
  "K'Sante","Kai'Sa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle",
  "Kayn","Kennen","Kha'Zix","Kindred","Kled","Kog'Maw","LeBlanc","Lee Sin",
  "Leona","Lillia","Lissandra","Lucian","Lulu","Lux","Malphite","Malzahar",
  "Maokai","Master Yi","Miss Fortune","Mordekaiser","Morgana","Nami","Nasus",
  "Nautilus","Neeko","Nidalee","Nilah","Nocturne","Nunu & Willump","Olaf","Orianna",
  "Ornn","Pantheon","Poppy","Pyke","Qiyana","Quinn","Rakan","Rammus","Rek'Sai",
  "Rell","Renata Glasc","Renekton","Rengar","Riven","Rumble","Ryze","Samira",
  "Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana","Singed","Sion",
  "Sivir","Skarner","Sona","Soraka","Swain","Sylas","Syndra","Tahm Kench",
  "Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere",
  "Twisted Fate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Vel'Koz",
  "Vex","Vi","Viego","Viktor","Vladimir","Volibear","Warwick","Wukong","Xayah",
  "Xerath","Xin Zhao","Yasuo","Yone","Yorick","Yuumi","Zac","Zed","Zeri",
  "Ziggs","Zilean","Zoe","Zyra"
];

const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"];

const KEYSTONE_RUNES = [
  "Conqueror", "Lethal Tempo", "Electrocute", "Dark Harvest", "Phase Rush",
  "Grasp of the Undying", "Aftershock", "Fleet Footwork", "Glacial Augment",
  "Hail of Blades", "Predator", "Press the Attack", "Summon Aery",
  "Arcane Comet", "First Strike"
];

const RUNE_PATHS = ["Precision", "Domination", "Sorcery", "Resolve", "Inspiration"];

const SUMMONER_SPELLS = [
  "Flash", "Ignite", "Exhaust", "Teleport", "Smite", "Heal",
  "Barrier", "Cleanse", "Ghost", "Clarity"
];

// Fallback item list used before DDragon data loads
const COMMON_ITEMS = [
  "Trinity Force", "Blade of the Ruined King", "Kraken Slayer", "Galeforce",
  "Infinity Edge", "Rabadon's Deathcap", "Luden's Tempest", "Shadowflame",
  "Rod of Ages", "Riftmaker", "Sunfire Aegis", "Heartsteel", "Jak'Sho, The Protean",
  "Black Cleaver", "Immortal Shieldbow", "Navori Quickblades", "Eclipse",
  "Serpent's Fang", "Axiom Arc", "Manamune", "Muramana", "Ravenous Hydra",
  "Titanic Hydra", "Sterak's Gage", "Death's Dance", "Guardian Angel",
  "Wit's End", "Frozen Heart", "Randuin's Omen", "Thornmail",
  "Spirit Visage", "Force of Nature", "Warmog's Armor",
  "Zhonya's Hourglass", "Banshee's Veil", "Void Staff", "Demonic Embrace",
  "Cosmic Drive", "Malignance", "Cryptbloom",
  "Runaan's Hurricane", "Guinsoo's Rageblade",
  "Youmuu's Ghostblade", "Duskblade of Draktharr", "Edge of Night",
  "Opportunity", "Hubris",
  "Sorcerer's Shoes", "Plated Steelcaps", "Mercury's Treads",
  "Berserker's Greaves", "Boots of Swiftness", "Ionian Boots of Lucidity",
  "Mobility Boots",
  "Long Sword", "Doran's Blade", "Doran's Ring", "Doran's Shield",
  "Dark Seal", "Cull"
];

type BuildFormData = {
  champion: string;
  role: string;
  keystoneRune: string;
  primaryRunePath: string;
  secondaryRunePath: string;
  summonerSpell1: string;
  summonerSpell2: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  item5: string;
  item6: string;
  starterItem: string;
  notes: string;
  winRate: string;
};

const emptyForm: BuildFormData = {
  champion: "",
  role: "Mid",
  keystoneRune: "",
  primaryRunePath: "",
  secondaryRunePath: "",
  summonerSpell1: "Flash",
  summonerSpell2: "Ignite",
  item1: "",
  item2: "",
  item3: "",
  item4: "",
  item5: "",
  item6: "",
  starterItem: "",
  notes: "",
  winRate: "",
};

export default function Home() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [form, setForm] = useState<BuildFormData>(emptyForm);
  const [filterChampion, setFilterChampion] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [ddData, setDdData] = useState<DDragonData | null>(null);
  const [champModal, setChampModal] = useState<string | null>(null);
  const [champBuilds, setChampBuilds] = useState<Build[] | null>(null);

  useEffect(() => {
    fetch("/api/ddragon").then((r) => r.json()).then(setDdData);
  }, []);

  const openChampModal = useCallback(async (champion: string) => {
    setChampModal(champion);
    setChampBuilds(null);
    const params = new URLSearchParams({ champion });
    const res = await fetch(`/api/builds?${params.toString()}`);
    const data: Build[] = await res.json();
    setChampBuilds([...data].sort((a, b) => (b.winRate ?? -1) - (a.winRate ?? -1)));
  }, []);

  const fetchBuilds = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterChampion) params.set("champion", filterChampion);
    if (filterRole !== "All") params.set("role", filterRole);
    const res = await fetch(`/api/builds?${params.toString()}`);
    const data = await res.json();
    setBuilds(data);
    setLoading(false);
  }, [filterChampion, filterRole]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      winRate: form.winRate ? Number(form.winRate) : null,
    };
    if (editingBuild) {
      await fetch(`/api/builds/${editingBuild.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    setEditingBuild(null);
    setForm(emptyForm);
    fetchBuilds();
  };

  const handleEdit = (build: Build) => {
    setEditingBuild(build);
    setForm({
      champion: build.champion,
      role: build.role,
      keystoneRune: build.keystoneRune ?? "",
      primaryRunePath: build.primaryRunePath ?? "",
      secondaryRunePath: build.secondaryRunePath ?? "",
      summonerSpell1: build.summonerSpell1 ?? "Flash",
      summonerSpell2: build.summonerSpell2 ?? "Ignite",
      item1: build.item1 ?? "",
      item2: build.item2 ?? "",
      item3: build.item3 ?? "",
      item4: build.item4 ?? "",
      item5: build.item5 ?? "",
      item6: build.item6 ?? "",
      starterItem: build.starterItem ?? "",
      notes: build.notes ?? "",
      winRate: build.winRate?.toString() ?? "",
    });
    setShowForm(true);
    setSelectedBuild(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this build?")) return;
    await fetch(`/api/builds/${id}`, { method: "DELETE" });
    if (selectedBuild?.id === id) setSelectedBuild(null);
    fetchBuilds();
  };

  const roleColor: Record<string, string> = {
    Top: "text-[#e8a838]",
    Jungle: "text-[#4a9e4a]",
    Mid: "text-[#c89b3c]",
    Bot: "text-[#4a9ecf]",
    Support: "text-[#9e4acf]",
  };

  const roleBg: Record<string, string> = {
    Top: "bg-[#e8a838]/20 border-[#e8a838]/40",
    Jungle: "bg-[#4a9e4a]/20 border-[#4a9e4a]/40",
    Mid: "bg-[#c89b3c]/20 border-[#c89b3c]/40",
    Bot: "bg-[#4a9ecf]/20 border-[#4a9ecf]/40",
    Support: "bg-[#9e4acf]/20 border-[#9e4acf]/40",
  };

  const items = (b: Build) =>
    [b.item1, b.item2, b.item3, b.item4, b.item5, b.item6].filter(Boolean);

  // Use DDragon data when loaded, fall back to hardcoded lists while loading
  const championList = ddData?.champions ?? CHAMPIONS;
  const spellList = ddData?.spellNames ?? SUMMONER_SPELLS;
  const keystoneList = ddData?.keystoneNames ?? KEYSTONE_RUNES;
  const runePathList = ddData?.runePathNames ?? RUNE_PATHS;
  const itemList = ddData?.items.map((i) => i.name) ?? COMMON_ITEMS;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8d5a3]">
      {/* Header */}
      <header className="border-b border-[#1e2a3a] bg-[#0d1117] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_VERCEL_URL ? "https://hub-green-beta.vercel.app" : "http://localhost:3000"}
              className="text-[#8a9bb0] hover:text-[#e8d5a3] text-sm transition-colors"
            >
              ← Hub
            </a>
            <div>
              <h1 className="text-2xl font-bold text-[#c89b3c] tracking-wide">
                ⚔ League Builds
              </h1>
              <p className="text-xs text-[#8a9bb0] mt-0.5">Track your champion builds & strategies</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingBuild(null); setForm(emptyForm); }}
            className="px-4 py-2 bg-[#c89b3c] hover:bg-[#d4a84a] text-black font-semibold rounded text-sm transition-colors"
          >
            + New Build
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Left: Build list */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <input
              type="text"
              placeholder="Search champion..."
              value={filterChampion}
              onChange={e => setFilterChampion(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c] w-48"
            />
            <div className="flex gap-1">
              {["All", ...ROLES].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-2 rounded text-xs font-medium border transition-colors ${
                    filterRole === r
                      ? "bg-[#c89b3c] border-[#c89b3c] text-black"
                      : "bg-[#0d1117] border-[#1e2a3a] text-[#8a9bb0] hover:border-[#c89b3c]/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Build cards */}
          {loading ? (
            <div className="text-center text-[#8a9bb0] py-12">Loading builds...</div>
          ) : builds.length === 0 ? (
            <div className="text-center text-[#8a9bb0] py-12">
              <div className="text-4xl mb-3">⚔</div>
              <p>No builds yet. Add your first build!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builds.map(build => (
                <div
                  key={build.id}
                  onClick={() => setSelectedBuild(selectedBuild?.id === build.id ? null : build)}
                  className={`bg-[#0d1117] border rounded-lg p-4 cursor-pointer transition-all hover:border-[#c89b3c]/60 ${
                    selectedBuild?.id === build.id ? "border-[#c89b3c]" : "border-[#1e2a3a]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ddData && (
                        <img
                          src={championIcon(ddData, build.champion)}
                          alt={build.champion}
                          className="w-10 h-10 rounded border border-[#1e2a3a]"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div>
                        <h3
                          className="font-bold text-[#e8d5a3] text-base hover:text-[#c89b3c] transition-colors cursor-pointer"
                          onClick={e => { e.stopPropagation(); openChampModal(build.champion); }}
                        >{build.champion}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${roleBg[build.role] ?? ""} ${roleColor[build.role] ?? ""}`}>
                          {build.role}
                        </span>
                      </div>
                    </div>
                    {build.winRate != null && (
                      <span className={`text-sm font-bold ${build.winRate >= 50 ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>
                        {build.winRate}% WR
                      </span>
                    )}
                  </div>

                  {build.keystoneRune && (
                    <div className="text-xs text-[#8a9bb0] mb-1">
                      <span className="text-[#c89b3c]">⬡</span> {build.keystoneRune}
                      {build.primaryRunePath && ` · ${build.primaryRunePath}`}
                    </div>
                  )}

                  {build.summonerSpell1 && (
                    <div className="text-xs text-[#8a9bb0] mb-1">
                      {build.summonerSpell1} / {build.summonerSpell2}
                    </div>
                  )}

                  {items(build).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {items(build).map((item, i) => (
                        <span key={i} className="text-xs bg-[#1e2a3a] text-[#e8d5a3] px-2 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {build.notes && (
                    <p className="text-xs text-[#8a9bb0] mt-2 line-clamp-2">{build.notes}</p>
                  )}

                  <div className="flex gap-2 mt-3 pt-2 border-t border-[#1e2a3a]">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(build); }}
                      className="text-xs text-[#8a9bb0] hover:text-[#c89b3c] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(build.id); }}
                      className="text-xs text-[#8a9bb0] hover:text-[#c84b31] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detail panel */}
        {selectedBuild && (
          <div className="w-80 shrink-0">
            <div className="bg-[#0d1117] border border-[#c89b3c]/40 rounded-lg p-5 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                {ddData && (
                  <img
                    src={championIcon(ddData, selectedBuild.champion)}
                    alt={selectedBuild.champion}
                    className="w-16 h-16 rounded-lg border border-[#c89b3c]/40 shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl font-bold text-[#c89b3c] truncate hover:underline cursor-pointer"
                    onClick={() => openChampModal(selectedBuild.champion)}
                  >{selectedBuild.champion}</h2>
                  <span className={`text-xs font-semibold ${roleColor[selectedBuild.role] ?? ""}`}>
                    {selectedBuild.role}
                  </span>
                </div>
                {selectedBuild.winRate != null && (
                  <div className={`text-2xl font-bold shrink-0 ${selectedBuild.winRate >= 50 ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>
                    {selectedBuild.winRate}%
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                {(selectedBuild.summonerSpell1 || selectedBuild.summonerSpell2) && (
                  <div>
                    <div className="text-xs text-[#8a9bb0] uppercase tracking-wider mb-1.5">Summoner Spells</div>
                    <div className="flex items-center gap-2">
                      {[selectedBuild.summonerSpell1, selectedBuild.summonerSpell2].map((spell, i) => {
                        const icon = spell && ddData ? spellIcon(ddData, spell) : null;
                        return spell ? (
                          <div key={i} className="flex items-center gap-1.5">
                            {icon ? (
                              <img
                                src={icon}
                                alt={spell}
                                title={spell}
                                className="w-8 h-8 rounded border border-[#1e2a3a]"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : null}
                            <span className="text-xs text-[#e8d5a3]">{spell}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {selectedBuild.keystoneRune && (
                  <div>
                    <div className="text-xs text-[#8a9bb0] uppercase tracking-wider mb-1.5">Runes</div>
                    <div className="flex items-center gap-2">
                      {ddData && keystoneIcon(ddData, selectedBuild.keystoneRune) && (
                        <img
                          src={keystoneIcon(ddData, selectedBuild.keystoneRune)!}
                          alt={selectedBuild.keystoneRune}
                          title={selectedBuild.keystoneRune}
                          className="w-8 h-8 rounded-full border border-[#1e2a3a]"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div>
                        <div className="text-[#e8d5a3] font-medium text-sm">{selectedBuild.keystoneRune}</div>
                        {(selectedBuild.primaryRunePath || selectedBuild.secondaryRunePath) && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {ddData && selectedBuild.primaryRunePath && runePathIcon(ddData, selectedBuild.primaryRunePath) && (
                              <img
                                src={runePathIcon(ddData, selectedBuild.primaryRunePath)!}
                                alt={selectedBuild.primaryRunePath}
                                title={selectedBuild.primaryRunePath}
                                className="w-4 h-4"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <span className="text-[#8a9bb0] text-xs">{selectedBuild.primaryRunePath}</span>
                            {selectedBuild.secondaryRunePath && (
                              <>
                                <span className="text-[#4a5568] text-xs">/</span>
                                {ddData && runePathIcon(ddData, selectedBuild.secondaryRunePath) && (
                                  <img
                                    src={runePathIcon(ddData, selectedBuild.secondaryRunePath)!}
                                    alt={selectedBuild.secondaryRunePath}
                                    title={selectedBuild.secondaryRunePath}
                                    className="w-4 h-4"
                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                )}
                                <span className="text-[#8a9bb0] text-xs">{selectedBuild.secondaryRunePath}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedBuild.starterItem && (
                  <div>
                    <div className="text-xs text-[#8a9bb0] uppercase tracking-wider mb-1.5">Starter</div>
                    <div className="flex items-center gap-2">
                      {ddData && itemIcon(ddData, selectedBuild.starterItem) && (
                        <img
                          src={itemIcon(ddData, selectedBuild.starterItem)!}
                          alt={selectedBuild.starterItem}
                          title={selectedBuild.starterItem}
                          className="w-8 h-8 rounded border border-[#1e2a3a]"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <span className="text-[#e8d5a3] text-sm">{selectedBuild.starterItem}</span>
                    </div>
                  </div>
                )}

                {items(selectedBuild).length > 0 && (
                  <div>
                    <div className="text-xs text-[#8a9bb0] uppercase tracking-wider mb-1.5">Core Items</div>
                    <div className="flex flex-wrap gap-1.5">
                      {items(selectedBuild).map((item, i) => {
                        const icon = item && ddData ? itemIcon(ddData, item) : null;
                        return (
                          <div key={i} title={item ?? undefined} className="flex flex-col items-center gap-0.5">
                            {icon ? (
                              <img
                                src={icon}
                                alt={item ?? ""}
                                className="w-10 h-10 rounded border border-[#1e2a3a] hover:border-[#c89b3c]/60 transition-colors"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  const fallback = el.nextElementSibling as HTMLElement | null;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-10 h-10 rounded border border-[#1e2a3a] bg-[#1e2a3a] items-center justify-center text-xs text-[#e8d5a3] text-center leading-tight p-0.5"
                              style={{ display: icon ? "none" : "flex" }}
                            >
                              {item}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedBuild.notes && (
                  <div>
                    <div className="text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Notes</div>
                    <div className="text-[#8a9bb0] text-xs leading-relaxed">{selectedBuild.notes}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t border-[#1e2a3a]">
                <button
                  onClick={() => handleEdit(selectedBuild)}
                  className="flex-1 py-2 bg-[#c89b3c]/20 border border-[#c89b3c]/40 text-[#c89b3c] text-sm rounded hover:bg-[#c89b3c]/30 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedBuild.id)}
                  className="px-3 py-2 bg-[#c84b31]/20 border border-[#c84b31]/40 text-[#c84b31] text-sm rounded hover:bg-[#c84b31]/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Champion builds modal */}
      {champModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1e2a3a] flex items-center gap-3 shrink-0">
              {ddData && (
                <img
                  src={championIcon(ddData, champModal)}
                  alt={champModal}
                  className="w-12 h-12 rounded-lg border border-[#c89b3c]/40"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#c89b3c]">{champModal}</h2>
                <p className="text-xs text-[#8a9bb0]">Your builds · sorted by win rate</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.op.gg/champions/${champModal.toLowerCase().replace(/[^a-z0-9]/g, "")}/builds`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8a9bb0] hover:text-[#c89b3c] border border-[#1e2a3a] hover:border-[#c89b3c]/40 rounded px-2 py-1 transition-colors"
                >
                  OP.GG ↗
                </a>
                <button
                  onClick={() => setChampModal(null)}
                  className="text-[#8a9bb0] hover:text-[#e8d5a3] text-xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Build list */}
            <div className="overflow-y-auto p-4 space-y-2">
              {champBuilds === null ? (
                <div className="text-center text-[#8a9bb0] py-10">Loading...</div>
              ) : champBuilds.length === 0 ? (
                <div className="text-center text-[#8a9bb0] py-10">No builds saved for {champModal} yet.</div>
              ) : champBuilds.map(build => (
                <div
                  key={build.id}
                  onClick={() => { setSelectedBuild(build); setChampModal(null); }}
                  className="bg-[#0a0a0f] border border-[#1e2a3a] rounded-lg p-3 cursor-pointer hover:border-[#c89b3c]/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${roleBg[build.role] ?? ""} ${roleColor[build.role] ?? ""}`}>
                      {build.role}
                    </span>
                    {build.winRate != null ? (
                      <span className={`text-sm font-bold ${build.winRate >= 50 ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>
                        {build.winRate}% WR
                      </span>
                    ) : (
                      <span className="text-xs text-[#4a5568]">No win rate</span>
                    )}
                  </div>

                  {build.keystoneRune && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {ddData && keystoneIcon(ddData, build.keystoneRune) && (
                        <img
                          src={keystoneIcon(ddData, build.keystoneRune)!}
                          alt={build.keystoneRune}
                          className="w-5 h-5 rounded-full"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <span className="text-xs text-[#8a9bb0]">{build.keystoneRune}</span>
                      {build.primaryRunePath && <span className="text-xs text-[#4a5568]">· {build.primaryRunePath}</span>}
                    </div>
                  )}

                  {items(build).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {items(build).map((item, i) => {
                        const icon = item && ddData ? itemIcon(ddData, item) : null;
                        return icon ? (
                          <img
                            key={i}
                            src={icon}
                            alt={item ?? ""}
                            title={item ?? ""}
                            className="w-7 h-7 rounded border border-[#1e2a3a]"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <span key={i} className="text-xs bg-[#1e2a3a] text-[#e8d5a3] px-1.5 py-0.5 rounded">{item}</span>
                        );
                      })}
                    </div>
                  )}

                  {build.notes && (
                    <p className="text-xs text-[#8a9bb0] mt-2 line-clamp-1">{build.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Build form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#1e2a3a] flex items-center justify-between sticky top-0 bg-[#0d1117]">
              <h2 className="text-lg font-bold text-[#c89b3c]">
                {editingBuild ? "Edit Build" : "New Build"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingBuild(null); }} className="text-[#8a9bb0] hover:text-[#e8d5a3] text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Champion + Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Champion *</label>
                  <select
                    required
                    value={form.champion}
                    onChange={e => setForm(f => ({ ...f, champion: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    <option value="">Select champion...</option>
                    {championList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Role *</label>
                  <select
                    required
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Summoner Spells */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Summoner Spell 1</label>
                  <select
                    value={form.summonerSpell1}
                    onChange={e => setForm(f => ({ ...f, summonerSpell1: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    {spellList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Summoner Spell 2</label>
                  <select
                    value={form.summonerSpell2}
                    onChange={e => setForm(f => ({ ...f, summonerSpell2: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    {spellList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Runes */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Keystone</label>
                  <select
                    value={form.keystoneRune}
                    onChange={e => setForm(f => ({ ...f, keystoneRune: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    <option value="">Select...</option>
                    {keystoneList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Primary Path</label>
                  <select
                    value={form.primaryRunePath}
                    onChange={e => setForm(f => ({ ...f, primaryRunePath: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    <option value="">Select...</option>
                    {runePathList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Secondary Path</label>
                  <select
                    value={form.secondaryRunePath}
                    onChange={e => setForm(f => ({ ...f, secondaryRunePath: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                  >
                    <option value="">Select...</option>
                    {runePathList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-2">Items (in order)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["item1","item2","item3","item4","item5","item6"] as const).map((key, i) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#1e2a3a] text-[#8a9bb0] text-xs flex items-center justify-center shrink-0">{i+1}</span>
                      <input
                        type="text"
                        list="items-list"
                        placeholder={`Item ${i+1}...`}
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="flex-1 px-2 py-1.5 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-xs text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
                      />
                    </div>
                  ))}
                </div>
                <datalist id="items-list">
                  {itemList.map(item => <option key={item} value={item} />)}
                </datalist>
              </div>

              {/* Starter + Win Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Starter Item</label>
                  <input
                    type="text"
                    list="items-list"
                    placeholder="e.g. Doran's Blade"
                    value={form.starterItem}
                    onChange={e => setForm(f => ({ ...f, starterItem: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Win Rate %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 55"
                    value={form.winRate}
                    onChange={e => setForm(f => ({ ...f, winRate: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Build tips, matchup notes, when to use..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#c89b3c] hover:bg-[#d4a84a] text-black font-bold rounded transition-colors"
                >
                  {editingBuild ? "Save Changes" : "Save Build"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingBuild(null); }}
                  className="px-4 py-2.5 border border-[#1e2a3a] text-[#8a9bb0] hover:text-[#e8d5a3] rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
