import type { Metadata } from "next";
import { SuccessPlan } from "@/components/SuccessPlan";

export const metadata: Metadata = { title: "Today — McAfful" };

export default function TodayPage() {
  return <SuccessPlan />;
}
