"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Nav.module.css";

const links = [
  { href: "#listings", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "#areas", label: "Areas" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.monogram}>M</span>
          <span className={styles.wordmark}>McAfful</span>
        </a>

        <nav className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.link}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/sell"
            className={`btn btn-pill-sm ${styles.cta}`}
            onClick={() => setOpen(false)}
          >
            Get your free valuation
          </Link>
        </nav>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
