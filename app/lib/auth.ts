import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret");

export type AuthPayload = {
  userId: string;
  email: string;
};

export async function createSessionToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthPayload;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        companyLinks: {
          include: { company: true },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function hasActiveTrial(user: { plan: string; trialEndsAt: Date | null }) {
  return user.plan === "trial" && !!user.trialEndsAt && user.trialEndsAt > new Date();
}

export function hasActivePaidPlan(user: { plan: string; planEndsAt: Date | null }) {
  return ["pro", "enterprise"].includes(user.plan) && !!user.planEndsAt && user.planEndsAt > new Date();
}

export function canUseProFeatures(user: { plan: string; trialEndsAt: Date | null; planEndsAt: Date | null }) {
  return hasActiveTrial(user) || hasActivePaidPlan(user);
}