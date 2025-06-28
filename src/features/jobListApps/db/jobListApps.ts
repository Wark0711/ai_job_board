import { db } from "@/drizzle/db"
import { jobListAppTable } from "@/drizzle/schema"
import { revalidateJobListingApplicationCache } from "./cache/jobListApps"

export async function insertJobListingApplication(application: typeof jobListAppTable.$inferInsert) {
    await db.insert(jobListAppTable).values(application)
    revalidateJobListingApplicationCache(application)
}