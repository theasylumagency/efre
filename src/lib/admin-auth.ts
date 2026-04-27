import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const adminCookieName = "lunch-admin-session";

function getAdminPassword() {
  const password = process.env.LUNCH_ADMIN_PASSWORD?.trim();
  return password ? password : null;
}

function createToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminProtectionEnabled() {
  return Boolean(getAdminPassword());
}

export async function validateAdminPassword(input: string) {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return true;
  }

  return safeEqual(createToken(input.trim()), createToken(adminPassword));
}

export async function isAdminAuthenticated() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return true;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(adminCookieName)?.value;

  if (!sessionToken) {
    return false;
  }

  return safeEqual(sessionToken, createToken(adminPassword));
}

export async function createAdminSession() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: adminCookieName,
    value: createToken(adminPassword),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: adminCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
