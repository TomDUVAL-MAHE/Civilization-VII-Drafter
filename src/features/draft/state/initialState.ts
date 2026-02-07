import { createPlayer, createSeed } from '../domain/data';
import type { DraftState } from '../domain/types';

export const initialDraftState: DraftState = {
  selectedAges: ['Antiquity', 'Exploration', 'Modern'],
  seed: createSeed(),
  currentStep: 'leaders',
  players: [createPlayer(1)],
  leadersPerPlayer: 3,
  canGetDoublonsLeaders: false,
  isHomogenousLeaderDraft: false,
  forcedLeaderAttributes: [],
  bannedLeaderIds: [],
  civsPerPlayerPerAge: 2,
  canGetDoublonsCivs: false,
  isHomogenousCivilisationDraft: false,
  isHomogenousCivWithLeader: false,
  isQuasiHomogenousCivWithLeader: false,
  forcedCivAttributes: [],
  bannedCivIds: [],
  statusMessage: '',
  forceLeaderPanel: {},
  forceLeaderQuery: {},
  forceCivPanel: {},
  forceCivQuery: {},
  forceCivAge: {},
  editingPlayerId: null,
  editingPlayerName: '',
};
