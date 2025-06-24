import { db } from "@/drizzle/db"
import { jobListTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidateJobListCache } from "./cache/jobLists"

export async function insertJobListing(jobListing: typeof jobListTable.$inferInsert) {
    const [newListing] = await db.insert(jobListTable).values(jobListing).returning({
        id: jobListTable.id,
        orgId: jobListTable.organizationId,
    })

    revalidateJobListCache(newListing)
    return newListing
}