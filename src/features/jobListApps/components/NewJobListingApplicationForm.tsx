"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { newJobListAppnSchema } from "../actions/schema"
import { z } from "zod"
import { toast } from "sonner"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/LoadingSwap"
import { createJobListApp } from "../actions/action"

export function NewJobListingApplicationForm({ jobListId }: { jobListId: string }) {

    const form = useForm({
        resolver: zodResolver(newJobListAppnSchema),
        defaultValues: { coverLetter: "" },
    })

    async function onSubmit(data: z.infer<typeof newJobListAppnSchema>) {
        const results = await createJobListApp(jobListId, data)
    
        if (results.error) {
          toast.error(results.message)
          return
        }
    
        toast.success(results.message)
      }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    name="coverLetter"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                                <MarkdownEditor {...field} markdown={field.value ?? ""} />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                    <LoadingSwap isLoading={form.formState.isSubmitting}>Apply</LoadingSwap>
                </Button>
            </form>
        </Form>
    )
}