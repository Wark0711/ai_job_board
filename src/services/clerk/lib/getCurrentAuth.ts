import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/user/db/cache/users"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getCurrentUser({ allData = false } = {}) {
    const { userId } = await auth()

    return {
        userId,
        user: allData && userId != null ? await getUser(userId) : undefined,
    }
}

async function getUser(id: string) {
    'use cache'
    cacheTag(getUserIdTag(id))

    return db.query.userTable.findFirst({ where: eq(userTable.id, id) })
}