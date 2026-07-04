import type { Metadata } from "next";
import { getLeads } from "@/lib/queries";
import { LeadCard } from "@/components/LeadCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inbound Leads — McAfful" };

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.heading}>Inbound Leads</h1>
        <p className={styles.subtitle}>
          Every valuation request your website has caught from inbound
          prospecting, newest first.
        </p>
      </header>

      {leads.length === 0 ? (
        <div className={styles.empty}>
          <p>
            No leads yet — once someone requests a valuation on the website,
            they&rsquo;ll show up here.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
