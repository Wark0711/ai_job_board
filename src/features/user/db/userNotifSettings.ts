import { db } from "@/drizzle/db";
import { userNotifSettingsTable } from "@/drizzle/schema";

export async function insertUserNotificationSettings(settings: typeof userNotifSettingsTable.$inferInsert) {
    await db.insert(userNotifSettingsTable).values(settings).onConflictDoNothing()
}