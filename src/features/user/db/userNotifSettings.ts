import { db } from "@/drizzle/db";
import { userNotifSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotifSettings";

export async function insertUserNotificationSettings(settings: typeof userNotifSettingsTable.$inferInsert) {
    await db.insert(userNotifSettingsTable).values(settings).onConflictDoNothing()

    revalidateUserNotificationSettingsCache(settings.userId)
}

export async function modifyUserNotificationSettings(userId: string, settings: Partial<Omit<typeof userNotifSettingsTable.$inferInsert, "userId">>) {
    await db.insert(userNotifSettingsTable).values({ ...settings, userId }).onConflictDoUpdate({
        target: userNotifSettingsTable.userId, set: settings,
    })

    revalidateUserNotificationSettingsCache(userId)
}