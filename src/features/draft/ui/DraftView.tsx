import styles from '@/app/draft/page.module.scss';
import { assumptions, styleNotes, styleTokens } from '../domain/data';
import type { DraftState } from '../domain/types';
import type { DraftControllerActions, DraftControllerDerived } from '../hooks/useDraftController';
import PlayersPanel from './PlayersPanel';
import StepPanel from './StepPanel';
import StyleSummary from './StyleSummary';

interface Props {
  state: DraftState;
  derived: DraftControllerDerived;
  actions: DraftControllerActions;
}

export default function DraftView({ state, derived, actions }: Props) {
  return (
    <div className={styles.page}>
      <StyleSummary assumptions={assumptions} styleNotes={styleNotes} styleTokens={styleTokens} />
      {state.statusMessage ? <div className={styles.statusBanner}>{state.statusMessage}</div> : null}
      <div className={styles.layout}>
        <div className={styles.leftColumn}><StepPanel state={state} derived={derived} actions={actions} /></div>
        <PlayersPanel state={state} actions={actions} attributeOptions={derived.attributeOptions} />
      </div>
    </div>
  );
}
