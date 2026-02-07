import styles from '@/app/draft/page.module.scss';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  variant?: 'default' | 'danger';
}

export default function IconButton({ label, onClick, disabled, icon, variant = 'default' }: Props) {
  return (
    <button type="button" className={[styles.iconButton, variant === 'danger' ? styles.iconButtonDanger : ''].filter(Boolean).join(' ')} aria-label={label} onClick={onClick} disabled={disabled}>
      {icon}
    </button>
  );
}
