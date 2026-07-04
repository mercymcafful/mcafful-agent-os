import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Sign In — McAfful" };

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.monogram}>M</span>
          <span className={styles.wordmark}>McAfful</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
