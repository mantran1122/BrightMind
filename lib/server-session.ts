import { cookies } from "next/headers";
import {
  deleteSessionByToken,
  getSessionUserByToken,
  SESSION_COOKIE_NAME,
} from "@/lib/mysql";

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentSessionUser() {
  const sessionToken = await getSessionTokenFromCookies();
  if (!sessionToken) return null;

  return getSessionUserByToken(sessionToken);
}

export async function clearSessionCookieAndDb() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await deleteSessionByToken(sessionToken);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
