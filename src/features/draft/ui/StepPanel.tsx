import Card from '@/components/Card/Card';
import styles from '@/app/draft/page.module.scss';
import { DATA, stepOptions } from '../domain/data';
import type { Attribute, DraftState } from '../domain/types';
import type { DraftControllerActions, DraftControllerDerived } from '../hooks/useDraftController';
import TagInput from './TagInput';
import ToggleInfoButton from './ToggleInfoButton';

interface Props {
  state: DraftState;
  derived: DraftControllerDerived;
  actions: DraftControllerActions;
}

export default function StepPanel({ state, derived, actions }: Props) {
  return (
    <Card className={styles.sectionCard}>
      <div className={styles.fieldGroup}>
        <p className={styles.label}>Ages disponibles</p>
        <div className={styles.checkboxRow}>
          {DATA.ages.map((age) => (
            <label key={age} className={styles.checkboxLabel}>
              <input type="checkbox" checked={state.selectedAges.includes(age)} onChange={() => actions.toggleAge(age)} />
              <span>{age}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.seedRow}>
        <input className={styles.input} value={state.seed} onChange={(e) => actions.setSeed(e.target.value)} />
        <button className={styles.buttonSecondary} type="button" onClick={actions.rerollSeed}>Re-roll</button>
        <button className={styles.buttonGhost} type="button" onClick={actions.copySeed}>Copy</button>
      </div>

      <div className={styles.segmented}>
        {stepOptions.map((step) => (
          <button key={step.id} type="button" className={[styles.segmentedButton, state.currentStep === step.id ? styles.segmentedActive : ''].join(' ')} disabled={!step.enabled} onClick={() => actions.setStep(step.id)}>
            {step.label}
          </button>
        ))}
      </div>

      {state.currentStep === 'leaders' ? (
        <div className={styles.stepContent}>
          <input className={styles.input} type="number" min={1} max={derived.leaderMax} value={state.leadersPerPlayer} onChange={(e) => actions.setLeadersPerPlayer(Number(e.target.value))} />
          <div className={styles.toggleRow}>
            <ToggleInfoButton title="Duplicates" tooltip="Allows duplicates." pressed={state.canGetDoublonsLeaders} onToggle={() => actions.toggleFlag('canGetDoublonsLeaders')} />
            <ToggleInfoButton title="Similar leaders" tooltip="Bias by attributes." pressed={state.isHomogenousLeaderDraft} onToggle={() => actions.toggleFlag('isHomogenousLeaderDraft')} />
          </div>
          <TagInput label="Forced draft attributes (global)" values={state.forcedLeaderAttributes} options={derived.attributeOptions} name="forcedLeaderAttributes" onAdd={(value) => !state.forcedLeaderAttributes.includes(value as Attribute) && actions.setForcedLeaderAttributes([...state.forcedLeaderAttributes, value as Attribute])} onRemove={(value) => actions.setForcedLeaderAttributes(state.forcedLeaderAttributes.filter((entry) => entry !== value))} />
          <button className={styles.buttonPrimary} type="button" onClick={actions.generateLeaders} disabled={derived.isLeaderGenerateDisabled}>Generate Leaders</button>
        </div>
      ) : null}

      {state.currentStep === 'civs' ? (
        <div className={styles.stepContent}>
          <input className={styles.input} type="number" min={1} max={derived.civMax} value={state.civsPerPlayerPerAge} onChange={(e) => actions.setCivsPerPlayerPerAge(Number(e.target.value))} />
          <div className={styles.toggleRow}>
            <ToggleInfoButton title="Duplicates" tooltip="Allows duplicates." pressed={state.canGetDoublonsCivs} onToggle={() => actions.toggleFlag('canGetDoublonsCivs')} />
            <ToggleInfoButton title="Similar civs" tooltip="Bias by attributes." pressed={state.isHomogenousCivilisationDraft} onToggle={() => actions.toggleFlag('isHomogenousCivilisationDraft')} />
          </div>
          <button className={styles.buttonPrimary} type="button" onClick={actions.generateCivs} disabled={derived.isCivGenerateDisabled}>Generate Civilizations</button>
        </div>
      ) : null}
    </Card>
  );
}
