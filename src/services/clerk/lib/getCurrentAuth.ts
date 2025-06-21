import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

export async function getCurrentUser({ allData = false } = {}) {
    const { userId } = await auth()

    return {
        userId,
        user: allData && userId != null ? await getUser(userId) : undefined,
    }
}

async function getUser(id: string) {
    return db.query.userTable.findFirst({where: eq(userTable.id, id)})
}