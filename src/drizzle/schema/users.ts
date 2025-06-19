import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, name, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { userNotifSettingsTable } from "./userNotifSettings";
import { userResumeTable } from "./userResume";
import { orgUserSettingsTable } from "./orgUserSettings";

export const userTable = pgTable('users', {
    id: varchar().primaryKey(),
    name,
    email: varchar().notNull().unique(),
    imageUrl: varchar().notNull(),
    createdAt,
    updatedAt,
})

export const userRelations = relations(userTable, ({ one, many }) => ({
    notificationSettings: one(userNotifSettingsTable),
    resume: one(userResumeTable),
    organizationUserSettings: many(orgUserSettingsTable),
}))