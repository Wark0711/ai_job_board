import { numeric, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { jobListTable } from "./jobListing"
import { userTable } from "./users"
import { relations } from "drizzle-orm"

export const applicationStages = ["denied", "applied", "interested", "interviewed", "hired"] as const
export type ApplicationStage = (typeof applicationStages)[number]
export const applicationStageEnum = pgEnum("job_listing_applications_stage", applicationStages)

export const jobListAppTable = pgTable("job_listing_applications", {
    jobListingId: uuid().references(() => jobListTable.id, { onDelete: "cascade" }).notNull(),
    userId: varchar().references(() => userTable.id, { onDelete: "cascade" }).notNull(),
    coverLetter: text(),
    rating: numeric('rating', { precision: 4, scale: 2 }),
    stage: applicationStageEnum().notNull().default("applied"),
    createdAt,
    updatedAt,
}, table => [primaryKey({ columns: [table.jobListingId, table.userId] })])

export const jobListAppRelations = relations(jobListAppTable, ({ one }) => ({
    jobListing: one(jobListTable, {
        fields: [jobListAppTable.jobListingId],
        references: [jobListTable.id],
    }),
    user: one(userTable, {
        fields: [jobListAppTable.userId],
        references: [userTable.id],
    }),
}))