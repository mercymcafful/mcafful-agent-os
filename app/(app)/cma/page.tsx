import type { Metadata } from "next";
import { getCMAs, getSellerLeads } from "@/lib/queries";
import { CMATool } from "@/components/CMATool";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "CMA Generator — McAfful" };

export default async function CMAPage() {
  const [cmas, sellerLeads] = await Promise.all([getCMAs(), getSellerLeads()]);

  return <CMATool cmas={cmas} sellerLeads={sellerLeads} />;
}
