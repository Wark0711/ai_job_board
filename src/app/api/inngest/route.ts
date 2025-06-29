import { inngest } from '@/services/inngest/client'
import { clerkCreateOrg, clerkCreateUser, clerkDeleteOrg, clerkDeleteUser, clerkUpdateOrg, clerkUpdateUser } from '@/services/inngest/functions/clerk'
import { rankApp } from '@/services/inngest/functions/jobListApp'
import { createAiSummaryOfUploadedResume } from '@/services/inngest/functions/resume'
import { serve } from 'inngest/next'

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrg, clerkUpdateOrg, clerkDeleteOrg, createAiSummaryOfUploadedResume, rankApp]
})