import { PricingTable } from "@clerk/nextjs";

export function ClerkPricingTable() {
    return (
        <PricingTable forOrganizations newSubscriptionRedirectUrl="/employer/pricing" />
    )
}