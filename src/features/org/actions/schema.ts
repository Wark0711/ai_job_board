import { z } from "zod"

export const organizationUserSettingsSchema = z.object({
    newApplicationEmailNotifications: z.boolean(),
    minimumRating: z.string().nullable(),
})