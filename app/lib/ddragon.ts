const DDRAGON_VERSION = "15.6.1";
const BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;
const RUNE_BASE = `https://ddragon.leagueoflegends.com/cdn/img`;

// Special-case champion name → Data Dragon key
const CHAMPION_KEY_MAP: Record<string, string> = {
  "Aurelion Sol": "AurelionSol",
  "Bel'Veth": "Belveth",
  "Cho'Gath": "Chogath",
  "Dr. Mundo": "DrMundo",
  "Jarvan IV": "JarvanIV",
  "K'Sante": "KSante",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Kog'Maw": "KogMaw",
  "LeBlanc": "Leblanc",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Nunu & Willump": "Nunu",
  "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Vel'Koz": "Velkoz",
  "Wukong": "MonkeyKing",
  "Xin Zhao": "XinZhao",
};

export function championIcon(name: string): string {
  const key = CHAMPION_KEY_MAP[name] ?? name.replace(/[^a-zA-Z]/g, "");
  return `${BASE}/img/champion/${key}.png`;
}

// Summoner spell display name → Data Dragon spell key
const SPELL_KEY_MAP: Record<string, string> = {
  Flash: "SummonerFlash",
  Ignite: "SummonerDot",
  Exhaust: "SummonerExhaust",
  Teleport: "SummonerTeleport",
  Smite: "SummonerSmite",
  Heal: "SummonerHeal",
  Barrier: "SummonerBarrier",
  Cleanse: "SummonerBoost",
  Ghost: "SummonerHaste",
  Clarity: "SummonerMana",
};

export function spellIcon(name: string): string | null {
  const key = SPELL_KEY_MAP[name];
  return key ? `${BASE}/img/spell/${key}.png` : null;
}

// Item display name → Data Dragon item ID
const ITEM_ID_MAP: Record<string, number> = {
  "Trinity Force": 3078,
  "Blade of the Ruined King": 3153,
  "Kraken Slayer": 6672,
  "Galeforce": 6671,
  "Infinity Edge": 3031,
  "Rabadon's Deathcap": 3089,
  "Luden's Tempest": 6655,
  "Shadowflame": 4645,
  "Rod of Ages": 3001,
  "Riftmaker": 4633,
  "Sunfire Aegis": 3068,
  "Heartsteel": 3441,
  "Jak'Sho, The Protean": 6656,
  "Jak'Sho": 6656,
  "Black Cleaver": 3071,
  "Immortal Shieldbow": 6673,
  "Navori Quickblades": 6695,
  "Eclipse": 6692,
  "Serpent's Fang": 3179,
  "Axiom Arc": 6699,
  "Manamune": 3004,
  "Muramana": 3042,
  "Ravenous Hydra": 3074,
  "Titanic Hydra": 3748,
  "Sterak's Gage": 3053,
  "Death's Dance": 6333,
  "Guardian Angel": 3026,
  "Wit's End": 3091,
  "Frozen Heart": 3110,
  "Randuin's Omen": 3143,
  "Thornmail": 3075,
  "Spirit Visage": 3065,
  "Force of Nature": 4401,
  "Warmog's Armor": 3083,
  "Zhonya's Hourglass": 3157,
  "Banshee's Veil": 3102,
  "Void Staff": 3135,
  "Demonic Embrace": 4637,
  "Cosmic Drive": 4629,
  "Malignance": 4643,
  "Cryptbloom": 6617,
  "Runaan's Hurricane": 3085,
  "Guinsoo's Rageblade": 3124,
  "Youmuu's Ghostblade": 3142,
  "Duskblade of Draktharr": 6691,
  "Edge of Night": 6693,
  "Opportunity": 6694,
  "Hubris": 6696,
  "Sorcerer's Shoes": 3020,
  "Plated Steelcaps": 3047,
  "Mercury's Treads": 3111,
  "Berserker's Greaves": 3006,
  "Boots of Swiftness": 3009,
  "Ionian Boots of Lucidity": 3158,
  "Mobility Boots": 3117,
  "Long Sword": 1036,
  "Doran's Blade": 1055,
  "Doran's Ring": 1056,
  "Doran's Shield": 1054,
  "Dark Seal": 1082,
  "Cull": 1083,
};

export function itemIcon(name: string): string | null {
  const id = ITEM_ID_MAP[name];
  return id ? `${BASE}/img/item/${id}.png` : null;
}

// Keystone rune → Data Dragon perk image path
const KEYSTONE_ICON_MAP: Record<string, string> = {
  "Conqueror": "perk-images/Styles/Precision/Conqueror/Conqueror.png",
  "Lethal Tempo": "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
  "Press the Attack": "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
  "Fleet Footwork": "perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png",
  "Electrocute": "perk-images/Styles/Domination/Electrocute/Electrocute.png",
  "Dark Harvest": "perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png",
  "Hail of Blades": "perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png",
  "Predator": "perk-images/Styles/Domination/Predator/Predator.png",
  "Summon Aery": "perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
  "Arcane Comet": "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
  "Phase Rush": "perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png",
  "Grasp of the Undying": "perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
  "Aftershock": "perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png",
  "Glacial Augment": "perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png",
  "First Strike": "perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png",
};

export function keystoneIcon(name: string): string | null {
  const path = KEYSTONE_ICON_MAP[name];
  return path ? `${RUNE_BASE}/${path}` : null;
}

// Rune path → Data Dragon style icon path
const RUNE_PATH_ICON_MAP: Record<string, string> = {
  "Precision": "perk-images/Styles/7201_Precision.png",
  "Domination": "perk-images/Styles/7200_Domination.png",
  "Sorcery": "perk-images/Styles/7202_Sorcery.png",
  "Resolve": "perk-images/Styles/7204_Resolve.png",
  "Inspiration": "perk-images/Styles/7203_Whimsy.png",
};

export function runePathIcon(name: string): string | null {
  const path = RUNE_PATH_ICON_MAP[name];
  return path ? `${RUNE_BASE}/${path}` : null;
}
