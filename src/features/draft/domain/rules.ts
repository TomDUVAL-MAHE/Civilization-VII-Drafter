import { DATA } from './data';
import type { Age, Attribute, Civ, Leader, Player } from './types';
import { pickRandom, type Rng } from './rng';

export const getLeaderById = (id?: string) => DATA.leaders.find((leader) => leader.id === id);
export const getCivById = (id?: string) => DATA.civs.find((civ) => civ.id === id);

export const playerHasAccess = (player: Player, isDlc: boolean) => !isDlc || player.hasAllDLC || player.ownedDLC.length > 0;

export const filterByForcedAttributes = <T extends { attributes: Attribute[] }>(items: T[], forcedAttributes: Attribute[]) => {
  if (forcedAttributes.length === 0) return items;
  const primary = items.filter((item) => item.attributes.some((attribute) => forcedAttributes.includes(attribute)));
  return primary.length > 0 ? primary : items;
};

export const choosePivotAttributes = (attributes: Attribute[], rng: Rng): Attribute[] => {
  if (attributes.length === 0) return [];
  const first = pickRandom(attributes, rng);
  const rest = attributes.filter((attribute) => attribute !== first);
  if (rest.length === 0 || rng() > 0.6) return [first];
  return [first, pickRandom(rest, rng)];
};

const getAttributeMatches = (candidate: Attribute[], target: Attribute[]) =>
  candidate.filter((attribute) => target.includes(attribute)).length;

export const leaderMatchesStrict = (leader: Leader, civ: Civ) => getAttributeMatches(civ.attributes, leader.attributes) >= Math.min(2, leader.attributes.length);
export const leaderMatchesQuasi = (leader: Leader, civ: Civ) => getAttributeMatches(civ.attributes, leader.attributes) >= 1;

export const hasForcedLeaderSelection = (players: Player[]) => players.every((player) => Boolean(player.selectedLeaderId));
export const getUniqueAttributes = (): Attribute[] => Array.from(new Set([...DATA.leaders.flatMap((l) => l.attributes), ...DATA.civs.flatMap((c) => c.attributes)]));

export const getLeadersForPlayer = (player: Player, bannedLeaderIds: string[]) => DATA.leaders.filter((leader) => !bannedLeaderIds.includes(leader.id) && playerHasAccess(player, leader.dlc));
export const getCivsForPlayer = (player: Player, bannedCivIds: string[], age: Age) => DATA.civs.filter((civ) => civ.age === age && !bannedCivIds.includes(civ.id) && playerHasAccess(player, civ.dlc));

export const listUniqueByName = <T extends { name: string }>(items: T[]) => Array.from(new Map(items.map((item) => [item.name, item])).values());
