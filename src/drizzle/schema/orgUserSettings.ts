import { boolean, numeric, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { userTable } from "./users"
import { orgTable } from "./organization"
import { relations } from "drizzle-orm"

export const orgUserSettingsTable = pgTable("organization_user_settings", {
    userId: varchar().notNull().references(() => userTable.id),
    organizationId: varchar().notNull().references(() => orgTable.id),
    newApplicationEmailNotifications: boolean().notNull().default(false),
    minimumRating: numeric('rating', { precision: 4, scale: 2 }),
    createdAt,
    updatedAt,
}, table => [primaryKey({ columns: [table.userId, table.organizationId] })])

export const orgUserSettingsRelations = relations(orgUserSettingsTable, ({ one }) => ({
    user: one(userTable, {
        fields: [orgUserSettingsTable.userId],
        references: [userTable.id],
    }),
    organization: one(orgTable, {
        fields: [orgUserSettingsTable.userId],
        references: [orgTable.id],
    })
}))