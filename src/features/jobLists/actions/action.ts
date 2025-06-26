"use server"

import { z } from "zod"
import { jobListSchema } from "./schema"
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth"
import { redirect } from "next/navigation"
import { getJobListing, insertJobListing, updateJobListing } from "../db/jobListing"
import { hasOrgUserPermissions } from "@/services/clerk/lib/orgUserPermissions"

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