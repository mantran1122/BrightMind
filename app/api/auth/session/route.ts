import { NextResponse } from "next/server";
import { ensureMysqlSetup } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

export async function GET() {
  await ensureMysqlSetup();
  const user = await getCurrentSessionUser();

  return NextResponse.json({ user });
}
