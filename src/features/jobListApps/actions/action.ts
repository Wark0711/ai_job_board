"use server"

import { z } from "zod"
import { newJobListAppnSchema } from "./schema"
import { getCurrentOrg, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobListIdTag } from "@/features/jobLists/db/cache/jobLists"
import { db } from "@/drizzle/db"
import { insertJobListingApplication, updateJobListingApplication } from "../db/jobListApps"
import { and, eq } from "drizzle-orm"
import { ApplicationStage, applicationStages, jobListTable, userResumeTable } from "@/drizzle/schema"
import { getUserResumeIdTag } from "@/features/user/db/cache/userResume"
import { inngest } from "@/services/inngest/client"
import { hasOrgUserPermissions } from "@/services/clerk/lib/orgUserPermissions"

export async function createJobListApp(jobListId: string, unsafeData: z.infer<typeof newJobListAppnSchema>) {
    const permissionError = { error: true, message: "You don't have permission to submit an application" }
    const { userId } = await getCurrentUser()
    console.log('User ID:', userId);

    if (userId == null) return permissionError

    const [userResume, jobListing] = await Promise.all([getUserResume(userId), getPublicJobListing(jobListId),])
    if (userResume == null || jobListing == null) return permissionError

    const { success, data } = newJobListAppnSchema.safeParse(unsafeData)

    if (!success) return { error: true, message: "There was an error submitting your application" }

    await insertJobListingApplication({ jobListingId: jobListId, userId, ...data, })

    await inngest.send({ name: "app/jobListingApplication.created", data: { jobListId, userId } })
    return { error: false, message: "Your application was successfully submitted" }
}

export async function updateJobListingApplicationStage({ jobListId, userId, }: { jobListId: string, userId: string }, unsafeStage: ApplicationStage) {
    const { success, data: stage } = z.enum(applicationStages).safeParse(unsafeStage)

    if (!success) return { error: true, message: "Invalid stage" }

    if (!(await hasOrgUserPermissions("org:job_listing_applications:change_stage"))) return { error: true, message: "You don't have permission to update the stage" }

    const { orgId } = await getCurrentOrg()
    const jobListing = await getJobListing(jobListId)
    if (orgId == null || jobListing == null || orgId !== jobListing.organizationId) return { error: true, message: "You don't have permission to update the stage" }

    await updateJobListingApplication({ jobListId, userId }, { stage })
}

export async function updateJobListingApplicationRating({ jobListId, userId }: { jobListId: string,userId: string }, unsafeRating: string | null) {
    const { success, data: rating } = z.string().min(1).max(5).nullish().safeParse(unsafeRating)

    if (!success) return { error: true, message: "Invalid rating" }

    if (!(await hasOrgUserPermissions("org:job_listing_applications:change_rating"))) return { error: true, message: "You don't have permission to update the rating"}

    const { orgId } = await getCurrentOrg()
    const jobListing = await getJobListing(jobListId)
    if ( orgId == null || jobListing == null || orgId !== jobListing.organizationId) return { error: true, message: "You don't have permission to update the rating" }

    await updateJobListingApplication({ jobListId, userId }, { rating })
}

async function getPublicJobListing(id: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({
        where: and(eq(jobListTable.id, id), eq(jobListTable.status, "published")),
        columns: { id: true },
    })
}

async function getJobListing(id: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({
        where: eq(jobListTable.id, id),
        columns: { organizationId: true },
    })
}

async function getUserResume(userId: string) {
    "use cache"
    cacheTag(getUserResumeIdTag(userId))

    return db.query.userResumeTable.findFirst({
        where: eq(userResumeTable.userId, userId),
        columns: { userId: true },
    })
}