"use server"

import { z } from "zod"
import { organizationUserSettingsSchema } from "./schema"
import { getCurrentOrg, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { updateOrgUserSettings } from "../db/orgUserSettings"

export async function updateOrganizationUserSettings(unsafeData: z.infer<typeof organizationUserSettingsSchema>) {
    const { userId } = await getCurrentUser()
    const { orgId } = await getCurrentOrg()
    if (userId == null || orgId == null) return { error: true, message: "You must be signed in to update notification settings" }

    const { success, data } = organizationUserSettingsSchema.safeParse(unsafeData)
    if (!success) return { error: true, message: "There was an error updating your notification settings" }

    await updateOrgUserSettings({ userId, organizationId: orgId, }, data)
    return { error: false, message: "Successfully updated your notification settings", }
}