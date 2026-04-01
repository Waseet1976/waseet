/**
 * lib/supabase/middleware.ts — MOCK (visualisation sans Supabase)
 */
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
