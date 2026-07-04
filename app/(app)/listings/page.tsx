import type { Metadata } from "next";
import { getListings } from "@/lib/queries";
import { ListingsManager } from "@/components/ListingsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Listings — McAfful" };

export default async function ListingsPage() {
  const listings = await getListings();

  return <ListingsManager listings={listings} />;
}
