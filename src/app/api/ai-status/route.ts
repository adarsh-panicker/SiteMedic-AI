import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/nebius";

export async function GET() {
  return NextResponse.json({
    configured: isAIConfigured(),
    model: process.env.NEBIUS_MODEL ?? "nvidia/Nemotron-3.5-Super",
    baseUrl: process.env.NEBIUS_BASE_URL ?? "https://api.tokenfactory.nebius.com/v1/",
  });
}
