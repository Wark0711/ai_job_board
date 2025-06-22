import { db } from "@/drizzle/db";
import { userNotifSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotifSettings";

export async function insertUserNotificationSettings(settings: typeof userNotifSettingsTable.$inferInsert) {
    await db.insert(userNotifSettingsTable).values(settings).onConflictDoNothing()

    revalidateUserNotificationSettingsCache(settings.userId)
}