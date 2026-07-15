import { auth } from "@/auth";

/** Defense-in-depth check for admin API routes (middleware already gates /api/admin/*). */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}
