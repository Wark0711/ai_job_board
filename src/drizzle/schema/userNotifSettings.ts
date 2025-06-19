import { boolean, pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { userTable } from "./users"
import { relations } from "drizzle-orm"

export const userNotifSettingsTable = pgTable("user_notification_settings", {
    userId: varchar().primaryKey().references(() => userTable.id),
    newJobEmailNotifications: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt,
})

export const userNotifSettingsRelations = relations(userNotifSettingsTable, ({ one }) => ({
    user: one(userTable, {
        fields: [userNotifSettingsTable.userId],
        references: [userTable.id],
    })
}))