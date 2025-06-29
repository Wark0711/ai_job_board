import { db } from "@/drizzle/db"
import { jobListAppTable } from "@/drizzle/schema"
import { revalidateJobListingApplicationCache } from "./cache/jobListApps"
import { and, eq } from "drizzle-orm"

export async function insertJobListingApplication(application: typeof jobListAppTable.$inferInsert) {
    await db.insert(jobListAppTable).values(application)
    revalidateJobListingApplicationCache(application)
}

export async function updateJobListingApplication({ jobListId, userId }: { jobListId: string, userId: string }, data: Partial<typeof jobListAppTable.$inferInsert>) {
    await db.update(jobListAppTable).set(data).where(
        and(eq(jobListAppTable.jobListingId, jobListId), eq(jobListAppTable.userId, userId))
    )
    revalidateJobListingApplicationCache({ jobListingId: jobListId, userId })
}