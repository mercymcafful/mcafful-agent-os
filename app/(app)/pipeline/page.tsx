import type { Metadata } from "next";
import { getPipeline } from "@/lib/queries";
import { PipelineBoard } from "@/components/PipelineBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pipeline — McAfful" };

export default async function PipelinePage() {
  const stages = await getPipeline();

  return <PipelineBoard stages={stages} />;
}
