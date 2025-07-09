import { jobListAppTable } from "@/drizzle/schema"
import { Container, Head, Heading, Html, Section, Tailwind, Text } from "@react-email/components"
import tailwindConfig from "../data/config"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Application = Pick<typeof jobListAppTable.$inferSelect, "rating"> & {
    userName: string
    organizationId: string
    organizationName: string
    jobListingId: string
    jobListingTitle: string
}

export default function DailyApplicationEmail({ applications, userName, }: { applications: Application[], userName: string }) {
    return (
        <Tailwind config={tailwindConfig}>
            <Html>
                <Head />
                <Container className="font-sans">
                    <Heading as="h1">New Applications!</Heading>
                    <Text>Hi {userName}. Here are all the new applications for your job listings.</Text>
                    {
                        Object.entries(Object.groupBy(applications, a => a.organizationId)).map(([orgId, orgApplications], i) => {
                            if (orgApplications == null || orgApplications.length === 0) {
                                return null
                            }

                            return (
                                <OrganizationSection
                                    key={orgId}
                                    orgName={orgApplications[0].organizationName}
                                    applications={orgApplications}
                                    noMargin={i === 0}
                                />
                            )
                        })
                    }
                </Container>
            </Html>
        </Tailwind>
    )
}

function OrganizationSection({ orgName, applications, noMargin = false }: { orgName: string, applications: Application[], noMargin?: boolean }) {
    return (
        <Section className={noMargin ? undefined : "mt-8"}>
            <Heading as="h2" className="leading-none font-semibold text-3xl my-4">{orgName}</Heading>
            {
                Object.entries(Object.groupBy(applications, a => a.jobListingId)).map(
                    ([jobListingId, listingApplications], i) => {
                        if (listingApplications == null || listingApplications.length === 0) {
                            return null
                        }

                        return (
                            <JobListingCard
                                key={jobListingId}
                                jobListingTitle={listingApplications[0].jobListingTitle}
                                applications={listingApplications}
                                noMargin={i === 0}
                            />
                        )
                    }
                )
            }
        </Section>
    )
}

function JobListingCard({ jobListingTitle, applications, noMargin = false }: { jobListingTitle: string, applications: Application[], noMargin?: boolean }) {
    return (
        <div className={cn("bg-card text-card-foreground rounded-lg border p-4 border-primary border-solid", !noMargin && "mt-6")}>
            <Heading as="h3" className="leading-none font-semibold text-xl mt-0 mb-3">{jobListingTitle}</Heading>
            {
                applications.map((application, i) => (
                    <Text key={i} className="mt-2 mb-0">
                        <span>{application.userName}: </span>
                        <RatingIcons rating={application.rating} />
                    </Text>
                ))
            }
        </div>
    )
}

function RatingIcons({ rating }: { rating: string | null }) {
    if (rating == null || Number.parseInt(rating) < 1 || Number.parseInt(rating) > 5) {
        return "Unrated"
    }

    const stars: ReactNode[] = []
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className="w-3 -mb-[7px] mr-0.5">
                {Number.parseInt(rating) >= i ? "★" : "☆"}
            </span>
        )
    }

    return stars
}

DailyApplicationEmail.PreviewProps = {
    applications: [
        {
            organizationId: "org-1",
            organizationName: "Web Dev Simplified",
            jobListingId: "job-listing-1",
            jobListingTitle: "Software Engineer",
            rating: '2.00',
            userName: "Larry Cook",
        },
        {
            organizationId: "org-1",
            organizationName: "Web Dev Simplified",
            jobListingId: "job-listing-1",
            jobListingTitle: "Software Engineer",
            rating: '4.00',
            userName: "Jane Smith",
        },
        {
            organizationId: "org-1",
            organizationName: "Web Dev Simplified",
            jobListingId: "job-listing-2",
            jobListingTitle: "Backend Developer",
            rating: null,
            userName: "Jane Smith",
        },
        {
            organizationId: "org-2",
            organizationName: "Tech Innovations",
            jobListingId: "job-listing-3",
            jobListingTitle: "Frontend Developer",
            rating: '4.00',
            userName: "Jane Smith",
        },
    ],
    userName: "John Doe",
} satisfies Parameters<typeof DailyApplicationEmail>[0]