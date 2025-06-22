import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarUserButton } from "@/features/user/components/SidebarUserButton";
import { BrainCircuitIcon, ClipboardListIcon, LayoutDashboardIcon, LogInIcon } from "lucide-react";
import { ReactNode } from "react";

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
    return (
        <AppSidebar
            content={
                <>
                    <SidebarNavMenuGroup
                        className="mt-auto"
                        items={[
                            { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
                            { href: "/ai-search", icon: <BrainCircuitIcon />, label: "AI Search", },
                            { href: "/employer", icon: <LayoutDashboardIcon />, label: "Employer Dashboard", authStatus: "signedIn", },
                            { href: "/sign-in", icon: <LogInIcon />, label: "Sign In", authStatus: "signedOut", },
                        ]}
                    />
                </>
            }
            footerButton={<SidebarUserButton />}>
            {children}
        </AppSidebar>
    )
}