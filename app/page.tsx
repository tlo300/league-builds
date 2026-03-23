"use client";

import { useState, useEffect, useCallback } from "react";
import type { Build } from "@/db/schema";
import { type DDragonData, championIcon, championIconByKey, spellIcon, spellIconById, itemIcon, itemIconById, keystoneIcon, runePathIcon, runeIconById } from "@/app/lib/ddragon";
import type { LinkedAccount } from "@/db/schema";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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

  // Linked accounts
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccountForm, setAddAccountForm] = useState({ riotId: "", region: "EUW1" });
  const [addAccountError, setAddAccountError] = useState("");
  const [addAccountLoading, setAddAccountLoading] = useState(false);
  const [matchModal, setMatchModal] = useState<LinkedAccount | null>(null);
  const [matches, setMatches] = useState<MatchSummary[] | null>(null);
  const [rankData, setRankData] = useState<RankEntry[] | null>(null);
  const [rankHistory, setRankHistory] = useState<Record<string, HistoryPoint[]> | null>(null);
  const [historyQueue, setHistoryQueue] = useState<"RANKED_SOLO_5x5" | "RANKED_FLEX_SR">("RANKED_SOLO_5x5");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchDetail, setMatchDetail] = useState<MatchDetailData | null>(null);

  type MatchParticipant = {
    puuid: string;
    isCurrentUser: boolean;
    riotIdGameName: string;
    riotIdTagline: string;
    championName: string;
    position: string;
    level: number;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    goldEarned: number;
    totalDamageDealt: number;
    visionScore: number;
    items: number[];
    spell1Id: number;
    spell2Id: number;
    keystoneId: number;
    primaryPathId: number;
    secondaryPathId: number;
    teamId: number;
    win: boolean;
    doubleKills: number;
    tripleKills: number;
    quadraKills: number;
    pentaKills: number;
    largestKillingSpree: number;
    firstBloodKill: boolean;
  };

  type MatchDetailData = {
    matchId: string;
    queueName: string;
    gameDuration: number;
    gameCreation: number;
    teams: Array<{
      teamId: number;
      win: boolean;
      objectives: { baron: number; dragon: number; tower: number; riftHerald: number };
      participants: MatchParticipant[];
    }>;
  };

  type RankEntry = {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  };

  type HistoryPoint = {
    date: string;
    lpTotal: number;
    tier: string;
    rank: string;
    lp: number;
  };

  type MatchSummary = {
    matchId: string;
    championName: string;
    position: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    items: number[];
    spell1Id: number;
    spell2Id: number;
    queueName: string;
    gameDuration: number;
    gameCreation: number;
  };

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAccountError("");
    setAddAccountLoading(true);
    const parts = addAccountForm.riotId.split("#");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setAddAccountError("Format: Name#Tag  (e.g. Faker#KR1)");
      setAddAccountLoading(false);
      return;
    }
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameName: parts[0].trim(), tagLine: parts[1].trim(), region: addAccountForm.region }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddAccountError(data.error ?? "Failed to add account");
      setAddAccountLoading(false);
      return;
    }
    setShowAddAccount(false);
    setAddAccountForm({ riotId: "", region: "EUW1" });
    fetchAccounts();
    setAddAccountLoading(false);
  };

  const handleRemoveAccount = async (id: number) => {
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
    if (matchModal?.id === id) setMatchModal(null);
  };

  const openMatchHistory = useCallback(async (account: LinkedAccount) => {
    setMatchModal(account);
    setMatches(null);
    setRankData(null);
    setRankHistory(null);
    const [matchRes, rankRes] = await Promise.all([
      fetch(`/api/accounts/${account.id}/matches`),
      fetch(`/api/accounts/${account.id}/rank`),
    ]);
    const [matchJson, rankJson] = await Promise.all([matchRes.json(), rankRes.json()]);
    setMatches(Array.isArray(matchJson) ? matchJson : []);
    setRankData(Array.isArray(rankJson) ? rankJson : []);
    // Fetch history after rank is saved (rank route saves today's snapshot first)
    const histRes = await fetch(`/api/accounts/${account.id}/rank-history`);
    const histJson = await histRes.json();
    setRankHistory(typeof histJson === "object" && !Array.isArray(histJson) ? histJson : {});
  }, []);

  const openMatchDetail = useCallback(async (matchId: string) => {
    if (!matchModal) return;
    setSelectedMatch(matchId);
    setMatchDetail(null);
    const res = await fetch(`/api/accounts/${matchModal.id}/matches/${matchId}`);
    const data = await res.json();
    if (res.ok) setMatchDetail(data);
  }, [matchModal]);

  const REGIONS = [
    { value: "EUW1", label: "EUW" }, { value: "EUN1", label: "EUNE" },
    { value: "NA1", label: "NA" }, { value: "KR", label: "KR" },
    { value: "BR1", label: "BR" }, { value: "JP1", label: "JP" },
    { value: "OC1", label: "OCE" }, { value: "TR1", label: "TR" },
    { value: "RU", label: "RU" }, { value: "LA1", label: "LAN" },
    { value: "LA2", label: "LAS" },
  ];

  const fmtDuration = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });

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
          {/* Linked accounts bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-[#8a9bb0] uppercase tracking-wider shrink-0">Accounts</span>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => openMatchHistory(acc)}
                className="group flex items-center gap-1.5 px-3 py-1 bg-[#0d1117] border border-[#1e2a3a] rounded-full text-xs text-[#e8d5a3] hover:border-[#c89b3c]/50 transition-colors"
              >
                {ddData && (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${ddData.version}/img/profileicon/29.png`}
                    className="w-4 h-4 rounded-full opacity-60"
                    alt=""
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <span className="font-medium">{acc.gameName}</span>
                <span className="text-[#4a5568]">#{acc.tagLine}</span>
                <span className={`text-[0.65rem] px-1 rounded ${acc.region === "KR" ? "text-[#4a9ecf]" : acc.region.startsWith("EU") ? "text-[#9e4acf]" : "text-[#4a9e4a]"}`}>
                  {acc.region.replace(/[0-9]/g, "")}
                </span>
                <span
                  onClick={e => { e.stopPropagation(); handleRemoveAccount(acc.id); }}
                  className="text-[#4a5568] hover:text-[#c84b31] ml-0.5 cursor-pointer leading-none"
                  title="Remove"
                >×</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddAccount(true)}
              className="px-3 py-1 bg-[#0d1117] border border-dashed border-[#1e2a3a] rounded-full text-xs text-[#8a9bb0] hover:text-[#c89b3c] hover:border-[#c89b3c]/40 transition-colors"
            >
              + Add Account
            </button>
          </div>

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

      {/* Add account modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b border-[#1e2a3a] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#c89b3c]">Link Account</h2>
              <button onClick={() => { setShowAddAccount(false); setAddAccountError(""); }} className="text-[#8a9bb0] hover:text-[#e8d5a3] text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddAccount} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Riot ID</label>
                <input
                  type="text"
                  placeholder="PlayerName#EUW"
                  value={addAccountForm.riotId}
                  onChange={e => setAddAccountForm(f => ({ ...f, riotId: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] placeholder-[#4a5568] focus:outline-none focus:border-[#c89b3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#8a9bb0] uppercase tracking-wider mb-1">Region</label>
                <select
                  value={addAccountForm.region}
                  onChange={e => setAddAccountForm(f => ({ ...f, region: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e2a3a] rounded text-sm text-[#e8d5a3] focus:outline-none focus:border-[#c89b3c]"
                >
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {addAccountError && <p className="text-xs text-[#c84b31]">{addAccountError}</p>}
              <button
                type="submit"
                disabled={addAccountLoading}
                className="w-full py-2 bg-[#c89b3c] hover:bg-[#d4a84a] disabled:opacity-50 text-black font-bold rounded transition-colors"
              >
                {addAccountLoading ? "Looking up..." : "Link Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Match history modal */}
      {matchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#1e2a3a] flex items-center gap-3 shrink-0">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#c89b3c]">{matchModal.gameName}<span className="text-[#4a5568] font-normal">#{matchModal.tagLine}</span></h2>
                <p className="text-xs text-[#8a9bb0]">{matchModal.region.replace(/[0-9]/g, "")} · Last 10 games</p>
              </div>
              <button onClick={() => setMatchModal(null)} className="text-[#8a9bb0] hover:text-[#e8d5a3] text-xl">&times;</button>
            </div>

            {/* Rank panel */}
            <div className="px-5 py-4 border-b border-[#1e2a3a] shrink-0">
              {rankData === null ? (
                <div className="text-xs text-[#4a5568] animate-pulse">Loading rank...</div>
              ) : rankData.length === 0 ? (
                <div className="text-xs text-[#4a5568]">Unranked this season</div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {rankData.map((entry) => {
                    const tierCap = entry.tier.charAt(0) + entry.tier.slice(1).toLowerCase();
                    const emblemUrl = `https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_${tierCap}.png`;
                    const wr = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                    const queueLabel = entry.queueType === "RANKED_SOLO_5x5" ? "Ranked Solo/Duo" : "Ranked Flex";
                    return (
                      <div key={entry.queueType} className="flex items-center gap-3 flex-1 min-w-52 bg-[#0a0a0f] border border-[#1e2a3a] rounded-lg px-4 py-3">
                        <img
                          src={emblemUrl}
                          alt={tierCap}
                          className="w-14 h-14 object-contain shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.65rem] text-[#8a9bb0] uppercase tracking-wider mb-0.5">{queueLabel}</div>
                          <div className="text-base font-bold text-[#e8d5a3]">{tierCap} {entry.rank}</div>
                          <div className="text-sm text-[#c89b3c]">{entry.leaguePoints} LP</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-[#8a9bb0]">{entry.wins}W {entry.losses}L</div>
                          <div className={`text-sm font-bold ${wr >= 50 ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>{wr}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LP History chart */}
            {rankHistory !== null && Object.keys(rankHistory).length > 0 && (() => {
              const queues = Object.keys(rankHistory) as ("RANKED_SOLO_5x5" | "RANKED_FLEX_SR")[];
              const activeQueue = queues.includes(historyQueue) ? historyQueue : queues[0];
              const points = rankHistory[activeQueue] ?? [];
              const TIER_ORDER = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
              const tierLabel = (lpTotal: number) => {
                const tierIdx = Math.min(Math.floor(lpTotal / 400), TIER_ORDER.length - 1);
                const tier = TIER_ORDER[tierIdx];
                if (tierIdx >= 7) return tier.charAt(0);
                const div = ["IV","III","II","I"][Math.floor((lpTotal % 400) / 100)] ?? "I";
                return `${tier.charAt(0)} ${div}`;
              };
              const tickValues = Array.from(new Set(points.map(p => Math.floor(p.lpTotal / 400) * 400))).flatMap(base => [base, base + 100, base + 200, base + 300]);
              return (
                <div className="px-5 pt-4 pb-2 border-b border-[#1e2a3a] shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#8a9bb0] uppercase tracking-wider">LP History</span>
                    {queues.length > 1 && (
                      <div className="flex gap-1">
                        {queues.map(q => (
                          <button
                            key={q}
                            onClick={() => setHistoryQueue(q)}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${activeQueue === q ? "bg-[#c89b3c] border-[#c89b3c] text-black font-semibold" : "border-[#1e2a3a] text-[#8a9bb0] hover:border-[#c89b3c]/40"}`}
                          >
                            {q === "RANKED_SOLO_5x5" ? "Solo" : "Flex"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {points.length < 2 ? (
                    <div className="text-xs text-[#4a5568] py-2">Open again tomorrow to start building history.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={points} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={["auto", "auto"]} />
                        {tickValues.map(v => (
                          <ReferenceLine key={v} y={v} stroke="#1e2a3a" strokeDasharray="3 3" />
                        ))}
                        <Tooltip
                          cursor={{ stroke: "#c89b3c", strokeWidth: 1, strokeDasharray: "4 4" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const p = payload[0].payload as HistoryPoint;
                            const tierCap = p.tier.charAt(0) + p.tier.slice(1).toLowerCase();
                            return (
                              <div className="bg-[#0d1117] border border-[#1e2a3a] rounded px-2 py-1 text-xs">
                                <div className="font-bold text-[#e8d5a3]">{tierCap} {p.rank}</div>
                                <div className="text-[#c89b3c]">{p.lp} LP</div>
                              </div>
                            );
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="lpTotal"
                          stroke="#c89b3c"
                          strokeWidth={2}
                          dot={{ fill: "#c89b3c", r: 3, strokeWidth: 0 }}
                          activeDot={{ fill: "#e8d5a3", r: 4, strokeWidth: 0 }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={(props: any) => {
                            const { x, y, value, index } = props;
                            if (index !== 0 && index !== points.length - 1) return null;
                            const p = points[index];
                            return (
                              <text x={x} y={Number(y) - 10} fill="#8a9bb0" fontSize={10} textAnchor="middle">
                                {tierLabel(Number(value))} {p.lp}LP
                              </text>
                            );
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              );
            })()}

            <div className="overflow-y-auto divide-y divide-[#1e2a3a]">
              {matches === null ? (
                <div className="text-center text-[#8a9bb0] py-12">Loading matches...</div>
              ) : matches.length === 0 ? (
                <div className="text-center text-[#8a9bb0] py-12">No recent matches found.</div>
              ) : matches.map((m) => (
                <div
                  key={m.matchId}
                  onClick={() => openMatchDetail(m.matchId)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#0a0a0f] transition-colors ${m.win ? "border-l-2 border-[#4a9e4a]" : "border-l-2 border-[#c84b31]"}`}
                >
                  {/* Champion */}
                  <div className="relative shrink-0">
                    {ddData ? (
                      <img
                        src={championIconByKey(ddData, m.championName)}
                        alt={m.championName}
                        className="w-12 h-12 rounded-lg border border-[#1e2a3a]"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : <div className="w-12 h-12 rounded-lg bg-[#1e2a3a]" />}
                  </div>

                  {/* Spells */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {[m.spell1Id, m.spell2Id].map((sid, i) => {
                      const icon = ddData ? spellIconById(ddData, sid) : null;
                      return icon ? (
                        <img key={i} src={icon} alt="" className="w-5 h-5 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : <div key={i} className="w-5 h-5 rounded bg-[#1e2a3a]" />;
                    })}
                  </div>

                  {/* Game info */}
                  <div className="w-24 shrink-0">
                    <div className={`text-xs font-bold ${m.win ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>{m.win ? "Victory" : "Defeat"}</div>
                    <div className="text-xs text-[#8a9bb0]">{m.queueName}</div>
                    {m.position && <div className="text-xs text-[#4a5568]">{m.position}</div>}
                  </div>

                  {/* KDA */}
                  <div className="w-20 shrink-0 text-center">
                    <div className="text-sm font-medium text-[#e8d5a3]">{m.kills}/{m.deaths}/{m.assists}</div>
                    <div className="text-xs text-[#8a9bb0]">
                      {m.deaths === 0 ? "Perfect" : ((m.kills + m.assists) / m.deaths).toFixed(1)} KDA
                    </div>
                    <div className="text-xs text-[#4a5568]">{m.cs} CS</div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-1 flex-1">
                    {m.items.map((id, i) => {
                      const icon = ddData ? itemIconById(ddData, id) : null;
                      return icon ? (
                        <img key={i} src={icon} alt="" className="w-7 h-7 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : null;
                    })}
                  </div>

                  {/* Time */}
                  <div className="text-right shrink-0 text-xs text-[#4a5568]">
                    <div>{fmtDuration(m.gameDuration)}</div>
                    <div>{fmtDate(m.gameCreation)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Match detail modal */}
      {selectedMatch !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#1e2a3a] flex items-center gap-3 shrink-0">
              {matchDetail ? (
                <>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#e8d5a3]">{matchDetail.queueName}</span>
                    <span className="text-[#4a5568] mx-2">·</span>
                    <span className="text-sm text-[#8a9bb0]">{fmtDuration(matchDetail.gameDuration)}</span>
                    <span className="text-[#4a5568] mx-2">·</span>
                    <span className="text-xs text-[#4a5568]">{fmtDate(matchDetail.gameCreation)}</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 text-sm text-[#8a9bb0] animate-pulse">Loading match...</div>
              )}
              <button onClick={() => { setSelectedMatch(null); setMatchDetail(null); }} className="text-[#8a9bb0] hover:text-[#e8d5a3] text-xl shrink-0">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1">
              {!matchDetail ? (
                <div className="text-center text-[#8a9bb0] py-16">Loading match details...</div>
              ) : (() => {
                const allParticipants = matchDetail.teams.flatMap(t => t.participants);
                const me = allParticipants.find(p => p.isCurrentUser);
                const maxDmg = Math.max(...allParticipants.map(p => p.totalDamageDealt), 1);

                const multiKillBadge = (p: MatchParticipant) => {
                  if (p.pentaKills > 0) return <span className="text-xs font-bold bg-[#c89b3c] text-black px-1.5 py-0.5 rounded ml-1">PENTA</span>;
                  if (p.quadraKills > 0) return <span className="text-xs font-bold bg-[#9e4acf] text-white px-1.5 py-0.5 rounded ml-1">QUADRA</span>;
                  if (p.tripleKills > 0) return <span className="text-xs font-bold bg-[#4a9ecf] text-white px-1.5 py-0.5 rounded ml-1">TRIPLE</span>;
                  if (p.doubleKills > 0) return <span className="text-xs font-bold bg-[#4a9e4a] text-white px-1.5 py-0.5 rounded ml-1">DOUBLE</span>;
                  return null;
                };

                return (
                  <>
                    {/* Hero card */}
                    {me && (
                      <div className={`px-5 py-4 border-b border-[#1e2a3a] ${me.win ? "bg-[#4a9e4a]/5" : "bg-[#c84b31]/5"}`}>
                        <div className="flex items-center gap-4">
                          {/* Champion portrait */}
                          <div className="relative shrink-0">
                            {ddData && (
                              <img
                                src={championIconByKey(ddData, me.championName)}
                                alt={me.championName}
                                className="w-20 h-20 rounded-xl border-2 border-[#c89b3c]/60"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-[#0a0a0f] border border-[#1e2a3a] text-[#8a9bb0] text-[0.6rem] font-bold px-1 rounded">{me.level}</span>
                          </div>

                          {/* Spells + Runes */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <div className="flex gap-1">
                              {[me.spell1Id, me.spell2Id].map((sid, i) => {
                                const icon = ddData ? spellIconById(ddData, sid) : null;
                                return icon ? <img key={i} src={icon} alt="" className="w-7 h-7 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div key={i} className="w-7 h-7 rounded bg-[#1e2a3a]" />;
                              })}
                            </div>
                            <div className="flex gap-1">
                              {[me.keystoneId, me.primaryPathId].map((rid, i) => {
                                const icon = ddData ? runeIconById(ddData, rid) : null;
                                return icon ? <img key={i} src={icon} alt="" className={`w-7 h-7 ${i === 0 ? "rounded-full border border-[#c89b3c]/40" : "rounded"}`} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div key={i} className="w-7 h-7 rounded bg-[#1e2a3a]" />;
                              })}
                            </div>
                          </div>

                          {/* Name + KDA */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-base font-bold ${me.win ? "text-[#4a9e4a]" : "text-[#c84b31]"}`}>{me.win ? "Victory" : "Defeat"}</span>
                              {multiKillBadge(me)}
                              {me.firstBloodKill && <span className="text-xs font-bold bg-[#c84b31]/20 text-[#c84b31] border border-[#c84b31]/40 px-1.5 py-0.5 rounded ml-1">First Blood</span>}
                            </div>
                            <div className="text-3xl font-bold text-[#e8d5a3] tabular-nums">
                              {me.kills} / <span className="text-[#c84b31]">{me.deaths}</span> / {me.assists}
                            </div>
                            <div className="text-xs text-[#8a9bb0] mt-0.5">
                              {me.deaths === 0 ? "Perfect KDA" : `${((me.kills + me.assists) / me.deaths).toFixed(2)} KDA`}
                              {me.position && <span className="ml-2">· {me.position}</span>}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-center shrink-0">
                            <div><div className="text-sm font-bold text-[#e8d5a3]">{me.cs}</div><div className="text-[0.65rem] text-[#4a5568] uppercase tracking-wider">CS</div></div>
                            <div><div className="text-sm font-bold text-[#e8d5a3]">{(me.goldEarned / 1000).toFixed(1)}k</div><div className="text-[0.65rem] text-[#4a5568] uppercase tracking-wider">Gold</div></div>
                            <div><div className="text-sm font-bold text-[#e8d5a3]">{me.visionScore}</div><div className="text-[0.65rem] text-[#4a5568] uppercase tracking-wider">Vision</div></div>
                            <div className="col-span-3"><div className="text-sm font-bold text-[#e8d5a3]">{(me.totalDamageDealt / 1000).toFixed(1)}k</div><div className="text-[0.65rem] text-[#4a5568] uppercase tracking-wider">Damage</div></div>
                          </div>

                          {/* Items */}
                          <div className="flex flex-wrap gap-1 max-w-[168px] shrink-0">
                            {me.items.map((id, i) => {
                              const icon = ddData ? itemIconById(ddData, id) : null;
                              return icon ? <img key={i} src={icon} alt="" className="w-9 h-9 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div key={i} className={`w-9 h-9 rounded ${id > 0 ? "bg-[#1e2a3a]" : ""}`} />;
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team scoreboards */}
                    {matchDetail.teams.map((team) => {
                      const teamDmgMax = Math.max(...team.participants.map(p => p.totalDamageDealt), 1);
                      return (
                        <div key={team.teamId} className="border-b border-[#1e2a3a] last:border-0">
                          {/* Team header */}
                          <div className={`flex items-center gap-3 px-5 py-2 text-xs font-semibold uppercase tracking-wider ${team.win ? "text-[#4a9e4a] bg-[#4a9e4a]/5" : "text-[#c84b31] bg-[#c84b31]/5"}`}>
                            <span>{team.win ? "Victory" : "Defeat"}</span>
                            <span className="text-[#4a5568] font-normal normal-case tracking-normal">{team.teamId === 100 ? "Blue Team" : "Red Team"}</span>
                            <div className="flex items-center gap-3 ml-auto text-[#4a5568] font-normal normal-case tracking-normal">
                              {team.objectives.baron > 0 && <span>Baron ×{team.objectives.baron}</span>}
                              {team.objectives.dragon > 0 && <span>Dragon ×{team.objectives.dragon}</span>}
                              {team.objectives.riftHerald > 0 && <span>Herald ×{team.objectives.riftHerald}</span>}
                              <span>Towers ×{team.objectives.tower}</span>
                            </div>
                          </div>

                          {/* Column headers */}
                          <div className="flex items-center gap-2 px-5 py-1 text-[0.6rem] text-[#4a5568] uppercase tracking-wider border-b border-[#1e2a3a]/50">
                            <div className="w-8 shrink-0" />
                            <div className="w-28 shrink-0">Player</div>
                            <div className="flex gap-0.5 w-16 shrink-0" />
                            <div className="w-16 shrink-0 text-center">KDA</div>
                            <div className="w-9 shrink-0 text-center">CS</div>
                            <div className="w-10 shrink-0 text-center">Gold</div>
                            <div className="w-8 shrink-0 text-center">Vis</div>
                            <div className="flex gap-0.5 shrink-0">Items</div>
                            <div className="flex-1 text-right">Damage</div>
                          </div>

                          {/* Participant rows */}
                          {team.participants.map((p) => (
                            <div
                              key={p.puuid}
                              className={`flex items-center gap-2 px-5 py-2 text-xs border-b border-[#1e2a3a]/30 last:border-0 ${p.isCurrentUser ? "bg-[#c89b3c]/5 border-l-2 border-l-[#c89b3c]" : ""}`}
                            >
                              {/* Champion icon */}
                              <div className="relative w-8 shrink-0">
                                {ddData && (
                                  <img
                                    src={championIconByKey(ddData, p.championName)}
                                    alt={p.championName}
                                    className="w-8 h-8 rounded border border-[#1e2a3a]"
                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                )}
                                <span className="absolute -bottom-0.5 -right-0.5 bg-[#0a0a0f] text-[#4a5568] text-[0.5rem] font-bold px-0.5 rounded leading-tight">{p.level}</span>
                              </div>

                              {/* Name */}
                              <div className="w-28 shrink-0 min-w-0">
                                <div className={`truncate font-medium ${p.isCurrentUser ? "text-[#c89b3c]" : "text-[#e8d5a3]"}`}>
                                  {p.riotIdGameName || p.championName}
                                  {multiKillBadge(p)}
                                </div>
                                <div className="text-[#4a5568] truncate">{p.position}</div>
                              </div>

                              {/* Spells + Keystone */}
                              <div className="flex gap-0.5 w-16 shrink-0">
                                <div className="flex flex-col gap-0.5">
                                  {[p.spell1Id, p.spell2Id].map((sid, i) => {
                                    const icon = ddData ? spellIconById(ddData, sid) : null;
                                    return icon ? <img key={i} src={icon} alt="" className="w-5 h-5 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div key={i} className="w-5 h-5 rounded bg-[#1e2a3a]" />;
                                  })}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  {[p.keystoneId, p.primaryPathId].map((rid, i) => {
                                    const icon = ddData ? runeIconById(ddData, rid) : null;
                                    return icon ? <img key={i} src={icon} alt="" className={`w-5 h-5 ${i === 0 ? "rounded-full" : "rounded"}`} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div key={i} className="w-5 h-5 rounded bg-[#1e2a3a]" />;
                                  })}
                                </div>
                              </div>

                              {/* KDA */}
                              <div className="w-16 shrink-0 text-center">
                                <div className="font-medium text-[#e8d5a3] tabular-nums">{p.kills}/<span className="text-[#c84b31]">{p.deaths}</span>/{p.assists}</div>
                                <div className="text-[#4a5568]">{p.deaths === 0 ? "Perf" : ((p.kills + p.assists) / p.deaths).toFixed(1)}</div>
                              </div>

                              {/* CS */}
                              <div className="w-9 shrink-0 text-center text-[#8a9bb0] tabular-nums">{p.cs}</div>

                              {/* Gold */}
                              <div className="w-10 shrink-0 text-center text-[#c89b3c] tabular-nums">{(p.goldEarned / 1000).toFixed(1)}k</div>

                              {/* Vision */}
                              <div className="w-8 shrink-0 text-center text-[#8a9bb0] tabular-nums">{p.visionScore}</div>

                              {/* Items */}
                              <div className="flex gap-0.5 shrink-0">
                                {p.items.map((id, i) => {
                                  const icon = ddData ? itemIconById(ddData, id) : null;
                                  return icon
                                    ? <img key={i} src={icon} alt="" className="w-6 h-6 rounded border border-[#1e2a3a]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    : <div key={i} className={`w-6 h-6 rounded ${id > 0 ? "bg-[#1e2a3a]" : "border border-[#1e2a3a]/20"}`} />;
                                })}
                              </div>

                              {/* Damage bar */}
                              <div className="flex-1 text-right">
                                <div className="text-[#8a9bb0] tabular-nums mb-0.5">{(p.totalDamageDealt / 1000).toFixed(1)}k</div>
                                <div className="h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${p.win ? "bg-[#4a9e4a]" : "bg-[#c84b31]"}`}
                                    style={{ width: `${(p.totalDamageDealt / teamDmgMax) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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
