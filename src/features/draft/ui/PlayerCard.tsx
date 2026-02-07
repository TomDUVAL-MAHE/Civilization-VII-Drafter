import Card from '@/components/Card/Card';
import styles from '@/app/draft/page.module.scss';
import { DATA, DLC_OPTIONS } from '../domain/data';
import type { Age, Attribute, Player } from '../domain/types';
import IconButton from './IconButton';
import TagInput from './TagInput';

interface Props {
  player: Player;
  playersCount: number;
  selectedAges: Age[];
  editingPlayerId: string | null;
  editingPlayerName: string;
  forceLeaderPanelOpen: boolean;
  forceLeaderQuery: string;
  forceCivPanelOpen: boolean;
  forceCivQuery: string;
  forceCivAge: Age;
  attributeOptions: Attribute[];
  bannedLeaderIds: string[];
  bannedCivIds: string[];
  onUpdatePlayer: (id: string, update: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onStartEditName: (player: Player) => void;
  onSetEditName: (value: string) => void;
  onCommitName: (player: Player) => void;
  onCancelName: () => void;
  onToggleLeaderPanel: (id: string) => void;
  onSetLeaderQuery: (id: string, value: string) => void;
  onToggleCivPanel: (id: string) => void;
  onSetCivQuery: (id: string, value: string) => void;
  onSetForceCivAge: (id: string, age: Age) => void;
}

export default function PlayerCard({ player, playersCount, selectedAges, editingPlayerId, editingPlayerName, forceLeaderPanelOpen, forceLeaderQuery, forceCivPanelOpen, forceCivQuery, forceCivAge, attributeOptions, bannedLeaderIds, bannedCivIds, ...actions }: Props) {
  const leaderOptions = DATA.leaders.filter((l) => !bannedLeaderIds.includes(l.id));
  const civOptions = DATA.civs.filter((c) => c.age === forceCivAge && !bannedCivIds.includes(c.id));

  return (
    <Card className={styles.playerCard}>
      <div className={styles.playerHeader}>
        <div className={styles.playerTitleRow}>
          {editingPlayerId === player.id ? (
            <input className={styles.input} type="text" value={editingPlayerName} onChange={(e) => actions.onSetEditName(e.target.value)} onBlur={() => actions.onCommitName(player)} />
          ) : (
            <>
              <span className={styles.playerName}>{player.name}</span>
              <IconButton label="Edit player name" icon="✏️" onClick={() => actions.onStartEditName(player)} />
            </>
          )}
        </div>
        <IconButton label="Remove player" icon="✕" variant="danger" disabled={playersCount <= 1} onClick={() => actions.onRemovePlayer(player.id)} />
      </div>

      {!player.hasAllDLC ? (
        <TagInput label="Owned DLC" values={player.ownedDLC} options={DLC_OPTIONS} name={`owned-${player.id}`} onAdd={(value) => actions.onUpdatePlayer(player.id, { ownedDLC: [...player.ownedDLC, value] })} onRemove={(value) => actions.onUpdatePlayer(player.id, { ownedDLC: player.ownedDLC.filter((d) => d !== value) })} />
      ) : null}

      <TagInput label="Player forced attributes" values={player.forcedAttributes} options={attributeOptions} name={`attrs-${player.id}`} onAdd={(value) => actions.onUpdatePlayer(player.id, { forcedAttributes: [...player.forcedAttributes, value as Attribute] })} onRemove={(value) => actions.onUpdatePlayer(player.id, { forcedAttributes: player.forcedAttributes.filter((a) => a !== value) })} />

      <button className={styles.buttonSecondary} type="button" onClick={() => actions.onToggleLeaderPanel(player.id)}>Force a leader</button>
      {forceLeaderPanelOpen ? <div className={styles.forcePanel}><input className={styles.input} value={forceLeaderQuery} onChange={(e) => actions.onSetLeaderQuery(player.id, e.target.value)} />{leaderOptions.filter((l) => l.name.toLowerCase().includes(forceLeaderQuery.toLowerCase())).slice(0, 8).map((leader) => <button key={leader.id} className={styles.optionButton} type="button" onClick={() => actions.onUpdatePlayer(player.id, { forcedLeaderId: leader.id, selectedLeaderId: leader.id })}>{leader.name}</button>)}</div> : null}

      <button className={styles.buttonSecondary} type="button" onClick={() => actions.onToggleCivPanel(player.id)}>Force a civ</button>
      {forceCivPanelOpen ? <div className={styles.forcePanel}><select className={styles.input} value={forceCivAge} onChange={(e) => actions.onSetForceCivAge(player.id, e.target.value as Age)}>{selectedAges.map((age) => <option key={age}>{age}</option>)}</select><input className={styles.input} value={forceCivQuery} onChange={(e) => actions.onSetCivQuery(player.id, e.target.value)} />{civOptions.filter((c) => c.name.toLowerCase().includes(forceCivQuery.toLowerCase())).slice(0, 8).map((civ) => <button key={civ.id} className={styles.optionButton} type="button" onClick={() => actions.onUpdatePlayer(player.id, { forcedCivByAge: { ...player.forcedCivByAge, [forceCivAge]: civ.id }, selectedCivByAge: { ...player.selectedCivByAge, [forceCivAge]: civ.id } })}>{civ.name}</button>)}</div> : null}
    </Card>
  );
}
