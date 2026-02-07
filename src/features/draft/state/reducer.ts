import { createPlayer } from '../domain/data';
import type { Age, Attribute, DraftState, DraftStep, Player } from '../domain/types';

export type DraftAction =
  | { type: 'set_status'; payload: string }
  | { type: 'set_seed'; payload: string }
  | { type: 'set_step'; payload: DraftStep }
  | { type: 'toggle_age'; payload: Age }
  | { type: 'add_player' }
  | { type: 'remove_player'; payload: string }
  | { type: 'update_player'; payload: { id: string; update: Partial<Player> } }
  | { type: 'start_edit_name'; payload: { id: string; name: string } }
  | { type: 'set_edit_name'; payload: string }
  | { type: 'stop_edit_name' }
  | { type: 'set_leaders_per_player'; payload: number }
  | { type: 'set_civs_per_player'; payload: number }
  | { type: 'toggle_flag'; payload: keyof Pick<DraftState, 'canGetDoublonsLeaders' | 'isHomogenousLeaderDraft' | 'canGetDoublonsCivs' | 'isHomogenousCivilisationDraft' | 'isHomogenousCivWithLeader' | 'isQuasiHomogenousCivWithLeader'> }
  | { type: 'set_attributes'; payload: { key: 'forcedLeaderAttributes' | 'forcedCivAttributes'; values: Attribute[] } }
  | { type: 'set_ids'; payload: { key: 'bannedLeaderIds' | 'bannedCivIds'; values: string[] } }
  | { type: 'toggle_panel'; payload: { key: 'forceLeaderPanel' | 'forceCivPanel'; id: string } }
  | { type: 'set_query'; payload: { key: 'forceLeaderQuery' | 'forceCivQuery'; id: string; value: string } }
  | { type: 'set_force_civ_age'; payload: { id: string; age: Age } }
  | { type: 'apply_generated'; payload: { state: DraftState; message: string } };

export const draftReducer = (state: DraftState, action: DraftAction): DraftState => {
  switch (action.type) {
    case 'set_status': return { ...state, statusMessage: action.payload };
    case 'set_seed': return { ...state, seed: action.payload };
    case 'set_step': return { ...state, currentStep: action.payload };
    case 'toggle_age': {
      if (state.selectedAges.includes(action.payload)) {
        if (state.selectedAges.length === 1) return { ...state, statusMessage: 'At least one age must remain selected.' };
        return { ...state, selectedAges: state.selectedAges.filter((age) => age !== action.payload) };
      }
      return { ...state, selectedAges: [...state.selectedAges, action.payload] };
    }
    case 'add_player': return state.players.length >= 6 ? state : { ...state, players: [...state.players, createPlayer(state.players.length + 1)] };
    case 'remove_player': return state.players.length <= 1 ? state : { ...state, players: state.players.filter((player) => player.id !== action.payload) };
    case 'update_player': return { ...state, players: state.players.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload.update } : p)) };
    case 'start_edit_name': return { ...state, editingPlayerId: action.payload.id, editingPlayerName: action.payload.name };
    case 'set_edit_name': return { ...state, editingPlayerName: action.payload };
    case 'stop_edit_name': return { ...state, editingPlayerId: null, editingPlayerName: '' };
    case 'set_leaders_per_player': return { ...state, leadersPerPlayer: action.payload };
    case 'set_civs_per_player': return { ...state, civsPerPlayerPerAge: action.payload };
    case 'toggle_flag': return { ...state, [action.payload]: !state[action.payload] };
    case 'set_attributes': return { ...state, [action.payload.key]: action.payload.values };
    case 'set_ids': return { ...state, [action.payload.key]: action.payload.values };
    case 'toggle_panel': return { ...state, [action.payload.key]: { ...state[action.payload.key], [action.payload.id]: !state[action.payload.key][action.payload.id] } };
    case 'set_query': return { ...state, [action.payload.key]: { ...state[action.payload.key], [action.payload.id]: action.payload.value } };
    case 'set_force_civ_age': return { ...state, forceCivAge: { ...state.forceCivAge, [action.payload.id]: action.payload.age } };
    case 'apply_generated': return { ...action.payload.state, statusMessage: action.payload.message };
    default: return state;
  }
};
