import { inngest } from '@/services/inngest/client'
import { clerkCreateOrg, clerkCreateUser, clerkDeleteOrg, clerkDeleteUser, clerkUpdateOrg, clerkUpdateUser } from '@/services/inngest/functions/clerk'
import { serve } from 'inngest/next'

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrg, clerkUpdateOrg, clerkDeleteOrg]
})