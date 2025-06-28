import { db } from "@/drizzle/db"
import { userResumeTable } from "@/drizzle/schema"
import { revalidateUserResumeCache } from "./cache/userResume"

export async function upsertUserResume(userId: string, data: Omit<typeof userResumeTable.$inferInsert, "userId">) {
    await db.insert(userResumeTable).values({ userId, ...data }).onConflictDoUpdate({
        target: userResumeTable.userId,
        set: data,
    })

    revalidateUserResumeCache(userId)
}