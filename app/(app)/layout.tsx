import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "./layout.module.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.monogram}>M</span>
          <span className={styles.wordmark}>McAfful</span>
        </div>

        <nav className={styles.nav}>
          <Link href="/today" className={styles.navLink}>
            Today
          </Link>
          <Link href="/leads" className={styles.navLink}>
            Leads
          </Link>
        </nav>

        <div className={styles.footer}>
          <p className={styles.email}>{user.email}</p>
          <a href="/" className={styles.publicLink}>
            View public site
          </a>
          <SignOutButton />
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
