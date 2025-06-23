import { ExperienceLevel, JobListingStatus, JobListingType, LocationRequirement, WageInterval } from "@/drizzle/schema"

export function formatWageInterval(interval: WageInterval) {
    switch (interval) {
        case "hourly":
            return "Hour"
        case "yearly":
            return "Year"
        default:
            throw new Error(`Invalid wage interval: ${interval satisfies never}`)
    }
}

export function formatLocationRequirement(locationRequirement: LocationRequirement) {
    switch (locationRequirement) {
        case "remote":
            return "Remote"
        case "in-office":
            return "In Office"
        case "hybrid":
            return "Hybrid"
        default:
            throw new Error(`Unknown location requirement: ${locationRequirement satisfies never}`)
    }
}

export function formatExperienceLevel(experienceLevel: ExperienceLevel) {
    switch (experienceLevel) {
        case "junior":
            return "Junior"
        case "mid-level":
            return "Mid Level"
        case "senior":
            return "Senior"
        default:
            throw new Error(
                `Unknown experience level: ${experienceLevel satisfies never}`
            )
    }
}

export function formatJobType(type: JobListingType) {
    switch (type) {
        case "full-time":
            return "Full Time"
        case "part-time":
            return "Part Time"
        case "internship":
            return "Internship"
        default:
            throw new Error(`Unknown job type: ${type satisfies never}`)
    }
}

export function formatJobListingStatus(status: JobListingStatus) {
    switch (status) {
        case "published":
            return "Active"
        case "draft":
            return "Draft"
        case "delisted":
            return "Delisted"
        default:
            throw new Error(`Unknown status: ${status satisfies never}`)
    }
}