"use server"

import { z } from "zod"
import { jobListSchema } from "./schema"
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth"
import { redirect } from "next/navigation"
import { insertJobListing } from "../db/jobListing"

export async function createJobListing(unsafeData: z.infer<typeof jobListSchema>) {
    const { orgId } = await getCurrentOrg()

    // || !(await hasOrgUserPermission("org:job_listings:create"))
    if (orgId == null) {
        return { error: true, message: "You don't have permission to create a job listing", }
    }

    const { success, data } = jobListSchema.safeParse(unsafeData)
    if (!success) {
        return { error: true, message: "There was an error creating your job listing" }
    }

    const jobListing = await insertJobListing({...data,organizationId: orgId,status: "draft" })
    redirect(`/employer/job-listings/${jobListing.id}`)
}