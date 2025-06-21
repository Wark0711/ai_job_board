import { AppSidebarClient } from "@/components/sidebar/_AppSidebarClient";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarUserButton } from "@/features/user/components/SidebarUserButton";
import { SignedIn, SignedOut } from "@/services/clerk/components/SignInStatus";
import { LogInIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar className="overflow-hidden" collapsible="icon">
          <SidebarHeader className="flex-row items-center">
            <SidebarTrigger />
            <span className="text-xl text-nowrap">WDTex Jobs</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SignedOut>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={'/sign-in'}>
                        <LogInIcon />
                        <span>Login</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SignedOut>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarUserButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1">hajays</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
