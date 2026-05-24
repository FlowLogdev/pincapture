import { NextRequest } from "next/server";
import { createPresentationResponse } from "@/lib/export-presentation";

export async function POST(req: NextRequest) {
  return createPresentationResponse(req, "ppsx");
}
