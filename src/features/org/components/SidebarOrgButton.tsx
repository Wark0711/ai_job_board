import { Suspense } from "react"
import { getCurrentOrg, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { SignOutButton } from "@/services/clerk/components/AuthButtons"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { LogOutIcon } from "lucide-react"
import { SidebarOrgButtonClient } from "./_SidebarOrgButtonClient"

export function SidebarOrgButton() {
    return (
        <Suspense>
            <SidebarOrgSuspense />
        </Suspense>
    )
}

async function SidebarOrgSuspense() {
    const [{ user }, { org }] = await Promise.all([getCurrentUser({ allData: true }), getCurrentOrg({ allData: true })])

    if (user == null || org == null) {
        return (
            <SignOutButton>
                <SidebarMenuButton>
                    <LogOutIcon />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SignOutButton>
        )
    }

    return (
        <SidebarOrgButtonClient user={user} org={org} />
    )
}