import { NextRequest } from "next/server";
import { createPresentationResponse, presentationOptionsResponse } from "@/lib/export-presentation";

export async function POST(req: NextRequest) {
  return createPresentationResponse(req, "ppsx");
}

export async function OPTIONS(req: NextRequest) {
  return presentationOptionsResponse(req);
}
