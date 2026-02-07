import styles from './DraftView.module.scss';

interface IconButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  variant?: 'default' | 'danger';
}

export default function IconButton({
  label,
  onClick,
  disabled,
  icon,
  variant = 'default',
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={[styles.iconButton, variant === 'danger' ? styles.iconButtonDanger : ''].filter(Boolean).join(' ')}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}
