import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ValuationForm } from "@/components/ValuationForm";
import { CheckIcon } from "@/components/CheckIcon";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Request a Free Valuation — McAfful",
  description:
    "Find out what your Midrand estate belt home is really worth — a clear, no-obligation valuation with a reply within 24 hours.",
};

const bullets = [
  "Priced on real, recent sales in your area",
  "A clear marketing plan, explained upfront",
  "A reply within 24 hours, every time",
];

export default function SellPage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.section}>
          <div className={`container ${styles.grid}`}>
            <div className={styles.content}>
              <p className={styles.eyebrow}>Thinking of selling?</p>
              <h1 className={styles.heading}>
                Find out what your home is really worth.
              </h1>
              <p className={styles.subtext}>
                An honest, local valuation based on what&rsquo;s actually sold
                nearby recently — no obligation, no pressure, just a clear
                number and a plan.
              </p>
              <ul className={styles.bullets}>
                {bullets.map((bullet) => (
                  <li key={bullet} className={styles.bullet}>
                    <span className={styles.tick}>
                      <CheckIcon className={styles.tickIcon} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Request my free valuation</h2>
              <ValuationForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
