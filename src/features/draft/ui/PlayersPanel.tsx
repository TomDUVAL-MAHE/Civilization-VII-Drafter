import styles from '@/app/draft/page.module.scss';
import type { Age, Attribute, DraftState, Player } from '../domain/types';
import PlayerCard from './PlayerCard';

interface Props {
  state: DraftState;
  attributeOptions: Attribute[];
  actions: {
    addPlayer: () => void;
    removePlayer: (id: string) => void;
    updatePlayer: (id: string, update: Partial<Player>) => void;
    startEditName: (player: Player) => void;
    setEditName: (value: string) => void;
    commitName: (player: Player) => void;
    cancelName: () => void;
    toggleLeaderPanel: (id: string) => void;
    setLeaderQuery: (id: string, value: string) => void;
    toggleCivPanel: (id: string) => void;
    setCivQuery: (id: string, value: string) => void;
    setForceCivAge: (id: string, age: Age) => void;
  };
}

export default function PlayersPanel({ state, actions, attributeOptions }: Props) {
  return <div className={styles.rightColumn}><div className={styles.playersHeader}><h2 className={styles.sectionTitle}>Players</h2><button className={styles.buttonSecondary} type="button" onClick={actions.addPlayer} disabled={state.players.length >= 6}>Add player</button></div><div className={styles.playerGrid}>{state.players.map((player) => <PlayerCard key={player.id} player={player} playersCount={state.players.length} selectedAges={state.selectedAges} editingPlayerId={state.editingPlayerId} editingPlayerName={state.editingPlayerName} forceLeaderPanelOpen={Boolean(state.forceLeaderPanel[player.id])} forceLeaderQuery={state.forceLeaderQuery[player.id] ?? ''} forceCivPanelOpen={Boolean(state.forceCivPanel[player.id])} forceCivQuery={state.forceCivQuery[player.id] ?? ''} forceCivAge={state.forceCivAge[player.id] ?? state.selectedAges[0]} attributeOptions={attributeOptions} bannedLeaderIds={state.bannedLeaderIds} bannedCivIds={state.bannedCivIds} onUpdatePlayer={actions.updatePlayer} onRemovePlayer={actions.removePlayer} onStartEditName={actions.startEditName} onSetEditName={actions.setEditName} onCommitName={actions.commitName} onCancelName={actions.cancelName} onToggleLeaderPanel={actions.toggleLeaderPanel} onSetLeaderQuery={actions.setLeaderQuery} onToggleCivPanel={actions.toggleCivPanel} onSetCivQuery={actions.setCivQuery} onSetForceCivAge={actions.setForceCivAge} />)}</div></div>;
}
