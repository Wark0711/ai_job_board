import { db } from "@/drizzle/db";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache/users";

export async function insertUser(user: typeof userTable.$inferInsert) {
    await db.insert(userTable).values(user).onConflictDoUpdate({
        target: userTable.id,
        set: user
    })

    revalidateUserCache(user.id)
}

export async function updateUser(id: string, user: Partial<typeof userTable.$inferInsert>) {
    await db.update(userTable).set(user).where(eq(userTable.id, id))
    revalidateUserCache(id)
}

export async function deleteUser(id: string) {
    await db.delete(userTable).where(eq(userTable.id, id))
    revalidateUserCache(id)
}