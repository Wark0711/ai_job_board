import { z } from "zod"

export const newJobListAppnSchema = z.object({
    coverLetter: z.string().transform(val => (val.trim() === "" ? null : val)).nullable(),
})