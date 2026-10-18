import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webcodoo-secret-change-in-production"
);
const COOKIE = "wcd_session";
const EXPIRES_DAYS = 30;

export interface SessionPayload {
  sub: string;      // customer _id
  phone: string;
  name: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_DAYS}d`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * EXPIRES_DAYS,
    path: "/",
  };
}
