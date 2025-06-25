import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { jobListTable } from "@/drizzle/schema"
import { JobListingForm } from "@/features/jobLists/components/JobListingForm"
import { getJobListIdTag } from "@/features/jobLists/db/cache/jobLists"
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth"
import { and, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import { Suspense } from "react"

type Props = { params: Promise<{ jobListId: string }> }

export default function EditJobListingPage(props: Props) {
    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
            <Card>
                <CardContent>
                    <Suspense>
                        <SuspendedPage {...props} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}


async function SuspendedPage({ params }: Props) {
    const { orgId } = await getCurrentOrg()
        if (orgId == null) return null
    
        const { jobListId } = await params
    
        const jobListing = await getJobList(jobListId, orgId)
        if (jobListing == null) return notFound()

    return <JobListingForm jobListing={jobListing} />
}

async function getJobList(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({ where: and(eq(jobListTable.id, id), eq(jobListTable.organizationId, orgId)) })
}