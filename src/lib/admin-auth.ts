import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const adminCookieName = "lunch-admin-session";

function getAdminUsername() {
  const username = process.env.LUNCH_ADMIN_USERNAME?.trim();
  return username ? username : null;
}

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

export async function validateAdminCredentials(usernameInput: string, passwordInput: string) {
  const adminUsername = getAdminUsername();
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return true;
  }

  const isPasswordValid = safeEqual(createToken(passwordInput.trim()), createToken(adminPassword));
  
  if (adminUsername) {
    const isUsernameValid = safeEqual(createToken(usernameInput.trim()), createToken(adminUsername));
    return isPasswordValid && isUsernameValid;
  }

  return isPasswordValid;
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
