import "server-only";
import { db } from "@/lib/database/server";

export function createSupabaseAdmin() {
  return db();
}
