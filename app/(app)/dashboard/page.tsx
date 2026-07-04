import type { Metadata } from "next";
import { getMetrics } from "@/lib/queries";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard — McAfful" };

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return <Dashboard metrics={metrics} />;
}
