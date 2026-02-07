import styles from '@/app/draft/page.module.scss';

interface Props { assumptions: string[]; styleNotes: string[]; styleTokens: string[] }

export default function StyleSummary({ assumptions, styleNotes, styleTokens }: Props) {
  return <section className={styles.styleSummary}><h1 className={styles.pageTitle}>Style extracted from mood board</h1><div className={styles.styleColumns}><div><h2 className={styles.sectionTitle}>Hypothèses</h2><ul className={styles.bulletList}>{assumptions.map((note) => <li key={note}>{note}</li>)}</ul></div><ul className={styles.bulletList}>{styleNotes.map((note) => <li key={note}>{note}</li>)}</ul><ul className={styles.tokenList}>{styleTokens.map((token) => <li key={token}>{token}</li>)}</ul></div></section>;
}
