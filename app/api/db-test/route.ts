import { NextResponse } from "next/server";
import {
  ensureMysqlSetup,
  isMysqlConfigured,
  testMysqlConnection,
} from "@/lib/mysql";

export async function GET() {
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
    const result = await testMysqlConnection();

    return NextResponse.json({
      ok: true,
      message: "Connected to MySQL successfully.",
      database: result.databaseName,
      serverTime: result.serverTime,
    });
  } catch (error) {
    console.error("MySQL connection test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to MySQL.",
      },
      { status: 500 },
    );
  }
}
