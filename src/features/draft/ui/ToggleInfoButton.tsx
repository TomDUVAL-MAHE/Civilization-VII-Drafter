import styles from '@/app/draft/page.module.scss';

interface Props {
  title: string;
  tooltip: string;
  pressed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function ToggleInfoButton({ title, tooltip, pressed, onToggle, disabled }: Props) {
  return (
    <button type="button" className={[styles.toggleButton, pressed ? styles.toggleActive : '', disabled ? styles.toggleDisabled : ''].filter(Boolean).join(' ')} onClick={onToggle} aria-pressed={pressed} disabled={disabled}>
      <span>{title}</span>
      <span className={styles.infoDot} role="img" aria-label={tooltip} data-tooltip={tooltip}>ℹ️</span>
    </button>
  );
}
