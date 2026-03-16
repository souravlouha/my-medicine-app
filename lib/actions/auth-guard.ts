"use server";

import { auth } from "@/lib/auth";

type Role = "MANUFACTURER" | "DISTRIBUTOR" | "RETAILER" | "ADMIN" | "CONSUMER" | "OPERATOR";

/**
 * Shared auth + role guard for server actions.
 * Returns userId if valid, or throws an error object.
 */
export async function requireAuth(
  ...allowedRoles: Role[]
): Promise<{ userId: string; role: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthActionError("Unauthorized: Please login.");
  }

  const role = ((session?.user as any)?.role || "").toUpperCase();

  if (allowedRoles.length > 0 && !allowedRoles.includes(role as Role)) {
    throw new AuthActionError("Forbidden: You do not have permission for this action.");
  }

  return { userId, role };
}

/**
 * Custom error class for auth failures — allows callers to distinguish
 * auth errors from unexpected errors in their catch blocks.
 */
export class AuthActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthActionError";
  }
}
