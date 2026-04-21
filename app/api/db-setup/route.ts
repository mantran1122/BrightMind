import { NextResponse } from "next/server";
import { ensureMysqlSetup, isMysqlConfigured } from "@/lib/mysql";

async function handleSetup() {
  try {
    if (!isMysqlConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "MySQL is not configured yet. Please add MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE to .env.local.",
        },
        { status: 500 },
      );
    }

    await ensureMysqlSetup();

    return NextResponse.json({
      ok: true,
      message:
        "Database and required tables have been created successfully.",
    });
  } catch (error) {
    console.error("MySQL setup failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create the MySQL database.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handleSetup();
}

export async function POST() {
  return handleSetup();
}
