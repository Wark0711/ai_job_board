import { AppSidebarClient } from "@/components/sidebar/_AppSidebarClient";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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

          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton></SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">hajays</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
