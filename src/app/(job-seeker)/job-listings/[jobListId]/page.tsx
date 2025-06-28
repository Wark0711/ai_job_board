import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { JobListingItems } from "../../_shared/JobListingItems"
import { IsBreakpoint } from "@/components/IsBreakpoint"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ClientSheet } from "./_ClientSheet"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { notFound } from "next/navigation"
import { JobListingBadges } from "@/features/jobLists/components/JobListingBadges"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"
import { convertSearchParamsToString } from "@/lib/convParamsToStr"
import Link from "next/link"
import { XIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobListIdTag } from "@/features/jobLists/db/cache/jobLists"
import { db } from "@/drizzle/db"
import { jobListAppTable, jobListTable, userResumeTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { getOrgIdTag } from "@/features/org/db/cache/org"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SignUpButton } from "@/services/clerk/components/AuthButtons"
import { getJobListingApplicationIdTag } from "@/features/jobListApps/db/cache/jobListApps"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { differenceInDays } from "date-fns"
import { connection } from "next/server"
import { getUserResumeIdTag } from "@/features/user/db/cache/userResume"

type Props = { params: Promise<{ jobListId: string }>, searchParams: Promise<Record<string, string | string[]>> }

export default function JobListingPage({ params, searchParams }: Props) {
    return (
        <ResizablePanelGroup autoSaveId="job-board-panel" direction="horizontal">
            <ResizablePanel id="left" order={1} defaultSize={60} minSize={30}>
                <div className="p-4 h-screen overflow-y-auto">
                    <JobListingItems searchParams={searchParams} params={params} />
                </div>
            </ResizablePanel>
            <IsBreakpoint
                breakpoint="min-width: 1024px"
                otherwise={
                    <ClientSheet>
                        <SheetContent hideCloseButton className="p-4 overflow-y-auto">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Job Listing Details</SheetTitle>
                            </SheetHeader>
                            <Suspense fallback={<LoadingSpinner />}>
                                <JobListingDetails searchParams={searchParams} params={params} />
                            </Suspense>
                        </SheetContent>
                    </ClientSheet>
                }
            >
                <ResizableHandle withHandle className="mx-2" />
                <ResizablePanel id="right" order={2} defaultSize={40} minSize={30}>
                    <div className="p-4 h-screen overflow-y-auto">
                        <Suspense fallback={<LoadingSpinner />}>
                            <JobListingDetails params={params} searchParams={searchParams} />
                        </Suspense>
                    </div>
                </ResizablePanel>
            </IsBreakpoint>
        </ResizablePanelGroup>
    )
}

async function JobListingDetails({ params, searchParams }: Props) {
    const { jobListId } = await params
    const jobListing = await getJobListing(jobListId)
    if (jobListing == null) return notFound()

    const nameInitials = jobListing.organization.name.split(" ").splice(0, 4).map(word => word[0]).join("")

    return (
        <div className="space-y-6 @container">
            <div className="space-y-4">
                <div className="flex gap-4 items-start">
                    <Avatar className="size-14 @max-md:hidden">
                        <AvatarImage src={jobListing.organization.imageUrl ?? undefined} alt={jobListing.organization.name} />
                        <AvatarFallback className="uppercase bg-primary text-primary-foreground">{nameInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {jobListing.title}
                        </h1>
                        <div className="text-base text-muted-foreground">
                            {jobListing.organization.name}
                        </div>
                        {
                            jobListing.postedAt != null && (
                                <div className="text-sm text-muted-foreground @min-lg:hidden">
                                    {jobListing.postedAt.toLocaleDateString()}
                                </div>
                            )
                        }
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        {
                            jobListing.postedAt != null && (
                                <div className="text-sm text-muted-foreground @max-lg:hidden">
                                    {jobListing.postedAt.toLocaleDateString()}
                                </div>
                            )
                        }
                        <Button size="icon" variant="outline" asChild>
                            <Link href={`/?${convertSearchParamsToString(await searchParams)}`}>
                                <span className="sr-only">Close</span>
                                <XIcon />
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <JobListingBadges jobListing={jobListing} />
                </div>
                <Suspense fallback={<Button disabled>Apply</Button>}>
                    <ApplyButton jobListId={jobListing.id} />
                </Suspense>
            </div>

            <MarkdownRenderer source={jobListing.description} />
        </div>
    )
}

async function ApplyButton({ jobListId }: { jobListId: string }) {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button>Apply</Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2">
                    You need to create an account before applying for a job.
                    <SignUpButton />
                </PopoverContent>
            </Popover>
        )
    }

    const application = await getJobListingApplication({ jobListId: jobListId, userId })

    if (application != null) {
        const formatter = new Intl.RelativeTimeFormat(undefined, { style: "short", numeric: "always" })

        await connection()
        const difference = differenceInDays(application.createdAt, new Date())

        return (
            <div className="text-muted-foreground text-sm">
                You applied for this job{" "}
                {difference === 0 ? "today" : formatter.format(difference, "days")}
            </div>
        )
    }

    const userResume = await getUserResume(userId)
    if (userResume == null) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button>Apply</Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2">
                    You need to upload your resume before applying for a job.
                    <Button asChild>
                        <Link href="/user-settings/resume">Upload Resume</Link>
                    </Button>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Apply</Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Application</DialogTitle>
                    <DialogDescription>
                        Applying for a job cannot be undone and is something you can only do
                        once per job listing.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    {/* <NewJobListingApplicationForm jobListingId={jobListId} /> */}
                </div>
            </DialogContent>
        </Dialog>
    )
}

async function getUserResume(userId: string) {
    "use cache"
    cacheTag(getUserResumeIdTag(userId))

    return db.query.userResumeTable.findFirst({
        where: eq(userResumeTable.userId, userId),
    })
}

async function getJobListingApplication({ jobListId, userId }: { jobListId: string, userId: string }) {
    "use cache"
    cacheTag(getJobListingApplicationIdTag({ jobListingId: jobListId, userId }))

    return db.query.jobListAppTable.findFirst({
        where: and(eq(jobListAppTable.jobListingId, jobListId), eq(jobListAppTable.userId, userId)),
    })
}

async function getJobListing(id: string) {
    "use cache"
    cacheTag(getJobListIdTag(id))

    const listing = await db.query.jobListTable.findFirst({
        where: and(eq(jobListTable.id, id), eq(jobListTable.status, "published")),
        with: { organization: { columns: { id: true, name: true, imageUrl: true } } },
    })

    if (listing != null) {
        cacheTag(getOrgIdTag(listing.organization.id))
    }

    return listing
}