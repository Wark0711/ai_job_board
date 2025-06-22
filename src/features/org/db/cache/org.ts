import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getOrgGlobalTag() {
    return getGlobalTag("organizations")
}

export function getOrgIdTag(id: string) {
    return getIdTag("organizations", id)
}

export function revalidateOrgCache(id: string) {
    revalidateTag(getOrgGlobalTag())
    revalidateTag(getOrgIdTag(id))
}