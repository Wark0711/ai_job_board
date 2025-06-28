import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { JobListingStatus, jobListTable } from "@/drizzle/schema";
import { removeJobListing, toggleJobListingFeatured, toggleJobListingStatus } from "@/features/jobLists/actions/action";
import { JobListingBadges } from "@/features/jobLists/components/JobListingBadges";
import { getJobListIdTag } from "@/features/jobLists/db/cache/jobLists";
import { formatJobListingStatus } from "@/features/jobLists/lib/formatters";
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPublishedJobListings } from "@/features/jobLists/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/jobLists/lib/utils";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermissions } from "@/services/clerk/lib/orgUserPermissions";
import { and, eq } from "drizzle-orm";
import { EditIcon, EyeIcon, EyeOffIcon, StarIcon, StarOffIcon, Trash2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

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
                    <AsyncIf condition={() => hasOrgUserPermissions("org:job_listings:update")}>
                        <Button asChild variant="outline">
                            <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                                <EditIcon className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </AsyncIf>
                    <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
                    {
                        jobListing.status === "published" && (
                            <FeaturedToggleButton isFeatured={jobListing.isFeatured} id={jobListing.id} />
                        )
                    }
                    <AsyncIf condition={() => hasOrgUserPermissions("org:job_listings:delete")}>
                        <ActionButton variant="destructive" action={removeJobListing.bind(null, jobListing.id)} requireAreYouSure>
                            <Trash2Icon className="size-4" />
                            Delete
                        </ActionButton>
                    </AsyncIf>
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

function StatusUpdateButton({ status, id }: { status: JobListingStatus, id: string }) {

    const button = <ActionButton
        variant="outline"
        action={toggleJobListingStatus.bind(null, id)}
        requireAreYouSure={getNextJobListingStatus(status) === "published"}
        areYouSureDescription="This will immediately show this job listing to all users.">
        {statusToggleButtonText(status)}
    </ActionButton>

    return (
        <AsyncIf condition={() => hasOrgUserPermissions('org:job_listings:update')}>
            {
                getNextJobListingStatus(status) === "published"
                    ? <AsyncIf
                        condition={async () => {
                            const isMaxed = await hasReachedMaxPublishedJobListings()
                            return !isMaxed
                        }}
                        otherwise={
                            <UpgradePopover buttonText={statusToggleButtonText(status)} popoverText="You must upgrade your plan to publish more job listings." />
                        }>
                        {button}
                    </AsyncIf>
                    : button
            }

        </AsyncIf>
    )
}

function FeaturedToggleButton({ isFeatured, id }: { isFeatured: boolean, id: string }) {
    const button = (
        <ActionButton action={toggleJobListingFeatured.bind(null, id)} variant="outline">
            {featuredToggleButtonText(isFeatured)}
        </ActionButton>
    )

    return (
        <AsyncIf condition={() => hasOrgUserPermissions("org:job_listings:change_status")}>
            {
                isFeatured
                    ? button
                    : <AsyncIf
                        condition={async () => {
                            const isMaxed = await hasReachedMaxFeaturedJobListings()
                            return !isMaxed
                        }}
                        otherwise={
                            <UpgradePopover
                                buttonText={featuredToggleButtonText(isFeatured)}
                                popoverText="You must upgrade your plan to feature more job listings."
                            />
                        }>
                        {button}
                    </AsyncIf>
            }
        </AsyncIf>
    )
}

function UpgradePopover({ buttonText, popoverText }: { buttonText: ReactNode, popoverText: ReactNode }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">{buttonText}</Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                {popoverText}
                <Button asChild>
                    <Link href="/employer/pricing">Upgrade Plan</Link>
                </Button>
            </PopoverContent>
        </Popover>
    )
}

function statusToggleButtonText(status: JobListingStatus) {
    switch (status) {
        case "delisted":
        case "draft":
            return (
                <>
                    <EyeIcon className="size-4" />
                    Publish
                </>
            )
        case "published":
            return (
                <>
                    <EyeOffIcon className="size-4" />
                    Delist
                </>
            )
        default:
            throw new Error(`Unknown status: ${status satisfies never}`)
    }
}

function featuredToggleButtonText(isFeatured: boolean) {
    if (isFeatured) {
        return (
            <>
                <StarOffIcon className="size-4" />
                UnFeature
            </>
        )
    }

    return (
        <>
            <StarIcon className="size-4" />
            Feature
        </>
    )
}

async function getJobList(id: string, orgId: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    return db.query.jobListTable.findFirst({
        where: and(eq(jobListTable.id, id), eq(jobListTable.organizationId, orgId))
    })
}