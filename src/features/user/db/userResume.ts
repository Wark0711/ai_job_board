import { db } from "@/drizzle/db"
import { userResumeTable } from "@/drizzle/schema"
import { revalidateUserResumeCache } from "./cache/userResume"
import { eq } from "drizzle-orm"

export async function upsertUserResume(userId: string, data: Omit<typeof userResumeTable.$inferInsert, "userId">) {
    await db.insert(userResumeTable).values({ userId, ...data }).onConflictDoUpdate({
        target: userResumeTable.userId,
        set: data,
    })

    revalidateUserResumeCache(userId)
}

export async function updateUserResume(userId: string, data: Partial<Omit<typeof userResumeTable.$inferInsert, "userId">>) {
    await db.update(userResumeTable).set(data).where(eq(userResumeTable.userId, userId))

    revalidateUserResumeCache(userId)
}