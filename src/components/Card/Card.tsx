import Link from 'next/link';
import { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
  title?: string;
  description?: string;
  href?: string;
  className?: string;
  children?: ReactNode;
}

export default function Card({ title, description, href, className, children }: CardProps) {
  const cardContent = (
    <div className={[styles.card, href ? styles.clickable : '', className].filter(Boolean).join(' ')}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
