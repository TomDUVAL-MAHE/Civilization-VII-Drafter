'use client';

import { useMemo, useReducer } from 'react';
import { DATA, createSeed } from '../domain/data';
import { generateCivs, generateLeaders } from '../domain/engine';
import { getCivById, getLeaderById, getUniqueAttributes, hasForcedLeaderSelection, listUniqueByName } from '../domain/rules';
import { civGenerateDisabled, civMax, getCivPoolForAllPlayersByAge, getLeaderPoolForAllPlayers, leaderGenerateDisabled, leaderMax } from '../domain/selectors';
import type { Age, Attribute, Player } from '../domain/types';
import { initialDraftState } from '../state/initialState';
import { draftReducer } from '../state/reducer';

export interface DraftControllerDerived {
  attributeOptions: Attribute[];
  leaderNameOptions: string[];
  civNameOptions: string[];
  leaderMax: number;
  civMax: number;
  isLeaderGenerateDisabled: boolean;
  isCivGenerateDisabled: boolean;
  hasForcedLeaderSelection: boolean;
}

export interface DraftControllerActions {
  setStep: (step: typeof initialDraftState.currentStep) => void;
  toggleAge: (age: Age) => void;
  setSeed: (seed: string) => void;
  rerollSeed: () => void;
  copySeed: () => Promise<void>;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, update: Partial<Player>) => void;
  startEditName: (player: Player) => void;
  setEditName: (value: string) => void;
  commitName: (player: Player) => void;
  cancelName: () => void;
  setLeadersPerPlayer: (value: number) => void;
  setCivsPerPlayerPerAge: (value: number) => void;
  toggleFlag: (key: "canGetDoublonsLeaders" | "isHomogenousLeaderDraft" | "canGetDoublonsCivs" | "isHomogenousCivilisationDraft" | "isHomogenousCivWithLeader" | "isQuasiHomogenousCivWithLeader") => void;
  setForcedLeaderAttributes: (values: Attribute[]) => void;
  setForcedCivAttributes: (values: Attribute[]) => void;
  setBannedLeaders: (values: string[]) => void;
  setBannedCivs: (values: string[]) => void;
  toggleLeaderPanel: (id: string) => void;
  setLeaderQuery: (id: string, value: string) => void;
  toggleCivPanel: (id: string) => void;
  setCivQuery: (id: string, value: string) => void;
  setForceCivAge: (id: string, age: Age) => void;
  generateLeaders: () => void;
  generateCivs: () => void;
  getLeaderById: typeof getLeaderById;
  getCivById: typeof getCivById;
}

export const useDraftController = () => {
  const [state, dispatch] = useReducer(draftReducer, initialDraftState);
  const attributeOptions = useMemo(() => getUniqueAttributes(), []);
  const leaderPool = useMemo(() => getLeaderPoolForAllPlayers(state), [state]);
  const civPoolByAge = useMemo(() => getCivPoolForAllPlayersByAge(state), [state]);

  const derived: DraftControllerDerived = {
    attributeOptions,
    leaderNameOptions: listUniqueByName(DATA.leaders).map((l) => l.name),
    civNameOptions: listUniqueByName(DATA.civs).map((c) => c.name),
    leaderMax: leaderMax(state, leaderPool),
    civMax: civMax(state, civPoolByAge),
    isLeaderGenerateDisabled: leaderGenerateDisabled(state, leaderPool),
    isCivGenerateDisabled: civGenerateDisabled(state),
    hasForcedLeaderSelection: hasForcedLeaderSelection(state.players),
  };

  const actions: DraftControllerActions = {
    setStep: (step: typeof state.currentStep) => dispatch({ type: 'set_step', payload: step }),
    toggleAge: (age: Age) => dispatch({ type: 'toggle_age', payload: age }),
    setSeed: (seed: string) => dispatch({ type: 'set_seed', payload: seed }),
    rerollSeed: () => dispatch({ type: 'set_seed', payload: createSeed() }),
    copySeed: async () => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) return dispatch({ type: 'set_status', payload: 'Clipboard unavailable in this environment.' });
      try { await navigator.clipboard.writeText(state.seed); dispatch({ type: 'set_status', payload: 'Seed copied.' }); }
      catch { dispatch({ type: 'set_status', payload: 'Unable to copy seed.' }); }
    },
    addPlayer: () => dispatch({ type: 'add_player' }),
    removePlayer: (id: string) => {
      if (state.players.length <= 1) return;
      if (!window.confirm('Remove this player?')) return;
      dispatch({ type: 'remove_player', payload: id });
    },
    updatePlayer: (id: string, update: Partial<Player>) => dispatch({ type: 'update_player', payload: { id, update } }),
    startEditName: (player: Player) => dispatch({ type: 'start_edit_name', payload: { id: player.id, name: player.name } }),
    setEditName: (value: string) => dispatch({ type: 'set_edit_name', payload: value }),
    commitName: (player: Player) => {
      if (state.editingPlayerId !== player.id) return;
      dispatch({ type: 'update_player', payload: { id: player.id, update: { name: state.editingPlayerName.trim() || player.name } } });
      dispatch({ type: 'stop_edit_name' });
    },
    cancelName: () => dispatch({ type: 'stop_edit_name' }),
    setLeadersPerPlayer: (value: number) => dispatch({ type: 'set_leaders_per_player', payload: value }),
    setCivsPerPlayerPerAge: (value: number) => dispatch({ type: 'set_civs_per_player', payload: value }),
    toggleFlag: (key: 'canGetDoublonsLeaders' | 'isHomogenousLeaderDraft' | 'canGetDoublonsCivs' | 'isHomogenousCivilisationDraft' | 'isHomogenousCivWithLeader' | 'isQuasiHomogenousCivWithLeader') => dispatch({ type: 'toggle_flag', payload: key }),
    setForcedLeaderAttributes: (values: Attribute[]) => dispatch({ type: 'set_attributes', payload: { key: 'forcedLeaderAttributes', values } }),
    setForcedCivAttributes: (values: Attribute[]) => dispatch({ type: 'set_attributes', payload: { key: 'forcedCivAttributes', values } }),
    setBannedLeaders: (values: string[]) => dispatch({ type: 'set_ids', payload: { key: 'bannedLeaderIds', values } }),
    setBannedCivs: (values: string[]) => dispatch({ type: 'set_ids', payload: { key: 'bannedCivIds', values } }),
    toggleLeaderPanel: (id: string) => dispatch({ type: 'toggle_panel', payload: { key: 'forceLeaderPanel', id } }),
    setLeaderQuery: (id: string, value: string) => dispatch({ type: 'set_query', payload: { key: 'forceLeaderQuery', id, value } }),
    toggleCivPanel: (id: string) => dispatch({ type: 'toggle_panel', payload: { key: 'forceCivPanel', id } }),
    setCivQuery: (id: string, value: string) => dispatch({ type: 'set_query', payload: { key: 'forceCivQuery', id, value } }),
    setForceCivAge: (id: string, age: Age) => dispatch({ type: 'set_force_civ_age', payload: { id, age } }),
    generateLeaders: () => {
      const result = generateLeaders(state, attributeOptions);
      dispatch({ type: 'apply_generated', payload: { state: result.state, message: result.statusMessage } });
    },
    generateCivs: () => {
      const result = generateCivs(state, attributeOptions);
      dispatch({ type: 'apply_generated', payload: { state: result.state, message: result.statusMessage } });
    },
    getLeaderById,
    getCivById,
  };

  return { state, derived, actions };
};
