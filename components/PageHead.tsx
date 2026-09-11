import styles from './PageHead.module.css';

export default function PageHead({
  title,
  intro,
}: {
  title: string;
  intro?: string;
}) {
  return (
    <header className={styles.head}>
      <h1 className={styles.title}>{title}</h1>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function PanelGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.panelGrid}>{children}</div>;
}
