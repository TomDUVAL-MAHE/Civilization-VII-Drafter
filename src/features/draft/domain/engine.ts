import { DATA } from './data';
import { createRng, pickRandom, pickUnique } from './rng';
import { choosePivotAttributes, filterByForcedAttributes, getCivById, getCivsForPlayer, getLeaderById, getLeadersForPlayer, hasForcedLeaderSelection, leaderMatchesQuasi, leaderMatchesStrict, playerHasAccess } from './rules';
import type { Age, Attribute, Civ, DraftState, Leader } from './types';

interface EngineResult {
  state: DraftState;
  statusMessage: string;
}

export const generateLeaders = (state: DraftState, attributeOptions: Attribute[]): EngineResult => {
  const availableLeaderPool = DATA.leaders.filter((l) => !state.bannedLeaderIds.includes(l.id));
  if (!state.canGetDoublonsLeaders && availableLeaderPool.length < state.players.length * state.leadersPerPlayer) {
    return { state, statusMessage: 'Not enough leaders to satisfy the no-duplicate rule.' };
  }
  const rng = createRng(state.seed);
  const usedIds = new Set<string>();
  const pivotAttributes = state.isHomogenousLeaderDraft ? choosePivotAttributes(attributeOptions, rng) : [];
  const players = state.players.map((player) => {
    const forcedLeader = getLeaderById(player.forcedLeaderId);
    const base = getLeadersForPlayer(player, state.bannedLeaderIds);
    const pool = filterByForcedAttributes(base, [...state.forcedLeaderAttributes, ...player.forcedAttributes]);
    const pivotPool = pivotAttributes.length > 0 ? pool.filter((l) => l.attributes.some((a) => pivotAttributes.includes(a))) : pool;
    const finalPool = pivotPool.length > 0 ? pivotPool : pool;
    const leaderList: Leader[] = [];
    if (forcedLeader && playerHasAccess(player, forcedLeader.dlc) && !state.bannedLeaderIds.includes(forcedLeader.id)) {
      leaderList.push(forcedLeader);
      usedIds.add(forcedLeader.id);
    }
    const remaining = Math.max(0, state.leadersPerPlayer - leaderList.length);
    if (state.canGetDoublonsLeaders) {
      const bag = [...finalPool];
      while (bag.length > 0 && leaderList.length < state.leadersPerPlayer) {
        const choice = pickRandom(bag, rng);
        leaderList.push(choice);
        bag.splice(bag.indexOf(choice), 1);
      }
    } else {
      leaderList.push(...pickUnique(finalPool, remaining, rng, usedIds));
    }
    return { ...player, draftedLeaders: leaderList, selectedLeaderId: player.forcedLeaderId ?? player.selectedLeaderId };
  });
  return { state: { ...state, players, currentStep: 'civs' }, statusMessage: 'Leaders generated.' };
};

export const generateCivs = (state: DraftState, attributeOptions: Attribute[]): EngineResult => {
  if ((state.isHomogenousCivWithLeader || state.isQuasiHomogenousCivWithLeader) && !hasForcedLeaderSelection(state.players)) {
    return { state, statusMessage: 'Select a leader for every player before matching civilizations.' };
  }
  const rng = createRng(state.seed);
  const usedByAge: Record<Age, Set<string>> = { Antiquity: new Set(), Exploration: new Set(), Modern: new Set() };
  const pivotByAge: Partial<Record<Age, Attribute[]>> = {};
  if (state.isHomogenousCivilisationDraft) state.selectedAges.forEach((age) => { pivotByAge[age] = choosePivotAttributes(attributeOptions, rng); });

  const players = state.players.map((player) => {
    const selectedLeader = getLeaderById(player.selectedLeaderId);
    const draftedByAge = { ...player.draftedCivsByAge };
    const selectedByAge = { ...player.selectedCivByAge };
    state.selectedAges.forEach((age) => {
      const forcedCiv = getCivById(player.forcedCivByAge?.[age]);
      let base = getCivsForPlayer(player, state.bannedCivIds, age);
      if (selectedLeader && state.isHomogenousCivWithLeader) base = base.filter((c) => leaderMatchesStrict(selectedLeader, c));
      if (selectedLeader && state.isQuasiHomogenousCivWithLeader) base = base.filter((c) => leaderMatchesQuasi(selectedLeader, c));
      const pool = filterByForcedAttributes(base, [...state.forcedCivAttributes, ...player.forcedAttributes]);
      const pivotPool = pivotByAge[age]?.length ? pool.filter((c) => c.attributes.some((a) => pivotByAge[age]?.includes(a))) : pool;
      const finalPool = pivotPool.length > 0 ? pivotPool : pool;
      const civList: Civ[] = [];
      if (forcedCiv && playerHasAccess(player, forcedCiv.dlc) && !state.bannedCivIds.includes(forcedCiv.id)) {
        civList.push(forcedCiv);
        usedByAge[age].add(forcedCiv.id);
      }
      const remaining = Math.max(0, state.civsPerPlayerPerAge - civList.length);
      if (state.canGetDoublonsCivs) {
        const bag = [...finalPool];
        while (bag.length > 0 && civList.length < state.civsPerPlayerPerAge) {
          const choice = pickRandom(bag, rng);
          civList.push(choice);
          bag.splice(bag.indexOf(choice), 1);
        }
      } else {
        civList.push(...pickUnique(finalPool, remaining, rng, usedByAge[age]));
      }
      draftedByAge[age] = civList;
      if (forcedCiv?.id) selectedByAge[age] = forcedCiv.id;
    });
    return { ...player, draftedCivsByAge: draftedByAge, selectedCivByAge: selectedByAge };
  });

  return { state: { ...state, players }, statusMessage: 'Civilizations generated.' };
};
