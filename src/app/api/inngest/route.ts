import { inngest } from '@/services/inngest/client'
import { clerkCreateOrg, clerkCreateOrgMembership, clerkCreateUser, clerkDeleteOrg, clerkDeleteOrgMembership, clerkDeleteUser, clerkUpdateOrg, clerkUpdateUser } from '@/services/inngest/functions/clerk'
import { prepareDailyUserJobListingNotifications, sendDailyUserJobListingEmail } from '@/services/inngest/functions/emails'
import { rankApp } from '@/services/inngest/functions/jobListApp'
import { createAiSummaryOfUploadedResume } from '@/services/inngest/functions/resume'
import { serve } from 'inngest/next'

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrg, clerkUpdateOrg, clerkDeleteOrg, clerkCreateOrgMembership, clerkDeleteOrgMembership, createAiSummaryOfUploadedResume, rankApp, sendDailyUserJobListingEmail, prepareDailyUserJobListingNotifications]
})