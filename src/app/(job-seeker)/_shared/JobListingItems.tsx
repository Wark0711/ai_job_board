import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { experienceLevels, jobListingTypes, jobListTable, locationRequirements, orgTable } from "@/drizzle/schema"
import { getJobListGlobalTag } from "@/features/jobLists/db/cache/jobLists"
import { getOrgIdTag } from "@/features/org/db/cache/org"
import { convertSearchParamsToString } from "@/lib/convParamsToStr"
import { cn } from "@/lib/utils"
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { Suspense } from "react"
import { z } from "zod"
import { differenceInDays } from "date-fns"
import { connection } from "next/server"
import { Badge } from "@/components/ui/badge"
import { JobListingBadges } from "@/features/jobLists/components/JobListingBadges"

type Props = {
    searchParams: Promise<Record<string, string | string[]>>
    params?: Promise<{ jobListId: string }>
}

const searchParamsSchema = z.object({
    title: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    state: z.string().optional().catch(undefined),
    experience: z.enum(experienceLevels).optional().catch(undefined),
    locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
    type: z.enum(jobListingTypes).optional().catch(undefined),
    jobIds: z.union([z.string(), z.array(z.string())]).transform(v => (Array.isArray(v) ? v : [v])).optional().catch([]),
})

export function JobListingItems(props: Props) {
    return (
        <Suspense>
            <SuspendedComponent {...props} />
        </Suspense>
    )
}

async function SuspendedComponent({ searchParams, params }: Props) {

    const jobListingId = params ? (await params).jobListId : undefined
    const { success, data } = searchParamsSchema.safeParse(await searchParams)
    const search = success ? data : {}

    const jobListings = await getJobListings(search, jobListingId)
    if (jobListings.length === 0) {
        return (
            <div className="text-muted-foreground p-4">No job listings found</div>
        )
    }
    return (
        <div className="space-y-4">
            {
                jobListings.map(jobListing => (
                    <Link
                        className="block"
                        key={jobListing.id}
                        href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(search)}`}>
                        <JobListingListItem jobListing={jobListing} organization={jobListing.organization} />
                    </Link>
                ))
            }
        </div>
    )
}

function JobListingListItem({ jobListing, organization }: {
    jobListing: Pick<
        typeof jobListTable.$inferSelect,
        | "title"
        | "stateAbbreviation"
        | "city"
        | "wage"
        | "wageInterval"
        | "experienceLevel"
        | "type"
        | "postedAt"
        | "locationRequirement"
        | "isFeatured"
    >,
    organization: Pick<typeof orgTable.$inferSelect, "name" | "imageUrl">
}) {

    const nameInitials = organization?.name?.split(" ")?.splice(0, 4)?.map(word => word[0])?.join("")

    return (
        <Card className={cn("@container", jobListing.isFeatured && "border-featured bg-featured/20")}>
            <CardHeader>
                <div className="flex gap-4">
                    <Avatar className="size-14 @max-sm:hidden">
                        <AvatarImage src={organization.imageUrl ?? undefined} alt={organization.name} />
                        <AvatarFallback className="uppercase bg-primary text-primary-foreground">{nameInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl">{jobListing.title}</CardTitle>
                        <CardDescription className="text-base">{organization.name}</CardDescription>
                        {
                            jobListing.postedAt != null && (
                                <div className="text-sm font-medium text-primary @min-md:hidden">
                                    <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                                        <DaysSincePosting postedAt={jobListing.postedAt} />
                                    </Suspense>
                                </div>
                            )
                        }
                    </div>
                    {
                        jobListing.postedAt != null && (
                            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
                                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                                    <DaysSincePosting postedAt={jobListing.postedAt} />
                                </Suspense>
                            </div>
                        )
                    }
                </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <JobListingBadges jobListing={jobListing} className={jobListing.isFeatured ? "border-primary/35" : undefined} />
            </CardContent>
        </Card>
    )
}

async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
    await connection()
    const daysSincePosted = differenceInDays(postedAt, Date.now())

    if (daysSincePosted === 0) return <Badge>New</Badge>

    return new Intl.RelativeTimeFormat(undefined, { style: "narrow", numeric: "always" }).format(daysSincePosted, "days")
}

async function getJobListings(searchParams: z.infer<typeof searchParamsSchema>, jobListingId: string | undefined) {
    "use cache"
    cacheTag(getJobListGlobalTag())

    const whereConditions: (SQL | undefined)[] = []
    if (searchParams.title) {
        whereConditions.push(ilike(jobListTable.title, `%${searchParams.title}%`))
    }

    if (searchParams.locationRequirement) {
        whereConditions.push(eq(jobListTable.locationRequirement, searchParams.locationRequirement))
    }

    if (searchParams.city) {
        whereConditions.push(ilike(jobListTable.city, `%${searchParams.city}%`))
    }

    if (searchParams.state) {
        whereConditions.push(eq(jobListTable.stateAbbreviation, searchParams.state))
    }

    if (searchParams.experience) {
        whereConditions.push(eq(jobListTable.experienceLevel, searchParams.experience))
    }

    if (searchParams.type) {
        whereConditions.push(eq(jobListTable.type, searchParams.type))
    }

    if (searchParams.jobIds) {
        whereConditions.push(or(...searchParams.jobIds.map(jobId => eq(jobListTable.id, jobId))))
    }

    const data = await db.query.jobListTable.findMany({
        where: or(jobListingId
            ? and(eq(jobListTable.status, "published"), eq(jobListTable.id, jobListingId))
            : undefined, and(eq(jobListTable.status, "published"), ...whereConditions)),
        with: {
            organization: { columns: { id: true, name: true, imageUrl: true } },
        },
        orderBy: [desc(jobListTable.isFeatured), desc(jobListTable.postedAt)],
    })

    data.forEach(listing => { cacheTag(getOrgIdTag(listing.organization.id)) })
    return data
}