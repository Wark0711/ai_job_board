import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { jobListTable } from "./jobListing";
import { orgUserSettingsTable } from "./orgUserSettings";

export const orgTable = pgTable('organizations', {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    imageUrl: varchar(),
    createdAt,
    updatedAt,
})

export const orgRelations = relations(orgTable, ({ many }) => ({
    jobListings: many(jobListTable),
    organizationUserSettings: many(orgUserSettingsTable)
}))
