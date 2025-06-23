import { getGlobalTag, getIdTag, getOrgTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getJobListGlobalTag() {
    return getGlobalTag("jobListings")
}

export function getJobListOrgTag(orgId: string) {
    return getOrgTag("jobListings", orgId)
}

export function getJobListIdTag(id: string) {
    return getIdTag("jobListings", id)
}

export function revalidateJobListCache({ id, orgId }: { id: string, orgId: string }) {
    revalidateTag(getJobListGlobalTag())
    revalidateTag(getJobListOrgTag(orgId))
    revalidateTag(getJobListIdTag(id))
}