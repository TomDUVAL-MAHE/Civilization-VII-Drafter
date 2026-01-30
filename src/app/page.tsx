import Card from '@/components/Card/Card';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Civilization VII Drafter</h1>
      <div className={styles.cardGrid}>
        <Card
          title="Card 1"
          description="Cliquez pour accéder à la première page"
          href="/card1"
          variant="red"
        />
        <Card
          title="Card 2"
          description="Cliquez pour accéder à la deuxième page"
          href="/card2"
          variant="blue"
        />
        <Card
          title="Card 3"
          description="Cliquez pour accéder à la troisième page"
          href="/card3"
          variant="gray"
        />
      </div>
    </div>
  );
}
