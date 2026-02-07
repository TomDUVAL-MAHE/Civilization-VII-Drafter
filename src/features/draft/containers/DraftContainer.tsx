'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/Card/Card';
import IconButton from '@/components/draft/IconButton';
import TagInput from '@/components/draft/TagInput';
import ToggleInfoButton from '@/components/draft/ToggleInfoButton';
import styles from '@/components/draft/DraftView.module.scss';
import { createCivDraftSummary, createLeaderDraftSummary } from '@/features/draft/adapters/createDraftSummaries';
import { listUniqueByName } from '@/features/draft/selectors/listUniqueByName';

type Age = 'Antiquity' | 'Exploration' | 'Modern';
type Attribute =
  | 'Cultural'
  | 'Scientific'
  | 'Militaristic'
  | 'Economic'
  | 'Diplomatic'
  | 'Expansionist'
  | 'Wildcard'
  | string;

interface Leader {
  id: string;
  name: string;
  attributes: Attribute[];
  dlc: boolean;
  bonus?: string;
  specificity?: string;
}

interface Civ {
  id: string;
  age: Age;
  name: string;
  attributes: Attribute[];
  dlc: boolean;
  bonus?: string;
  specificity?: string;
}

interface Player {
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

type DraftStep = 'leaders' | 'civs' | 'souvenirs' | 'ages' | 'quests';

const DATA: { ages: Age[]; leaders: Leader[]; civs: Civ[] } = {
  ages: ['Antiquity', 'Exploration', 'Modern'] as Age[],
  leaders: [
    { id: 'l1', name: 'Ada Lovelace', attributes: ['Cultural', 'Scientific'], dlc: false },
    { id: 'l2', name: 'Amina', attributes: ['Economic', 'Militaristic'], dlc: false },
    {
      id: 'l3',
      name: 'Ashoka, World Conqueror',
      attributes: ['Diplomatic', 'Militaristic'],
      dlc: false,
    },
    {
      id: 'l4',
      name: 'Ashoka, World Renouncer',
      attributes: ['Diplomatic', 'Expansionist'],
      dlc: false,
    },
    { id: 'l5', name: 'Augustus', attributes: ['Cultural', 'Expansionist'], dlc: false },
    {
      id: 'l6',
      name: 'Benjamin Franklin',
      attributes: ['Diplomatic', 'Scientific'],
      dlc: false,
    },
    { id: 'l7', name: 'Catherine', attributes: ['Cultural', 'Diplomatic'], dlc: false },
    { id: 'l8', name: 'Charlemagne', attributes: ['Militaristic', 'Scientific'], dlc: false },
    { id: 'l9', name: 'Confucius', attributes: ['Cultural', 'Scientific'], dlc: false },
    { id: 'l10', name: 'Edward Teach', attributes: ['Militaristic', 'Economic'], dlc: true },
    {
      id: 'l11',
      name: 'Friedrich, Baroque',
      attributes: ['Militaristic', 'Cultural'],
      dlc: false,
    },
    {
      id: 'l12',
      name: 'Friedrich, Oblique',
      attributes: ['Militaristic', 'Scientific'],
      dlc: false,
    },
    {
      id: 'l13',
      name: 'Genghis Khan',
      attributes: ['Militaristic', 'Expansionist'],
      dlc: false,
    },
    {
      id: 'l14',
      name: 'Harriet Tubman',
      attributes: ['Diplomatic', 'Militaristic'],
      dlc: false,
    },
    { id: 'l15', name: 'Hatshepsut', attributes: ['Cultural', 'Economic'], dlc: false },
    {
      id: 'l16',
      name: 'Himiko, High Shaman',
      attributes: ['Cultural', 'Diplomatic'],
      dlc: false,
    },
    {
      id: 'l17',
      name: 'Himiko, Queen of Wa',
      attributes: ['Diplomatic', 'Scientific'],
      dlc: false,
    },
    { id: 'l18', name: 'Ibn Battuta', attributes: ['Expansionist', 'Wildcard'], dlc: false },
    { id: 'l19', name: 'Isabella', attributes: ['Expansionist', 'Economic'], dlc: false },
    { id: 'l20', name: 'José Rizal', attributes: ['Cultural', 'Diplomatic'], dlc: false },
    { id: 'l21', name: 'Lafayette', attributes: ['Cultural', 'Diplomatic'], dlc: false },
    { id: 'l22', name: 'Lakshmibai', attributes: ['Militaristic', 'Diplomatic'], dlc: false },
    { id: 'l23', name: 'Machiavelli', attributes: ['Diplomatic', 'Economic'], dlc: false },
    { id: 'l24', name: 'Napoleon, Emperor', attributes: ['Economic', 'Diplomatic'], dlc: false },
    {
      id: 'l25',
      name: 'Napoleon, Revolutionary',
      attributes: ['Militaristic', 'Cultural'],
      dlc: false,
    },
    { id: 'l26', name: 'Pachacuti', attributes: ['Economic', 'Expansionist'], dlc: false },
    {
      id: 'l27',
      name: 'Sayyida al Hurra',
      attributes: ['Militaristic', 'Diplomatic'],
      dlc: true,
    },
    {
      id: 'l28',
      name: 'Simón Bolívar',
      attributes: ['Militaristic', 'Expansionist'],
      dlc: false,
    },
    { id: 'l29', name: 'Tecumseh', attributes: ['Militaristic', 'Diplomatic'], dlc: false },
    { id: 'l30', name: 'Trung Trac', attributes: ['Militaristic', 'Scientific'], dlc: false },
    { id: 'l31', name: 'Xerxes, King of Kings', attributes: ['Economic', 'Militaristic'], dlc: false },
    { id: 'l32', name: 'Xerxes, the Achaemenid', attributes: ['Cultural', 'Economic'], dlc: false },
  ],
  civs: [
    {
      id: 'c1',
      age: 'Antiquity',
      name: 'Achaemenid Persian',
      attributes: ['Economic', 'Militaristic'],
      dlc: false,
    },
    { id: 'c2', age: 'Antiquity', name: 'Aksumite', attributes: ['Cultural', 'Economic'], dlc: false },
    { id: 'c3', age: 'Antiquity', name: 'Assyrian', attributes: ['Militaristic', 'Scientific'], dlc: false },
    { id: 'c4', age: 'Antiquity', name: 'Carthaginian', attributes: ['Militaristic', 'Economic'], dlc: false },
    { id: 'c5', age: 'Antiquity', name: 'Egyptian', attributes: ['Cultural', 'Economic'], dlc: false },
    { id: 'c6', age: 'Antiquity', name: 'Greek', attributes: ['Cultural', 'Diplomatic'], dlc: false },
    { id: 'c7', age: 'Antiquity', name: 'Han', attributes: ['Diplomatic', 'Scientific'], dlc: false },
    { id: 'c8', age: 'Antiquity', name: 'Khmer', attributes: ['Expansionist', 'Scientific'], dlc: false },
    { id: 'c9', age: 'Antiquity', name: 'Mauryan', attributes: ['Militaristic', 'Scientific'], dlc: false },
    { id: 'c10', age: 'Antiquity', name: 'Maya', attributes: ['Diplomatic', 'Scientific'], dlc: false },
    {
      id: 'c11',
      age: 'Antiquity',
      name: 'Mississippian',
      attributes: ['Economic', 'Expansionist'],
      dlc: false,
    },
    { id: 'c12', age: 'Antiquity', name: 'Roman', attributes: ['Cultural', 'Militaristic'], dlc: false },
    { id: 'c13', age: 'Antiquity', name: 'Silla', attributes: ['Economic', 'Diplomatic'], dlc: false },
    { id: 'c14', age: 'Antiquity', name: 'Tongan', attributes: ['Diplomatic', 'Expansionist'], dlc: false },
    { id: 'c15', age: 'Exploration', name: 'Abbasid', attributes: ['Cultural', 'Scientific'], dlc: false },
    { id: 'c16', age: 'Exploration', name: 'Bulgarian', attributes: ['Expansionist', 'Militaristic'], dlc: false },
    { id: 'c17', age: 'Exploration', name: 'Chola', attributes: ['Diplomatic', 'Economic'], dlc: false },
    { id: 'c18', age: 'Exploration', name: 'Hawaiian', attributes: ['Cultural', 'Expansionist'], dlc: false },
    { id: 'c19', age: 'Exploration', name: 'Icelandic', attributes: ['Cultural', 'Militaristic'], dlc: false },
    { id: 'c20', age: 'Exploration', name: 'Incan', attributes: ['Economic', 'Expansionist'], dlc: false },
    { id: 'c21', age: 'Exploration', name: 'Majapahit', attributes: ['Cultural', 'Economic'], dlc: false },
    { id: 'c22', age: 'Exploration', name: 'Ming', attributes: ['Economic', 'Scientific'], dlc: false },
    { id: 'c23', age: 'Exploration', name: 'Mongolian', attributes: ['Expansionist', 'Militaristic'], dlc: false },
    { id: 'c24', age: 'Exploration', name: 'Norman', attributes: ['Diplomatic', 'Militaristic'], dlc: false },
    { id: 'c25', age: 'Exploration', name: 'Pirate', attributes: ['Economic', 'Militaristic'], dlc: false },
    { id: 'c26', age: 'Exploration', name: 'Shawnee', attributes: ['Diplomatic', 'Economic'], dlc: false },
    { id: 'c27', age: 'Exploration', name: 'Songhai', attributes: ['Economic', 'Militaristic'], dlc: false },
    { id: 'c28', age: 'Exploration', name: 'Spanish', attributes: ['Economic', 'Militaristic'], dlc: false },
    { id: 'c29', age: 'Exploration', name: 'Vietnamese', attributes: ['Cultural', 'Expansionist'], dlc: false },
    { id: 'c30', age: 'Modern', name: 'American', attributes: ['Economic', 'Expansionist'], dlc: false },
    { id: 'c31', age: 'Modern', name: 'British', attributes: ['Economic', 'Expansionist'], dlc: false },
    { id: 'c32', age: 'Modern', name: 'Bugandan', attributes: ['Cultural', 'Expansionist'], dlc: false },
    { id: 'c33', age: 'Modern', name: 'French Imperial', attributes: ['Militaristic', 'Diplomatic'], dlc: false },
    { id: 'c34', age: 'Modern', name: 'Meiji Japanese', attributes: ['Militaristic', 'Scientific'], dlc: false },
    { id: 'c35', age: 'Modern', name: 'Mexican', attributes: ['Cultural', 'Diplomatic'], dlc: false },
    { id: 'c36', age: 'Modern', name: 'Mughal', attributes: ['Economic', 'Expansionist'], dlc: false },
    { id: 'c37', age: 'Modern', name: 'Nepalese', attributes: ['Diplomatic', 'Cultural'], dlc: false },
    { id: 'c38', age: 'Modern', name: 'Ottoman', attributes: ['Cultural', 'Militaristic'], dlc: false },
    { id: 'c39', age: 'Modern', name: 'Prussian', attributes: ['Militaristic', 'Diplomatic'], dlc: false },
    { id: 'c40', age: 'Modern', name: 'Qajar', attributes: ['Diplomatic', 'Expansionist'], dlc: false },
    { id: 'c41', age: 'Modern', name: 'Qing', attributes: ['Economic', 'Expansionist'], dlc: false },
    { id: 'c42', age: 'Modern', name: 'Russian', attributes: ['Cultural', 'Scientific'], dlc: false },
    { id: 'c43', age: 'Modern', name: 'Siamese', attributes: ['Cultural', 'Diplomatic'], dlc: false },
  ],
};

const DLC_OPTIONS = ['DLC Pack A', 'DLC Pack B'];

const styleNotes = [
  'Dark, cinematic background with deep charcoal panels and gold accents.',
  'High-contrast typography with serif-inspired headings for a premium feel.',
  'Soft metallic borders and gentle drop shadows for layered cards.',
  'Compact spacing with clear section hierarchy and segmented controls.',
  'Chips and badges use muted fills with gold highlights for emphasis.',
  'Buttons mix filled gold primary with outlined/ghost companions.',
  'Inputs are framed with subtle borders and warm focus rings.',
];

const assumptions = [
  'La suppression d’un player demande une confirmation native (window.confirm).',
  'La validation du nom du player se fait à la perte de focus ou via Entrée.',
  'Les suggestions des tags restent limitées aux 6 premiers résultats filtrés.',
];

const styleTokens = [
  '--color-bg: #0b0f12',
  '--color-card: #151b21',
  '--color-border: #2b3640',
  '--color-text: #f2e9d8',
  '--color-muted: #b6b0a2',
  '--color-primary: #c9a35b',
  '--color-primary-contrast: #140f07',
  '--color-accent: #7fa1b3',
  '--color-danger: #c65a4a',
  '--radius-sm: 6px',
  '--radius-md: 10px',
  '--radius-lg: 16px',
  '--shadow-sm: 0 6px 18px rgba(0, 0, 0, 0.35)',
  '--shadow-md: 0 12px 26px rgba(0, 0, 0, 0.4)',
  '--space-1/2/3/4/6/8: 4/8/12/16/24/32px',
  '--control-h: 42px',
  '--focus-ring: 0 0 0 3px rgba(201, 163, 91, 0.35)',
];

const stepOptions: { id: DraftStep; label: string; enabled: boolean }[] = [
  { id: 'leaders', label: 'Leaders', enabled: true },
  { id: 'civs', label: 'Civilisations', enabled: true },
  { id: 'souvenirs', label: 'Souvenirs', enabled: false },
  { id: 'ages', label: 'Âges', enabled: false },
  { id: 'quests', label: 'Quêtes', enabled: false },
];

const createSeed = () => Date.now().toString(36);

const createPlayer = (index: number): Player => ({
  id: `p${index}-${Date.now()}`,
  name: `Player ${index}`,
  hasAllDLC: true,
  ownedDLC: [],
  forcedAttributes: [],
  draftedLeaders: [],
  draftedCivsByAge: {},
  selectedCivByAge: {},
});

const xmur3 = (value: string) => {
  let h = 1779033703 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    h = Math.imul(h ^ value.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const createRng = (seed: string) => {
  const seedFn = xmur3(seed);
  return mulberry32(seedFn());
};

const getLeaderById = (id?: string) => DATA.leaders.find((leader) => leader.id === id);
const getCivById = (id?: string) => DATA.civs.find((civ) => civ.id === id);

const playerHasAccess = (player: Player, isDlc: boolean) =>
  !isDlc || player.hasAllDLC || player.ownedDLC.length > 0;

const filterByForcedAttributes = <T extends { attributes: Attribute[] }>(
  items: T[],
  forcedAttributes: Attribute[],
) => {
  if (forcedAttributes.length === 0) {
    return { primary: items, fallback: [] };
  }
  const primary = items.filter((item) =>
    item.attributes.some((attribute) => forcedAttributes.includes(attribute)),
  );
  if (primary.length >= Math.max(1, Math.floor(items.length / 3))) {
    return { primary, fallback: items.filter((item) => !primary.includes(item)) };
  }
  return { primary: items, fallback: [] };
};

const pickRandom = <T,>(pool: T[], rng: () => number) => pool[Math.floor(rng() * pool.length)];

const pickUnique = <T extends { id: string }>(
  pool: T[],
  count: number,
  rng: () => number,
  usedIds: Set<string>,
) => {
  const picks: T[] = [];
  const available = pool.filter((item) => !usedIds.has(item.id));
  const bag = [...available];
  while (bag.length > 0 && picks.length < count) {
    const choice = pickRandom(bag, rng);
    picks.push(choice);
    usedIds.add(choice.id);
    bag.splice(bag.indexOf(choice), 1);
  }
  return picks;
};

const choosePivotAttributes = (attributes: Attribute[], rng: () => number) => {
  if (attributes.length === 0) {
    return [] as Attribute[];
  }
  const first = pickRandom(attributes, rng);
  const withFirst = attributes.filter((attribute) => attribute !== first);
  if (withFirst.length === 0 || rng() > 0.6) {
    return [first];
  }
  return [first, pickRandom(withFirst, rng)];
};

const getAttributeMatches = (candidate: Attribute[], target: Attribute[]) =>
  candidate.filter((attribute) => target.includes(attribute)).length;

const leaderMatchesStrict = (leader: Leader, civ: Civ) => {
  const requiredMatches = Math.min(2, leader.attributes.length);
  return getAttributeMatches(civ.attributes, leader.attributes) >= requiredMatches;
};

const leaderMatchesQuasi = (leader: Leader, civ: Civ) => getAttributeMatches(civ.attributes, leader.attributes) >= 1;

const hasForcedLeaderSelection = (players: Player[]) =>
  players.every((player) => Boolean(player.selectedLeaderId));

const getUniqueAttributes = () => {
  const attributes = new Set<Attribute>();
  DATA.leaders.forEach((leader) => leader.attributes.forEach((attribute) => attributes.add(attribute)));
  DATA.civs.forEach((civ) => civ.attributes.forEach((attribute) => attributes.add(attribute)));
  return Array.from(attributes);
};

const getLeadersForPlayer = (player: Player, bannedLeaderIds: string[]) =>
  DATA.leaders.filter(
    (leader) => !bannedLeaderIds.includes(leader.id) && playerHasAccess(player, leader.dlc),
  );

const getCivsForPlayer = (player: Player, bannedCivIds: string[], age: Age) =>
  DATA.civs.filter(
    (civ) => civ.age === age && !bannedCivIds.includes(civ.id) && playerHasAccess(player, civ.dlc),
  );

const getLeaderPoolForAllPlayers = (players: Player[], bannedLeaderIds: string[]) =>
  DATA.leaders.filter(
    (leader) =>
      !bannedLeaderIds.includes(leader.id) && players.every((player) => playerHasAccess(player, leader.dlc)),
  );

const getCivPoolForAllPlayers = (players: Player[], bannedCivIds: string[], age: Age) =>
  DATA.civs.filter(
    (civ) =>
      civ.age === age &&
      !bannedCivIds.includes(civ.id) &&
      players.every((player) => playerHasAccess(player, civ.dlc)),
  );

export default function DraftContainer() {
  const [selectedAges, setSelectedAges] = useState<Age[]>(['Antiquity', 'Exploration', 'Modern']);
  const [seed, setSeed] = useState(createSeed());
  const [currentStep, setCurrentStep] = useState<DraftStep>('leaders');
  const [players, setPlayers] = useState<Player[]>([createPlayer(1)]);
  const [leadersPerPlayer, setLeadersPerPlayer] = useState(3);
  const [canGetDoublonsLeaders, setCanGetDoublonsLeaders] = useState(false);
  const [isHomogenousLeaderDraft, setIsHomogenousLeaderDraft] = useState(false);
  const [forcedLeaderAttributes, setForcedLeaderAttributes] = useState<Attribute[]>([]);
  const [bannedLeaderIds, setBannedLeaderIds] = useState<string[]>([]);
  const [civsPerPlayerPerAge, setCivsPerPlayerPerAge] = useState(2);
  const [canGetDoublonsCivs, setCanGetDoublonsCivs] = useState(false);
  const [isHomogenousCivilisationDraft, setIsHomogenousCivilisationDraft] = useState(false);
  const [isHomogenousCivWithLeader, setIsHomogenousCivWithLeader] = useState(false);
  const [isQuasiHomogenousCivWithLeader, setIsQuasiHomogenousCivWithLeader] = useState(false);
  const [forcedCivAttributes, setForcedCivAttributes] = useState<Attribute[]>([]);
  const [bannedCivIds, setBannedCivIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [forceLeaderPanel, setForceLeaderPanel] = useState<Record<string, boolean>>({});
  const [forceLeaderQuery, setForceLeaderQuery] = useState<Record<string, string>>({});
  const [forceCivPanel, setForceCivPanel] = useState<Record<string, boolean>>({});
  const [forceCivQuery, setForceCivQuery] = useState<Record<string, string>>({});
  const [forceCivAge, setForceCivAge] = useState<Record<string, Age>>({});
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');

  const attributeOptions = useMemo(() => getUniqueAttributes(), []);

  const availableLeaderPool = useMemo(
    () => getLeaderPoolForAllPlayers(players, bannedLeaderIds),
    [players, bannedLeaderIds],
  );

  const availableCivPoolByAge = useMemo(() => {
    return selectedAges.reduce((acc, age) => {
      acc[age] = getCivPoolForAllPlayers(players, bannedCivIds, age);
      return acc;
    }, {} as Record<Age, Civ[]>);
  }, [players, bannedCivIds, selectedAges]);

  const leaderMax = useMemo(() => {
    if (players.length === 0) {
      return 1;
    }
    if (canGetDoublonsLeaders) {
      return Math.min(10, availableLeaderPool.length);
    }
    return Math.floor(availableLeaderPool.length / players.length);
  }, [availableLeaderPool.length, canGetDoublonsLeaders, players.length]);

  const civMax = useMemo(() => {
    if (selectedAges.length === 0) {
      return 1;
    }
    const perAgeCounts = selectedAges.map((age) => availableCivPoolByAge[age]?.length ?? 0);
    if (perAgeCounts.length === 0) {
      return 1;
    }
    const minCount = Math.min(...perAgeCounts);
    if (canGetDoublonsCivs) {
      return Math.min(10, minCount);
    }
    return Math.floor(minCount / players.length);
  }, [availableCivPoolByAge, canGetDoublonsCivs, players.length, selectedAges]);

  const handleAgeToggle = (age: Age) => {
    setSelectedAges((prev) => {
      if (prev.includes(age)) {
        if (prev.length === 1) {
          setStatusMessage('At least one age must remain selected.');
          return prev;
        }
        return prev.filter((entry) => entry !== age);
      }
      return [...prev, age];
    });
  };

  const handleAddPlayer = () => {
    setPlayers((prev) => {
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, createPlayer(prev.length + 1)];
    });
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) {
      return;
    }
    const confirmed = window.confirm('Remove this player?');
    if (!confirmed) {
      return;
    }
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const startEditingPlayerName = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
  };

  const commitPlayerName = (player: Player) => {
    if (!editingPlayerId || editingPlayerId !== player.id) {
      return;
    }
    const nextName = editingPlayerName.trim() || player.name;
    updatePlayer(player.id, { name: nextName });
    setEditingPlayerId(null);
  };

  const cancelPlayerName = () => {
    setEditingPlayerId(null);
  };

  const updatePlayer = (id: string, update: Partial<Player>) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, ...update } : player)));
  };

  const getLeaderCandidates = (player: Player) => {
    const basePool = getLeadersForPlayer(player, bannedLeaderIds);
    const forced = filterByForcedAttributes(basePool, [...forcedLeaderAttributes, ...player.forcedAttributes]);
    return forced.primary.length > 0 ? forced.primary : basePool;
  };

  const getCivCandidates = (player: Player, age: Age, leader?: Leader) => {
    let basePool = getCivsForPlayer(player, bannedCivIds, age);
    if (leader && isHomogenousCivWithLeader) {
      basePool = basePool.filter((civ) => leaderMatchesStrict(leader, civ));
    } else if (leader && isQuasiHomogenousCivWithLeader) {
      basePool = basePool.filter((civ) => leaderMatchesQuasi(leader, civ));
    }
    const forced = filterByForcedAttributes(basePool, [...forcedCivAttributes, ...player.forcedAttributes]);
    return forced.primary.length > 0 ? forced.primary : basePool;
  };

  const handleGenerateLeaders = () => {
    if (players.length > 6 || leadersPerPlayer < 1) {
      return;
    }
    if (!canGetDoublonsLeaders && availableLeaderPool.length < players.length * leadersPerPlayer) {
      setStatusMessage('Not enough leaders to satisfy the no-duplicate rule.');
      return;
    }
    const rng = createRng(seed);
    const usedIds = new Set<string>();
    const pivotAttributes = isHomogenousLeaderDraft ? choosePivotAttributes(attributeOptions, rng) : [];

    const nextPlayers = players.map((player) => {
      const forcedLeader = getLeaderById(player.forcedLeaderId);
      const pool = getLeaderCandidates(player);
      const filteredPool = pool.filter((leader) => !bannedLeaderIds.includes(leader.id));
      const pivotPool =
        pivotAttributes.length > 0
          ? filteredPool.filter((leader) => leader.attributes.some((attr) => pivotAttributes.includes(attr)))
          : filteredPool;
      const finalPool = pivotPool.length > 0 ? pivotPool : filteredPool;
      const leaderList: Leader[] = [];

      if (forcedLeader && playerHasAccess(player, forcedLeader.dlc) && !bannedLeaderIds.includes(forcedLeader.id)) {
        leaderList.push(forcedLeader);
        usedIds.add(forcedLeader.id);
      }

      const remaining = Math.max(0, leadersPerPlayer - leaderList.length);
      if (canGetDoublonsLeaders) {
        const bag = [...finalPool];
        while (bag.length > 0 && leaderList.length < leadersPerPlayer) {
          const choice = pickRandom(bag, rng);
          leaderList.push(choice);
          bag.splice(bag.indexOf(choice), 1);
        }
      } else {
        leaderList.push(...pickUnique(finalPool, remaining, rng, usedIds));
      }

      return {
        ...player,
        draftedLeaders: leaderList,
        selectedLeaderId: player.forcedLeaderId ?? player.selectedLeaderId,
      };
    });

    setPlayers(nextPlayers);
    setStatusMessage('Leaders generated.');
    setCurrentStep('civs');
  };

  const handleGenerateCivs = () => {
    if (selectedAges.length === 0 || civsPerPlayerPerAge < 1) {
      return;
    }
    if ((isHomogenousCivWithLeader || isQuasiHomogenousCivWithLeader) && !hasForcedLeaderSelection(players)) {
      setStatusMessage('Select a leader for every player before matching civilizations.');
      return;
    }
    const rng = createRng(seed);
    const usedByAge: Record<Age, Set<string>> = {
      Antiquity: new Set(),
      Exploration: new Set(),
      Modern: new Set(),
    };
    const pivotAttributesByAge: Partial<Record<Age, Attribute[]>> = {};
    if (isHomogenousCivilisationDraft) {
      selectedAges.forEach((age) => {
        pivotAttributesByAge[age] = choosePivotAttributes(attributeOptions, rng);
      });
    }

    const nextPlayers = players.map((player) => {
      const selectedLeader = getLeaderById(player.selectedLeaderId);
      const draftedByAge: Partial<Record<Age, Civ[]>> = {};
      const selectedByAge = { ...player.selectedCivByAge };

      selectedAges.forEach((age) => {
        const forcedCivId = player.forcedCivByAge?.[age];
        const forcedCiv = getCivById(forcedCivId);
        const pool = getCivCandidates(player, age, selectedLeader);
        const pivotPool =
          pivotAttributesByAge[age]?.length && pool.length > 0
            ? pool.filter((civ) => civ.attributes.some((attr) => pivotAttributesByAge[age]?.includes(attr)))
            : pool;
        const finalPool = pivotPool.length > 0 ? pivotPool : pool;
        const civList: Civ[] = [];

        if (forcedCiv && playerHasAccess(player, forcedCiv.dlc) && !bannedCivIds.includes(forcedCiv.id)) {
          civList.push(forcedCiv);
          usedByAge[age].add(forcedCiv.id);
        }

        const remaining = Math.max(0, civsPerPlayerPerAge - civList.length);
        if (canGetDoublonsCivs) {
          const bag = [...finalPool];
          while (bag.length > 0 && civList.length < civsPerPlayerPerAge) {
            const choice = pickRandom(bag, rng);
            civList.push(choice);
            bag.splice(bag.indexOf(choice), 1);
          }
        } else {
          civList.push(...pickUnique(finalPool, remaining, rng, usedByAge[age]));
        }

        draftedByAge[age] = civList;
        if (forcedCivId) {
          selectedByAge[age] = forcedCivId;
        }
      });

      return {
        ...player,
        draftedCivsByAge: draftedByAge,
        selectedCivByAge: selectedByAge,
      };
    });

    setPlayers(nextPlayers);
    setStatusMessage('Civilizations generated.');
  };

  const handleCopySeed = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setStatusMessage('Clipboard unavailable in this environment.');
      return;
    }
    try {
      await navigator.clipboard.writeText(seed);
      setStatusMessage('Seed copied.');
    } catch (error) {
      setStatusMessage('Unable to copy seed.');
    }
  };

  const leaderNameOptions = useMemo(
    () => listUniqueByName(DATA.leaders).map((leader) => leader.name),
    [],
  );
  const civNameOptions = useMemo(() => listUniqueByName(DATA.civs).map((civ) => civ.name), []);

  const draftSummary = createLeaderDraftSummary({
    players: players.length,
    leadersPerPlayer,
    canGetDoublonsLeaders,
    bannedLeaderCount: bannedLeaderIds.length,
  });

  const civSummary = createCivDraftSummary({
    selectedAgesLabel: selectedAges.join(', ') || 'None',
    civsPerAge: civsPerPlayerPerAge,
    canGetDoublonsCivs,
    bannedCivCount: bannedCivIds.length,
  });

  const isLeaderGenerateDisabled =
    selectedAges.length === 0 ||
    players.length > 6 ||
    leadersPerPlayer < 1 ||
    (!canGetDoublonsLeaders && availableLeaderPool.length < players.length * leadersPerPlayer);

  const isCivGenerateDisabled =
    selectedAges.length === 0 ||
    civsPerPlayerPerAge < 1 ||
    ((isHomogenousCivWithLeader || isQuasiHomogenousCivWithLeader) && !hasForcedLeaderSelection(players));

  return (
    <div className={styles.page}>
      <section className={styles.styleSummary}>
        <h1 className={styles.pageTitle}>Style extracted from mood board</h1>
        <div className={styles.styleColumns}>
          <div>
            <h2 className={styles.sectionTitle}>Hypothèses</h2>
            <ul className={styles.bulletList}>
              {assumptions.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <ul className={styles.bulletList}>
            {styleNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <ul className={styles.tokenList}>
            {styleTokens.map((token) => (
              <li key={token}>{token}</li>
            ))}
          </ul>
        </div>
        <p className={styles.helper}>
          Contradictions handled by prioritizing the darker, gold-accented Civilization VII marketing panels.
        </p>
      </section>

      {statusMessage ? <div className={styles.statusBanner}>{statusMessage}</div> : null}

      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Configuration générales</h2>
                <p className={styles.sectionSubtitle}>Prépare les paramètres globaux du draft.</p>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <p className={styles.label}>Ages disponibles</p>
              <div className={styles.checkboxRow}>
                {DATA.ages.map((age) => {
                  const isOnlySelected = selectedAges.length === 1 && selectedAges.includes(age);
                  return (
                    <label key={age} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name={`age-${age}`}
                        checked={selectedAges.includes(age)}
                        disabled={isOnlySelected}
                        onChange={() => handleAgeToggle(age)}
                      />
                      <span>{age}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="seed">
                Seed
              </label>
              <div className={styles.seedRow}>
                <input
                  id="seed"
                  name="seed"
                  className={styles.input}
                  type="text"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                />
                <button className={styles.buttonSecondary} type="button" onClick={() => setSeed(createSeed())}>
                  Re-roll
                </button>
                <button className={styles.buttonGhost} type="button" onClick={handleCopySeed}>
                  Copy
                </button>
              </div>
              <p className={styles.seedPreview}>
                Current seed: <span>{seed}</span>
              </p>
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Étape de draft</h2>
                <p className={styles.sectionSubtitle}>Ajuste la logique selon la phase.</p>
              </div>
            </div>

            <div className={styles.segmented}>
              {stepOptions.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={[
                    styles.segmentedButton,
                    currentStep === step.id ? styles.segmentedActive : '',
                  ].join(' ')}
                  disabled={!step.enabled}
                  onClick={() => setCurrentStep(step.id)}
                >
                  {step.label}
                </button>
              ))}
            </div>

            {currentStep === 'leaders' ? (
              <div className={styles.stepContent}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="leadersPerPlayer">
                    Nombre de leaders par joueur
                  </label>
                  <input
                    id="leadersPerPlayer"
                    name="leadersPerPlayer"
                    className={styles.input}
                    type="number"
                    min={1}
                    step={1}
                    max={leaderMax}
                    value={leadersPerPlayer}
                    onChange={(event) => setLeadersPerPlayer(Number(event.target.value))}
                  />
                  <p className={styles.helper}>Max: {leaderMax} (based on duplicates + players)</p>
                </div>

                <div className={styles.toggleRow}>
                  <ToggleInfoButton
                    title="Duplicates"
                    tooltip="Allows the same leader to appear for multiple players."
                    pressed={canGetDoublonsLeaders}
                    onToggle={() => setCanGetDoublonsLeaders(!canGetDoublonsLeaders)}
                  />
                  <ToggleInfoButton
                    title="Similar leaders"
                    tooltip="Bias the generation toward leaders sharing similar attributes."
                    pressed={isHomogenousLeaderDraft}
                    onToggle={() => setIsHomogenousLeaderDraft(!isHomogenousLeaderDraft)}
                  />
                </div>

                <TagInput
                  label="Forced draft attributes (global)"
                  values={forcedLeaderAttributes}
                  options={attributeOptions}
                  name="forcedLeaderAttributes"
                  placeholder="Add attribute..."
                  onAdd={(value) => {
                    if (!forcedLeaderAttributes.includes(value)) {
                      setForcedLeaderAttributes([...forcedLeaderAttributes, value]);
                    }
                  }}
                  onRemove={(value) =>
                    setForcedLeaderAttributes(forcedLeaderAttributes.filter((attr) => attr !== value))
                  }
                />

                <TagInput
                  label="Banned leaders"
                  values={bannedLeaderIds.map((id) => getLeaderById(id)?.name ?? id)}
                  options={leaderNameOptions}
                  name="bannedLeaders"
                  placeholder="Search leader..."
                  onAdd={(value) => {
                    const leader = DATA.leaders.find((item) => item.name === value);
                    if (leader && !bannedLeaderIds.includes(leader.id)) {
                      setBannedLeaderIds([...bannedLeaderIds, leader.id]);
                    }
                  }}
                  onRemove={(value) => {
                    const leader = DATA.leaders.find((item) => item.name === value);
                    const idToRemove = leader?.id ?? value;
                    setBannedLeaderIds(bannedLeaderIds.filter((id) => id !== idToRemove));
                  }}
                  helper="Type to search leaders and ban them."
                />

                <button className={styles.buttonPrimary} type="button" onClick={handleGenerateLeaders} disabled={isLeaderGenerateDisabled}>
                  Generate Leaders
                </button>

                <div className={styles.summaryRow}>
                  <span>Players: {draftSummary.players}</span>
                  <span>Leaders per player: {draftSummary.leadersPerPlayer}</span>
                  <span>Duplicates: {draftSummary.duplicates}</span>
                  <span>Banned: {draftSummary.bannedCount}</span>
                </div>
              </div>
            ) : null}

            {currentStep === 'civs' ? (
              <div className={styles.stepContent}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="civsPerPlayerPerAge">
                    Nombre de civs par joueur par âge
                  </label>
                  <input
                    id="civsPerPlayerPerAge"
                    name="civsPerPlayerPerAge"
                    className={styles.input}
                    type="number"
                    min={1}
                    step={1}
                    max={civMax}
                    value={civsPerPlayerPerAge}
                    onChange={(event) => setCivsPerPlayerPerAge(Number(event.target.value))}
                  />
                  <p className={styles.helper}>Max: {civMax}.</p>
                </div>

                <div className={styles.toggleRow}>
                  <ToggleInfoButton
                    title="Duplicates"
                    tooltip="Allows the same civilization to appear for multiple players."
                    pressed={canGetDoublonsCivs}
                    onToggle={() => setCanGetDoublonsCivs(!canGetDoublonsCivs)}
                  />
                  <ToggleInfoButton
                    title="Similar civs"
                    tooltip="Bias the generation toward civs sharing similar attributes."
                    pressed={isHomogenousCivilisationDraft}
                    onToggle={() => setIsHomogenousCivilisationDraft(!isHomogenousCivilisationDraft)}
                  />
                  <ToggleInfoButton
                    title="Match with leader (strict)"
                    tooltip="Only civs closely matching the selected leader attributes."
                    pressed={isHomogenousCivWithLeader}
                    onToggle={() => {
                      const next = !isHomogenousCivWithLeader;
                      setIsHomogenousCivWithLeader(next);
                      if (next) {
                        setIsQuasiHomogenousCivWithLeader(false);
                      }
                    }}
                    disabled={!hasForcedLeaderSelection(players)}
                  />
                  <ToggleInfoButton
                    title="Match with leader (loose)"
                    tooltip="At least one attribute in common with the selected leader."
                    pressed={isQuasiHomogenousCivWithLeader}
                    onToggle={() => {
                      const next = !isQuasiHomogenousCivWithLeader;
                      setIsQuasiHomogenousCivWithLeader(next);
                      if (next) {
                        setIsHomogenousCivWithLeader(false);
                      }
                    }}
                    disabled={!hasForcedLeaderSelection(players)}
                  />
                </div>
                {!hasForcedLeaderSelection(players) ? (
                  <p className={styles.helper}>Select a leader for each player to enable leader matching.</p>
                ) : null}

                <TagInput
                  label="Forced draft attributes (global)"
                  values={forcedCivAttributes}
                  options={attributeOptions}
                  name="forcedCivAttributes"
                  placeholder="Add attribute..."
                  onAdd={(value) => {
                    if (!forcedCivAttributes.includes(value)) {
                      setForcedCivAttributes([...forcedCivAttributes, value]);
                    }
                  }}
                  onRemove={(value) => setForcedCivAttributes(forcedCivAttributes.filter((attr) => attr !== value))}
                />

                <TagInput
                  label="Banned civilizations"
                  values={bannedCivIds.map((id) => getCivById(id)?.name ?? id)}
                  options={civNameOptions}
                  name="bannedCivs"
                  placeholder="Search civilization..."
                  onAdd={(value) => {
                    const civ = DATA.civs.find((item) => item.name === value);
                    if (civ && !bannedCivIds.includes(civ.id)) {
                      setBannedCivIds([...bannedCivIds, civ.id]);
                    }
                  }}
                  onRemove={(value) => {
                    const civ = DATA.civs.find((item) => item.name === value);
                    const idToRemove = civ?.id ?? value;
                    setBannedCivIds(bannedCivIds.filter((id) => id !== idToRemove));
                  }}
                  helper="Type to search civilizations and ban them."
                />

                <button className={styles.buttonPrimary} type="button" onClick={handleGenerateCivs} disabled={isCivGenerateDisabled}>
                  Generate Civilizations
                </button>

                <div className={styles.summaryRow}>
                  <span>Ages: {civSummary.ages}</span>
                  <span>Civs/age: {civSummary.civsPerAge}</span>
                  <span>Duplicates: {civSummary.duplicates}</span>
                  <span>Banned: {civSummary.bannedCount}</span>
                </div>
              </div>
            ) : null}

            {currentStep !== 'leaders' && currentStep !== 'civs' ? (
              <div className={styles.comingSoon}>Coming soon.</div>
            ) : null}
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.playersHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Players</h2>
              <p className={styles.sectionSubtitle}>Max 6 players</p>
            </div>
            <button
              className={styles.buttonSecondary}
              type="button"
              onClick={handleAddPlayer}
              disabled={players.length >= 6}
            >
              Add player
            </button>
          </div>

          <div className={styles.playerGrid}>
            {players.map((player, index) => {
              const leaderOptions = getLeadersForPlayer(player, bannedLeaderIds);
              const civOptionsByAge = selectedAges.reduce((acc, age) => {
                acc[age] = getCivsForPlayer(player, bannedCivIds, age);
                return acc;
              }, {} as Record<Age, Civ[]>);
              const selectedLeader = getLeaderById(player.selectedLeaderId);
              const generatedAges = selectedAges.filter(
                (age) => (player.draftedCivsByAge[age] ?? []).length > 0,
              );

              return (
                <Card key={player.id} className={styles.playerCard}>
                  <div className={styles.playerHeader}>
                    <div className={styles.playerTitleRow}>
                      {editingPlayerId === player.id ? (
                        <input
                          id={`player-name-${player.id}`}
                          name={`player-name-${player.id}`}
                          className={styles.input}
                          type="text"
                          value={editingPlayerName}
                          onChange={(event) => setEditingPlayerName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              commitPlayerName(player);
                            }
                            if (event.key === 'Escape') {
                              cancelPlayerName();
                            }
                          }}
                          onBlur={() => commitPlayerName(player)}
                        />
                      ) : (
                        <>
                          <span className={styles.playerName}>{player.name}</span>
                          <IconButton label="Edit player name" icon="✏️" onClick={() => startEditingPlayerName(player)} />
                        </>
                      )}
                    </div>
                    <IconButton
                      label="Remove player"
                      icon="✕"
                      onClick={() => handleRemovePlayer(player.id)}
                      disabled={players.length <= 1}
                      variant="danger"
                    />
                  </div>

                  <label className={styles.switchRow}>
                    <input
                      type="checkbox"
                      checked={player.hasAllDLC}
                      onChange={(event) => updatePlayer(player.id, { hasAllDLC: event.target.checked })}
                    />
                    <span>Has all DLC</span>
                  </label>
                  {!player.hasAllDLC ? (
                    <TagInput
                      label="Owned DLC"
                      values={player.ownedDLC}
                      options={DLC_OPTIONS}
                      name={`ownedDlc-${player.id}`}
                      placeholder="Add DLC..."
                      onAdd={(value) => {
                        if (!player.ownedDLC.includes(value)) {
                          updatePlayer(player.id, { ownedDLC: [...player.ownedDLC, value] });
                        }
                      }}
                      onRemove={(value) =>
                        updatePlayer(player.id, {
                          ownedDLC: player.ownedDLC.filter((entry) => entry !== value),
                        })
                      }
                    />
                  ) : null}

                  <TagInput
                    label="Player forced attributes"
                    values={player.forcedAttributes}
                    options={attributeOptions}
                    name={`player-attributes-${player.id}`}
                    placeholder="Add attribute..."
                    onAdd={(value) => {
                      if (!player.forcedAttributes.includes(value)) {
                        updatePlayer(player.id, {
                          forcedAttributes: [...player.forcedAttributes, value],
                        });
                      }
                    }}
                    onRemove={(value) =>
                      updatePlayer(player.id, {
                        forcedAttributes: player.forcedAttributes.filter((attr) => attr !== value),
                      })
                    }
                  />

                  <div className={styles.sectionDivider} />

                  <div className={styles.subsectionHeader}>
                    <h3>Leaders</h3>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() =>
                        setForceLeaderPanel((prev) => ({
                          ...prev,
                          [player.id]: !prev[player.id],
                        }))
                      }
                    >
                      Force a leader
                    </button>
                  </div>

                  {forceLeaderPanel[player.id] ? (
                    <div className={styles.forcePanel}>
                      <input
                        className={styles.input}
                        type="search"
                        name={`leader-search-${player.id}`}
                        placeholder="Search leader..."
                        value={forceLeaderQuery[player.id] ?? ''}
                        onChange={(event) =>
                          setForceLeaderQuery((prev) => ({ ...prev, [player.id]: event.target.value }))
                        }
                      />
                      <div className={styles.optionList} role="listbox">
                        {leaderOptions
                          .filter((leader) =>
                            leader.name.toLowerCase().includes((forceLeaderQuery[player.id] ?? '').toLowerCase()),
                          )
                          .map((leader) => (
                            <button
                              key={leader.id}
                              type="button"
                              className={styles.optionButton}
                              onClick={() =>
                                updatePlayer(player.id, {
                                  forcedLeaderId: leader.id,
                                  selectedLeaderId: leader.id,
                                })
                              }
                            >
                              {leader.name}
                            </button>
                          ))}
                      </div>
                      {player.forcedLeaderId ? (
                        <div className={styles.forceSelection}>
                          <span>{getLeaderById(player.forcedLeaderId)?.name}</span>
                          <button
                            type="button"
                            className={styles.buttonGhost}
                            onClick={() => updatePlayer(player.id, { forcedLeaderId: undefined })}
                          >
                            Clear
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className={styles.cardList} role="radiogroup" aria-label="Drafted leaders">
                    {player.draftedLeaders.length === 0 ? (
                      <p className={styles.helper}>No leaders drafted yet.</p>
                    ) : (
                      player.draftedLeaders.map((leader) => (
                        <button
                          key={leader.id}
                          type="button"
                          className={[
                            styles.miniCard,
                            player.selectedLeaderId === leader.id ? styles.miniCardSelected : '',
                          ].join(' ')}
                          onClick={() => updatePlayer(player.id, { selectedLeaderId: leader.id })}
                          aria-pressed={player.selectedLeaderId === leader.id}
                        >
                          <div className={styles.miniCardHeader}>
                            <span>{leader.name}</span>
                            <span className={styles.badge}>{leader.dlc ? 'DLC' : 'Base'}</span>
                          </div>
                          <div className={styles.chipRow}>
                            {leader.attributes.map((attribute) => (
                              <span key={`${leader.id}-${attribute}`} className={styles.chip}>
                                {attribute}
                              </span>
                            ))}
                          </div>
                          <p className={styles.miniMeta}>{leader.specificity ?? leader.bonus ?? '—'}</p>
                        </button>
                      ))
                    )}
                  </div>

                  <div className={styles.sectionDivider} />

                  <div className={styles.subsectionHeader}>
                    <h3>Civilizations</h3>
                    <button
                      className={styles.buttonSecondary}
                      type="button"
                      onClick={() =>
                        setForceCivPanel((prev) => ({
                          ...prev,
                          [player.id]: !prev[player.id],
                        }))
                      }
                    >
                      Force a civ
                    </button>
                  </div>

                  {forceCivPanel[player.id] ? (
                    <div className={styles.forcePanel}>
                      <label className={styles.label} htmlFor={`force-civ-age-${player.id}`}>
                        Choose age
                      </label>
                      <select
                        id={`force-civ-age-${player.id}`}
                        name={`force-civ-age-${player.id}`}
                        className={styles.input}
                        value={forceCivAge[player.id] ?? selectedAges[0]}
                        onChange={(event) =>
                          setForceCivAge((prev) => ({ ...prev, [player.id]: event.target.value as Age }))
                        }
                      >
                        {selectedAges.map((age) => (
                          <option key={age} value={age}>
                            {age}
                          </option>
                        ))}
                      </select>
                      <input
                        className={styles.input}
                        type="search"
                        name={`civ-search-${player.id}`}
                        placeholder="Search civilization..."
                        value={forceCivQuery[player.id] ?? ''}
                        onChange={(event) =>
                          setForceCivQuery((prev) => ({ ...prev, [player.id]: event.target.value }))
                        }
                      />
                      <div className={styles.optionList} role="listbox">
                        {(civOptionsByAge[forceCivAge[player.id] ?? selectedAges[0]] ?? [])
                          .filter((civ) =>
                            civ.name.toLowerCase().includes((forceCivQuery[player.id] ?? '').toLowerCase()),
                          )
                          .map((civ) => (
                            <button
                              key={civ.id}
                              type="button"
                              className={styles.optionButton}
                              onClick={() =>
                                updatePlayer(player.id, {
                                  forcedCivByAge: {
                                    ...player.forcedCivByAge,
                                    [forceCivAge[player.id] ?? selectedAges[0]]: civ.id,
                                  },
                                  selectedCivByAge: {
                                    ...player.selectedCivByAge,
                                    [forceCivAge[player.id] ?? selectedAges[0]]: civ.id,
                                  },
                                })
                              }
                            >
                              {civ.name}
                            </button>
                          ))}
                      </div>
                      <div className={styles.forceSelection}>
                        {selectedAges.map((age) => {
                          const forcedCiv = getCivById(player.forcedCivByAge?.[age]);
                          if (!forcedCiv) {
                            return null;
                          }
                          return (
                            <span key={`${player.id}-${age}`} className={styles.forceBadge}>
                              {age}: {forcedCiv.name}
                            </span>
                          );
                        })}
                        {Object.values(player.forcedCivByAge ?? {}).some(Boolean) ? (
                          <button
                            type="button"
                            className={styles.buttonGhost}
                            onClick={() => updatePlayer(player.id, { forcedCivByAge: {} })}
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {selectedAges.map((age) => (
                    <div key={`${player.id}-${age}`} className={styles.ageSection}>
                      <div className={styles.ageHeader}>
                        <h4>{age}</h4>
                        <p className={styles.helper}>Pick one civilization</p>
                      </div>
                      <div className={styles.cardList} role="radiogroup" aria-label={`${age} civilizations`}>
                        {player.draftedCivsByAge[age]?.length ? (
                          player.draftedCivsByAge[age]?.map((civ) => (
                            <button
                              key={civ.id}
                              type="button"
                              className={[
                                styles.miniCard,
                                player.selectedCivByAge[age] === civ.id ? styles.miniCardSelected : '',
                              ].join(' ')}
                              onClick={() =>
                                updatePlayer(player.id, {
                                  selectedCivByAge: { ...player.selectedCivByAge, [age]: civ.id },
                                })
                              }
                              aria-pressed={player.selectedCivByAge[age] === civ.id}
                            >
                              <div className={styles.miniCardHeader}>
                                <span>{civ.name}</span>
                                <span className={styles.badge}>{civ.dlc ? 'DLC' : 'Base'}</span>
                              </div>
                              <div className={styles.chipRow}>
                                {civ.attributes.map((attribute) => (
                                  <span key={`${civ.id}-${attribute}`} className={styles.chip}>
                                    {attribute}
                                  </span>
                                ))}
                              </div>
                              <p className={styles.miniMeta}>Eligible age: {civ.age}</p>
                              <p className={styles.miniMeta}>{civ.specificity ?? civ.bonus ?? '—'}</p>
                            </button>
                          ))
                        ) : (
                          <p className={styles.helper}>No civilizations drafted yet.</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className={styles.sectionDivider} />

                  <div className={styles.summaryBox}>
                    <p>
                      Selected leader:{' '}
                      <strong>{selectedLeader ? selectedLeader.name : 'None selected'}</strong>
                    </p>
                    {generatedAges.length > 0 ? (
                      <p>
                        Selected civs:{' '}
                        {generatedAges.map((age) => (
                          <span key={`${player.id}-${age}`}>
                            {age}: {getCivById(player.selectedCivByAge[age])?.name ?? '—'}{' '}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p>Selected civs: None generated yet.</p>
                    )}
                  </div>
                </Card>
              );
            })}

            <button
              type="button"
              className={styles.addPlayerCard}
              onClick={handleAddPlayer}
              disabled={players.length >= 6}
            >
              <span className={styles.addIcon}>＋</span>
              Add player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
