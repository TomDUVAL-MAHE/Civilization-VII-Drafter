export type Age = 'Antiquity' | 'Exploration' | 'Modern';
export type Attribute =
  | 'Cultural'
  | 'Scientific'
  | 'Militaristic'
  | 'Economic'
  | 'Diplomatic'
  | 'Expansionist'
  | 'Wildcard';

export interface Leader {
  id: string;
  name: string;
  attributes: Attribute[];
  dlc: boolean;
  bonus?: string;
  specificity?: string;
}

export interface Civ {
  id: string;
  age: Age;
  name: string;
  attributes: Attribute[];
  dlc: boolean;
  bonus?: string;
  specificity?: string;
}

export interface Player {
  id: string;
  name: string;
  hasAllDLC: boolean;
  ownedDLC: string[];
  forcedAttributes: Attribute[];
  forcedLeaderId?: string;
  forcedCivByAge?: Partial<Record<Age, string>>;
  draftedLeaders: Leader[];
  selectedLeaderId?: string;
  draftedCivsByAge: Partial<Record<Age, Civ[]>>;
  selectedCivByAge: Partial<Record<Age, string>>;
}

export type DraftStep = 'leaders' | 'civs' | 'souvenirs' | 'ages' | 'quests';

export interface DraftState {
  selectedAges: Age[];
  seed: string;
  currentStep: DraftStep;
  players: Player[];
  leadersPerPlayer: number;
  canGetDoublonsLeaders: boolean;
  isHomogenousLeaderDraft: boolean;
  forcedLeaderAttributes: Attribute[];
  bannedLeaderIds: string[];
  civsPerPlayerPerAge: number;
  canGetDoublonsCivs: boolean;
  isHomogenousCivilisationDraft: boolean;
  isHomogenousCivWithLeader: boolean;
  isQuasiHomogenousCivWithLeader: boolean;
  forcedCivAttributes: Attribute[];
  bannedCivIds: string[];
  statusMessage: string;
  forceLeaderPanel: Record<string, boolean>;
  forceLeaderQuery: Record<string, string>;
  forceCivPanel: Record<string, boolean>;
  forceCivQuery: Record<string, string>;
  forceCivAge: Record<string, Age>;
  editingPlayerId: string | null;
  editingPlayerName: string;
}
