import { jobListAppTable, jobListTable, userResumeTable } from "@/drizzle/schema";
import { inngest } from "../client";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { applicantRankingAgent } from "../ai/appRankAgent";

export const rankApp = inngest.createFunction(
    { id: 'rank-applicant', name: 'Rank Applicant' },
    { event: 'app/jobListingApplication.created' },
    async ({ step, event }) => {
        const { userId, jobListId } = event.data

        const getCoverLetter = step.run("get-cover-letter", async () => {
            const application = await db.query.jobListAppTable.findFirst({
                where: and(eq(jobListAppTable.userId, userId), eq(jobListAppTable.jobListingId, jobListId)),
                columns: { coverLetter: true },
            })

            return application?.coverLetter
        })

        const getResume = step.run("get-resume", async () => {
            const resume = await db.query.userResumeTable.findFirst({
                where: eq(userResumeTable.userId, userId),
                columns: { aiSummary: true },
            })

            return resume?.aiSummary
        })

        const getJobListing = step.run("get-job-listing", async () => {
            return await db.query.jobListTable.findFirst({
                where: eq(jobListTable.id, jobListId),
                columns: {
                    id: true,
                    city: true,
                    description: true,
                    experienceLevel: true,
                    locationRequirement: true,
                    stateAbbreviation: true,
                    title: true,
                    wage: true,
                    wageInterval: true,
                    type: true,
                },
            })
        })

        const [coverLetter, resumeSummary, jobListing] = await Promise.all([getCoverLetter, getResume, getJobListing])
        if (resumeSummary == null || jobListing == null) return

        await applicantRankingAgent.run(JSON.stringify({ coverLetter, resumeSummary, jobListId, userId }))
    }
)