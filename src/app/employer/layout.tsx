import { ReactNode, Suspense } from "react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarOrgButton } from "@/features/org/components/SidebarOrgButton";
import Link from "next/link";
import { hasOrgUserPermissions } from "@/services/clerk/lib/orgUserPermissions";
import { AsyncIf } from "@/components/AsyncIf";
import { jobListAppTable, JobListingStatus, jobListTable } from "@/drizzle/schema";
import { getJobListOrgTag } from "@/features/jobLists/db/cache/jobLists";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { db } from "@/drizzle/db";
import { count, desc, eq } from "drizzle-orm";
import { getJobListingApplicationJobListingTag } from "@/features/jobListApps/db/cache/jobListApps";
import { sortJobListingsByStatus } from "@/features/jobLists/lib/utils";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";

export default function EmployerLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <LayoutSuspense>{children}</LayoutSuspense>
        </Suspense>
    )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {

    const { orgId } = await getCurrentOrg()
    if (orgId == null) return redirect("/organizations/select")

    return (
        <AppSidebar
            content={
                <>
                    <SidebarGroup>
                        <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
                        <AsyncIf condition={() => hasOrgUserPermissions("org:job_listings:create")}>
                            <SidebarGroupAction title="Add Job Listing" asChild>
                                <Link href="/employer/job-listings/new">
                                    <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                                </Link>
                            </SidebarGroupAction>
                        </AsyncIf>
                        <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
                            <Suspense>
                                <JobListingMenu orgId={orgId} />
                            </Suspense>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarNavMenuGroup
                        className="mt-auto"
                        items={[
                            { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
                        ]}
                    />
                </>
            }
            footerButton={<SidebarOrgButton />}>
            {children}
        </AppSidebar>
    )
}

async function JobListingMenu({ orgId }: { orgId: string }) {
    const jobListings = await getJobListings(orgId)

    if (jobListings.length === 0 && (await hasOrgUserPermissions("org:job_listings:create"))) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/employer/job-listings/new">
                            <PlusIcon />
                            <span>Create your first job listing</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    function groupBy<T, K extends keyof any>(array: T[], keySelector: (item: T) => K): Record<K, T[]> {
        return array.reduce((acc, item) => {
            const key = keySelector(item);
            
            !acc[key] ? acc[key] = [] : acc[key].push(item);
            return acc;
        }, {} as Record<K, T[]>);
    }


    return Object.entries(groupBy(jobListings, j => j.status))
        .sort(([a], [b]) => {
            return sortJobListingsByStatus(a as JobListingStatus, b as JobListingStatus)
        })
        .map(([status, jobListings]) => (
            <JobListingMenuGroup key={status} status={status as JobListingStatus} jobListings={jobListings} />
        ))
}

async function getJobListings(orgId: string) {
    "use cache"
    cacheTag(getJobListOrgTag(orgId))

    const data = await db.select({
        id: jobListTable.id,
        title: jobListTable.title,
        status: jobListTable.status,
        applicationCount: count(jobListAppTable.userId),
    }).from(jobListTable).where(eq(jobListTable.organizationId, orgId)).leftJoin(
        jobListAppTable,
        eq(jobListTable.id, jobListAppTable.jobListingId)
    ).groupBy(jobListAppTable.jobListingId, jobListTable.id).orderBy(desc(jobListTable.createdAt))

    data.forEach(jobListing => {
        cacheTag(getJobListingApplicationJobListingTag(jobListing.id))
    })

    return data
}