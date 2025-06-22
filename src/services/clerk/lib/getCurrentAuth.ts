import { db } from "@/drizzle/db"
import { orgTable, userTable } from "@/drizzle/schema"
import { getOrgIdTag } from "@/features/org/db/cache/org"
import { getUserIdTag } from "@/features/user/db/cache/users"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getCurrentUser({ allData = false } = {}) {
    const { userId } = await auth()

    return { userId, user: allData && userId != null ? await getUser(userId) : undefined }
}

export async function getCurrentOrg({ allData = false } = {}) {
    const { orgId } = await auth()

    return { orgId, org: allData && orgId != null ? await getOrg(orgId) : undefined }
}

async function getUser(id: string) {
    'use cache'
    cacheTag(getUserIdTag(id))

    return db.query.userTable.findFirst({ where: eq(userTable.id, id) })
}

async function getOrg(id: string) {
    'use cache'
    cacheTag(getOrgIdTag(id))

    return db.query.orgTable.findFirst({ where: eq(orgTable.id, id) })
}