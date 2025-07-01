"use server"

import { z } from "zod"
import { jobListingAiSearchSchema, jobListSchema } from "./schema"
import { getCurrentOrg, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { redirect } from "next/navigation"
import { deleteJobListing, getJobListing, getPublicJobListings, insertJobListing, updateJobListing } from "../db/jobListing"
import { hasOrgUserPermissions } from "@/services/clerk/lib/orgUserPermissions"
import { getNextJobListingStatus } from "../lib/utils"
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPublishedJobListings } from "../lib/planFeatureHelpers"
import { getMatchingJobListings } from "@/services/inngest/ai/matchJobLists"

export async function createJobListing(unsafeData: z.infer<typeof jobListSchema>) {
    const { orgId } = await getCurrentOrg()

    if (orgId == null || !(await hasOrgUserPermissions("org:job_listings:create"))) {
        return { error: true, message: "You don't have permission to create a job listing", }
    }

    const { success, data } = jobListSchema.safeParse(unsafeData)
    if (!success) {
        return { error: true, message: "There was an error creating your job listing" }
    }

    const jobListing = await insertJobListing({ ...data, organizationId: orgId, status: "draft" })
    redirect(`/employer/job-listings/${jobListing.id}`)
}

export async function modifyJobListing(id: string, unsafeData: z.infer<typeof jobListSchema>) {
    const { orgId } = await getCurrentOrg()

    if (orgId == null || !(await hasOrgUserPermissions("org:job_listings:update"))) {
        return { error: true, message: "You don't have permission to update this job listing" }
    }

    const { success, data } = jobListSchema.safeParse(unsafeData)
    if (!success) {
        return { error: true, message: "There was an error updating your job listing" }
    }

    const jobListing = await getJobListing(id, orgId)
    if (jobListing == null) {
        return { error: true, message: "There was an error updating your job listing" }
    }

    const updatedJobListing = await updateJobListing(id, data)
    redirect(`/employer/job-listings/${updatedJobListing.id}`)
}

export async function toggleJobListingStatus(id: string) {
    const error = { error: true, message: "You don't have permission to update this job listing's status" }
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return error

    const jobListing = await getJobListing(id, orgId)
    if (jobListing == null) return error

    const newStatus = getNextJobListingStatus(jobListing.status)
    if (!(await hasOrgUserPermissions("org:job_listings:change_status")) || (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))) {
        return error
    }

    await updateJobListing(id, {
        status: newStatus, isFeatured: newStatus === "published" ? undefined : false,
        postedAt: newStatus === "published" && jobListing.postedAt == null ? new Date() : undefined
    })
    return { error: false }
}

export async function toggleJobListingFeatured(id: string) {
    const error = { error: true, message: "You don't have permission to update this job listing's featured status" }
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return error

    const jobListing = await getJobListing(id, orgId)
    if (jobListing == null) return error

    const newFeaturedStatus = !jobListing.isFeatured
    if (!(await hasOrgUserPermissions("org:job_listings:change_status")) || (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))) {
        return error
    }

    await updateJobListing(id, { isFeatured: newFeaturedStatus })
    return { error: false }
}
export async function removeJobListing(id: string) {
    const error = { error: true, message: "You don't have permission to delete this job listing" }
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return error

    const jobListing = await getJobListing(id, orgId)
    if (jobListing == null) return error

    if (!(await hasOrgUserPermissions("org:job_listings:delete"))) return error

    await deleteJobListing(id)
    redirect("/employer")
}

export async function getAiJobListingSearchResults(unsafe: z.infer<typeof jobListingAiSearchSchema>): Promise<
    { error: true; message: string } | { error: false; jobIds: string[] }> {
    const { success, data } = jobListingAiSearchSchema.safeParse(unsafe)
    if (!success) return { error: true, message: "There was an error processing your search query" }

    const { userId } = await getCurrentUser()
    if (userId == null) return { error: true, message: "You need an account to use AI job search" }

    const allListings = await getPublicJobListings()
    const matchedListings = await getMatchingJobListings(data.query, allListings, { maxNumberOfJobs: 10 })
    if (matchedListings.length === 0) return { error: true, message: "No jobs match your search criteria" }

    return { error: false, jobIds: matchedListings }
}