import { db } from "@/drizzle/db"
import { orgUserSettingsTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { revalidateOrganizationUserSettingsCache } from "./cache/orgUserSettings"

export async function insertOrgUserSettings(settings: typeof orgUserSettingsTable.$inferInsert) {
    await db.insert(orgUserSettingsTable).values(settings).onConflictDoNothing()

    revalidateOrganizationUserSettingsCache(settings)
}

export async function updateOrgUserSettings(
    { userId, organizationId }: { userId: string, organizationId: string },
    settings: Partial<Omit<typeof orgUserSettingsTable.$inferInsert, "userId" | "organizationId">>
) {
    await db.insert(orgUserSettingsTable).values({ ...settings, userId, organizationId }).onConflictDoUpdate({
        target: [orgUserSettingsTable.userId, orgUserSettingsTable.organizationId], set: settings
    })

    revalidateOrganizationUserSettingsCache({ userId, organizationId })
}

export async function deleteOrgUserSettings({ userId, organizationId }: { userId: string, organizationId: string }) {
    await db.delete(orgUserSettingsTable)
        .where(and(eq(orgUserSettingsTable.userId, userId), eq(orgUserSettingsTable.organizationId, organizationId)))

    revalidateOrganizationUserSettingsCache({ userId, organizationId })
}