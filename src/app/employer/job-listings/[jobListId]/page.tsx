import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { jobListTable } from "@/drizzle/schema";
import { JobListingBadges } from "@/features/jobLists/components/JobListingBadges";
import { getJobListIdTag } from "@/features/jobLists/db/cache/jobLists";
import { formatJobListingStatus } from "@/features/jobLists/lib/formatters";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { EditIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ jobListId: string }> }

export default async function JobListPage(props: Props) {
    return (
        <Suspense>
            <SuspendedPage {...props} />
        </Suspense>
    )
}

async function SuspendedPage({ params }: Props) {
    const { orgId } = await getCurrentOrg()
    if (orgId == null) return null

    const { jobListId } = await params

    const jobListing = await getJobList(jobListId, orgId)
    if (jobListing == null) return notFound()

    return (
        <div className="space-y-6 max-w-6xl max-auto p-4 @container">
            <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {jobListing.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
                        <JobListingBadges jobListing={jobListing} />
                    </div>
                </div>
                <div className="flex items-center gap-2 empty:-mt-4">
                    {/* <AsyncIf condition={() => hasOrgUserPermission("org:job_listings:update")}> */}
                    <Button asChild variant="outline">
                        <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                            <EditIcon className="size-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>
            <MarkdownPartial
                dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
                mainMarkdown={<MarkdownRenderer className="prose-sm" source={jobListing.description} />}
                dialogTitle="Description"
            />

            <Separator />

            {/* <div className="space-y-6">
                <h2 className="text-xl font-semibold">Applications</h2>
                <Suspense fallback={<SkeletonApplicationTable />}>
                    <Applications jobListingId={jobListingId} />
                </Suspense>
            </div> */}
        </div>
    )
}

async function getJobList(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({
        where: and(eq(jobListTable.id, id), eq(jobListTable.organizationId, orgId))
    })
}