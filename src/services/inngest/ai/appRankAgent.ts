import { env } from "@/data/env/server"
import { updateJobListingApplication } from "@/features/jobListApps/db/jobListApps"
import { createAgent, createTool, gemini } from "@inngest/agent-kit"
import { z } from "zod"

const saveApplicantRatingTool = createTool({
    name: "save-applicant-ranking",
    description: "Saves the applicant's ranking for a specific job listing in the database",
    parameters: z.object({
        jobListId: z.string(),
        userId: z.string(),
        rating: z.number().max(5.00).min(0.00).refine((val) => {
            const [intPart, decimalPart = ''] = val.toString().split('.');
            return intPart.length + decimalPart.length <= 4 && decimalPart.length <= 2;
        }),
    }),
    handler: async ({ jobListId, rating, userId }) => {
        await updateJobListingApplication({ jobListId, userId }, { rating: String(rating) })

        return "Successfully saved applicant ranking score."
    },
})

export const applicantRankingAgent = createAgent({
    name: "Applicant Ranking Agent",
    description: "Agent for ranking job applicants for specific job listings based on their resume and cover letter.",
    system: "You are an expert at ranking job applicants for specific jobs based on their resume and cover letter. You will be provided with a user prompt that includes a user's id, resume and cover letter as well as the job listing they are applying for in JSON. Your task is to compare the job listing with the applicant's resume and cover letter and provide a rating for the applicant on how well they fit that specific job listing. The rating should be a number between 1 and 5, where 5 is the highest rating indicating a perfect or near perfect match. A rating 3 should be used for applicants that barely meet the requirements of the job listing, while a rating of 1 should be used for applicants that do not meet the requirements at all. You should save this user rating in the database and not return any output.",
    tools: [saveApplicantRatingTool],
    model: gemini({
        model: "gemini-2.0-flash",
        apiKey: env.GEMINI_API_KEY,
    }),
})