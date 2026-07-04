import type { Metadata } from "next";
import { getTodayPlan } from "@/lib/success-engine";
import { SuccessPlan } from "@/components/SuccessPlan";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Today — McAfful" };

export default async function TodayPage() {
  const plan = await getTodayPlan();

  return <SuccessPlan initialPlan={plan} />;
}
