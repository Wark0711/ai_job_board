import { pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { userTable } from "./users"
import { relations } from "drizzle-orm"

export const userResumeTable = pgTable("user_resumes", {
    userId: varchar().primaryKey().references(() => userTable.id),
    resumeFileUrl: varchar().notNull(),
    resumeFileKey: varchar().notNull(),
    aiSummary: varchar(),
    createdAt,
    updatedAt,
})

export const userResumeRelations = relations(userResumeTable, ({ one }) => ({
    user: one(userTable, {
        fields: [userResumeTable.userId],
        references: [userTable.id],
    })
}))