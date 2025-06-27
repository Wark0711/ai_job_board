import { db } from "@/drizzle/db"
import { jobListTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { getJobListIdTag, revalidateJobListCache } from "./cache/jobLists"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getJobListing(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({ where: and(eq(jobListTable.id, id), eq(jobListTable.organizationId, orgId)) })
}

export async function insertJobListing(jobListing: typeof jobListTable.$inferInsert) {
    const [newListing] = await db.insert(jobListTable).values(jobListing).returning({
        id: jobListTable.id, orgId: jobListTable.organizationId
    })

    revalidateJobListCache(newListing)
    return newListing
}

export async function updateJobListing(id: string, jobListing: Partial<typeof jobListTable.$inferInsert>) {
    const [updatedListing] = await db.update(jobListTable).set(jobListing).where(eq(jobListTable.id, id))
        .returning({
            id: jobListTable.id, orgId: jobListTable.organizationId
        })

    revalidateJobListCache(updatedListing)
    return updatedListing
}

export async function deleteJobListing(id: string) {
    const [deletedJobListing] = await db.delete(jobListTable).where(eq(jobListTable.id, id)).returning({
        id: jobListTable.id, orgId: jobListTable.organizationId
    })

    revalidateJobListCache(deletedJobListing)
    return deletedJobListing
}