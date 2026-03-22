import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const builds = pgTable("builds", {
  id: serial("id").primaryKey(),
  champion: text("champion").notNull(),
  role: text("role").notNull(),          // Top, Jungle, Mid, Bot, Support
  keystoneRune: text("keystone_rune"),
  primaryRunePath: text("primary_rune_path"),
  secondaryRunePath: text("secondary_rune_path"),
  summonerSpell1: text("summoner_spell_1"),
  summonerSpell2: text("summoner_spell_2"),
  item1: text("item_1"),
  item2: text("item_2"),
  item3: text("item_3"),
  item4: text("item_4"),
  item5: text("item_5"),
  item6: text("item_6"),
  starterItem: text("starter_item"),
  notes: text("notes"),
  winRate: integer("win_rate"),          // optional manual win rate (0-100)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Build = typeof builds.$inferSelect;
export type NewBuild = typeof builds.$inferInsert;
