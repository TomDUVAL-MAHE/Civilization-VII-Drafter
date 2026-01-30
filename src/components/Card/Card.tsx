import Link from 'next/link';
import styles from './Card.module.scss';

interface CardProps {
  title: string;
  description: string;
  href: string;
  variant: 'red' | 'blue' | 'gray';
}

export default function Card({ title, description, href, variant }: CardProps) {
  return (
    <Link href={href}>
      <div className={`${styles.card} ${styles[variant]}`}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
}
