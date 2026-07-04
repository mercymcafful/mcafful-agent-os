import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>
          Beaulieu · Carlswald · Blue Hills · Saddlebrook
        </p>
        <h1 className={styles.heading}>
          The Midrand estate belt, sold properly.
        </h1>
        <p className={styles.subtext}>
          Local knowledge, careful marketing, and a straightforward process —
          from the first viewing to registration at the deeds office.
        </p>
        <div className={styles.actions}>
          <Link href="/sell" className={`btn btn-gold ${styles.primary}`}>
            What&rsquo;s my home worth?
          </Link>
          <a href="#listings" className="btn btn-ghost">
            Browse homes
          </a>
        </div>
      </div>
    </section>
  );
}
