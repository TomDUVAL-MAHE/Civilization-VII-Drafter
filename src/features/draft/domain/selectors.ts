import { DATA } from './data';
import { getCivsForPlayer, getLeadersForPlayer, hasForcedLeaderSelection } from './rules';
import type { Age, Civ, DraftState, Leader } from './types';

export const getLeaderPoolForAllPlayers = (state: DraftState): Leader[] =>
  DATA.leaders.filter((leader) => !state.bannedLeaderIds.includes(leader.id) && state.players.every((player) => getLeadersForPlayer(player, state.bannedLeaderIds).some((l) => l.id === leader.id)));

export const getCivPoolForAllPlayersByAge = (state: DraftState): Record<Age, Civ[]> =>
  state.selectedAges.reduce(
    (acc, age) => {
      acc[age] = DATA.civs.filter((civ) => civ.age === age && !state.bannedCivIds.includes(civ.id) && state.players.every((player) => getCivsForPlayer(player, state.bannedCivIds, age).some((entry) => entry.id === civ.id)));
      return acc;
    },
    { Antiquity: [], Exploration: [], Modern: [] } as Record<Age, Civ[]>,
  );

export const leaderMax = (state: DraftState, availableLeaderPool: Leader[]) => {
  if (state.players.length === 0) return 1;
  if (state.canGetDoublonsLeaders) return Math.min(10, availableLeaderPool.length);
  return Math.floor(availableLeaderPool.length / state.players.length);
};

export const civMax = (state: DraftState, byAge: Record<Age, Civ[]>) => {
  if (state.selectedAges.length === 0) return 1;
  const minCount = Math.min(...state.selectedAges.map((age) => byAge[age].length));
  if (state.canGetDoublonsCivs) return Math.min(10, minCount);
  return Math.floor(minCount / state.players.length);
};

export const leaderGenerateDisabled = (state: DraftState, availableLeaderPool: Leader[]) =>
  state.players.length > 6 || state.leadersPerPlayer < 1 || (!state.canGetDoublonsLeaders && availableLeaderPool.length < state.players.length * state.leadersPerPlayer);

export const civGenerateDisabled = (state: DraftState) =>
  state.selectedAges.length === 0 || state.civsPerPlayerPerAge < 1 || ((state.isHomogenousCivWithLeader || state.isQuasiHomogenousCivWithLeader) && !hasForcedLeaderSelection(state.players));
