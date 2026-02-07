import type { Meta, StoryObj } from '@storybook/react';
import PlayerCard from './PlayerCard';

const baseArgs = {
  playersCount: 2,
  selectedAges: ['Antiquity', 'Exploration', 'Modern'] as const,
  editingPlayerId: null,
  editingPlayerName: '',
  forceLeaderPanelOpen: false,
  forceLeaderQuery: '',
  forceCivPanelOpen: false,
  forceCivQuery: '',
  forceCivAge: 'Antiquity' as const,
  attributeOptions: ['Cultural', 'Scientific'] as const,
  bannedLeaderIds: [],
  bannedCivIds: [],
  onUpdatePlayer: () => {},
  onRemovePlayer: () => {},
  onStartEditName: () => {},
  onSetEditName: () => {},
  onCommitName: () => {},
  onCancelName: () => {},
  onToggleLeaderPanel: () => {},
  onSetLeaderQuery: () => {},
  onToggleCivPanel: () => {},
  onSetCivQuery: () => {},
  onSetForceCivAge: () => {},
};

const meta: Meta<typeof PlayerCard> = {
  title: 'Draft/PlayerCard',
  component: PlayerCard,
};

export default meta;
type Story = StoryObj<typeof PlayerCard>;

export const EmptyDrafted: Story = {
  args: {
    ...baseArgs,
    player: { id: 'p1', name: 'Player 1', hasAllDLC: true, ownedDLC: [], forcedAttributes: [], draftedLeaders: [], draftedCivsByAge: {}, selectedCivByAge: {} },
  },
};

export const Drafted: Story = {
  args: {
    ...baseArgs,
    player: { id: 'p1', name: 'Player 1', hasAllDLC: true, ownedDLC: [], forcedAttributes: [], draftedLeaders: [{ id: 'l1', name: 'Ada Lovelace', attributes: ['Cultural', 'Scientific'], dlc: false }], selectedLeaderId: 'l1', draftedCivsByAge: {}, selectedCivByAge: {} },
  },
};
