import { db } from "@/drizzle/db";
import { orgTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrgCache } from "./cache/org";

export async function insertOrg(org: typeof orgTable.$inferInsert) {
    await db.insert(orgTable).values(org).onConflictDoNothing()
    revalidateOrgCache(org.id)
}

export async function updateOrg(id: string, org: Partial<typeof orgTable.$inferInsert>) {
    await db.update(orgTable).set(org).where(eq(orgTable.id, id))
    revalidateOrgCache(id)
}

export async function deleteOrg(id: string) {
    await db.delete(orgTable).where(eq(orgTable.id, id))
    revalidateOrgCache(id)
}