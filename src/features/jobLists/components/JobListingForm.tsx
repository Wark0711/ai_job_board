'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { jobListSchema } from "../actions/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { experienceLevels, jobListingTypes, locationRequirements, wageIntervals } from "@/drizzle/schema"
import { formatExperienceLevel, formatJobType, formatLocationRequirement, formatWageInterval } from "../lib/formatters"
import { StateSelectItems } from "./StateSelectItems"
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/LoadingSwap"
import { createJobListing } from "../actions/action"
import { toast } from "sonner"

export function JobListingForm() {

    const form = useForm({
        resolver: zodResolver(jobListSchema),
        defaultValues: {
            title: "",
            description: "",
            experienceLevel: "junior",
            locationRequirement: "in-office",
            wage: null,
            wageInterval: "yearly",
            type: "full-time",
            stateAbbreviation: null,
            city: null,
        },
    })

    async function onSubmit(data: z.infer<typeof jobListSchema>) {
        const res = await createJobListing(data)

        if (res.error) {
            toast.error(res.message)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 @container">
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                    <FormField
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="wage"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wage</FormLabel>
                                <div className="flex">
                                    <FormControl>
                                        <Input {...field} type="number" min={0} value={field.value ?? ""} className="rounded-r-none"
                                            onChange={e =>
                                                field.onChange(
                                                    isNaN(e.target.valueAsNumber)
                                                        ? null
                                                        : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormField
                                        name="wageInterval"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select value={field.value ?? ""} onValueChange={val => field.onChange(val ?? null)}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-l-none">
                                                            / <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            wageIntervals.map(interval => (
                                                                <SelectItem key={interval} value={interval}>
                                                                    {formatWageInterval(interval)}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                    <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
                        <FormField
                            name="city"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="stateAbbreviation"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <Select value={field.value ?? ""} onValueChange={val => field.onChange(val ?? null)}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                field.value !== null && (
                                                    <SelectItem value={NONE_SELECT_VALUE} className="text-muted-foreground">Clear</SelectItem>
                                                )
                                            }
                                            <StateSelectItems />
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        name="locationRequirement"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Requirement</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            locationRequirements.map(lr => (
                                                <SelectItem key={lr} value={lr}>
                                                    {formatLocationRequirement(lr)}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
                    <FormField
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Type</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            jobListingTypes.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {formatJobType(type)}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="experienceLevel"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            experienceLevels.map(experience => (
                                                <SelectItem key={experience} value={experience}>
                                                    {formatExperienceLevel(experience)}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <MarkdownEditor {...field} markdown={field.value} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                    <LoadingSwap isLoading={form.formState.isSubmitting}>Create Job Listing</LoadingSwap>
                </Button>
            </form>
        </Form>
    )
}

const NONE_SELECT_VALUE = "none"