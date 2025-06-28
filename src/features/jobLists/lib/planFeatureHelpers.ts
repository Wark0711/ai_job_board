import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth"
import { getJobListOrgTag } from "../db/cache/jobLists"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { db } from "@/drizzle/db"
import { jobListTable } from "@/drizzle/schema"
import { and, count, eq } from "drizzle-orm"
import { hasPlanFeature } from "@/services/clerk/lib/planFeature"

export async function hasReachedMaxFeaturedJobListings() {
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return true

    const count = await getFeaturedJobListingsCount(orgId)

    const canFeature = await Promise.all([
        hasPlanFeature("1_featured_job_listing").then(has => has && count < 1),
        hasPlanFeature("unlimited_featured_job_listings"),
    ])

    return !canFeature.some(Boolean)
}

export async function hasReachedMaxPublishedJobListings() {
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return true

    const count = await getPublishedJobListingsCount(orgId)

    const canPost = await Promise.all([
        hasPlanFeature("post_1_job_listing").then(has => has && count < 1),
        hasPlanFeature("post_3_job_listings").then(has => has && count < 3),
        hasPlanFeature("post_6_job_listings").then(has => has && count < 6),
        hasPlanFeature("post_15_job_listings").then(has => has && count < 15),
    ])

    return !canPost.some(Boolean)
}

async function getPublishedJobListingsCount(orgId: string) {
    "use cache"
    cacheTag(getJobListOrgTag(orgId))

    const [res] = await db.select({ count: count() }).from(jobListTable).where(
        and(eq(jobListTable.organizationId, orgId), eq(jobListTable.status, "published"))
    )
    return res?.count ?? 0
}

async function getFeaturedJobListingsCount(orgId: string) {
    "use cache"
    cacheTag(getJobListOrgTag(orgId))

    const [res] = await db.select({ count: count() }).from(jobListTable).where(
        and(eq(jobListTable.organizationId, orgId), eq(jobListTable.isFeatured, true))
    )
    return res?.count ?? 0
}