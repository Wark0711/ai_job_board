import { ReactNode, Suspense } from "react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel } from "@/components/ui/sidebar";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarOrgButton } from "@/features/org/components/SidebarOrgButton";
import Link from "next/link";

export default function EmployerLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <LayoutSuspense>{children}</LayoutSuspense>
        </Suspense>
    )
}

function LayoutSuspense({ children }: { children: ReactNode }) {
    return (
        <AppSidebar
            content={
                <>
                    <SidebarGroup>
                        <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
                        <SidebarGroupAction title="Add Job Listing" asChild>
                            <Link href={'/employer/job-listings/new'}>
                                <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                            </Link>
                        </SidebarGroupAction>
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