import styles from "./Footer.module.css";

const links = [
  { href: "#listings", label: "Buy" },
  { href: "#sell", label: "Sell" },
  { href: "#areas", label: "Areas" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.monogram}>M</span>
          <span className={styles.wordmark}>McAfful</span>
        </div>

        <nav className={styles.links}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className={styles.compliance}>
          Mercy McAfful is a registered property practitioner (PPRA). FFC
          available on request.
        </p>
      </div>
    </footer>
  );
}
