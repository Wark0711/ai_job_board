import { db } from "@/drizzle/db";
import { jobListTable } from "@/drizzle/schema";
import { getJobListOrgTag } from "@/features/jobLists/db/cache/jobLists";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function EmployerHomePage() {
    return (
        <Suspense>
            <SuspendedPage />
        </Suspense>
    )
}

async function SuspendedPage() {
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return null

    const jobListing = await getMostRecentJobListing(orgId)
    jobListing == null ? redirect("/employer/job-listings/new") : redirect(`/employer/job-listings/${jobListing.id}`)
}

async function getMostRecentJobListing(orgId: string) {
    "use cache"
    cacheTag(getJobListOrgTag(orgId))

    return db.query.jobListTable.findFirst({
        where: eq(jobListTable.organizationId, orgId),
        orderBy: desc(jobListTable.createdAt),
        columns: { id: true },
    })
}