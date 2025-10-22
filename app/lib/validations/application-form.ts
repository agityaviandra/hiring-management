import { z } from "zod";
import { type JobConfiguration } from "~/types";

export const applicationFormSchema = z.object({
    photo_profile: z.string().min(1, "Photo profile is required"),
    full_name: z.string().min(1, "Full name is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["female", "male"], {
        message: "Please select your gender",
    }),
    domicile: z.string().min(1, "Domicile is required"),
    phone_number: z.string().min(1, "Phone number is required"),
    email: z.string().email("Please enter a valid email address"),
    linkedin_link: z.string().url("Please enter a valid LinkedIn URL"),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Function to check if a field is required based on job configuration
const isFieldRequired = (jobConfig: JobConfiguration | null, fieldKey: string): boolean => {
    if (!jobConfig) return true; // Make all fields required if no config found

    const sections = jobConfig.application_form?.sections || [];
    for (const section of sections) {
        const field = section.fields?.find(f => f.key === fieldKey);
        if (field) {
            return field.validation?.required || false;
        }
    }
    return false; // Field not found in configuration, not required
};

// Function to check if a field should be visible based on job configuration
const isFieldVisible = (jobConfig: JobConfiguration | null, fieldKey: string): boolean => {
    if (!jobConfig) return true; // Show all fields if no config found

    const sections = jobConfig.application_form?.sections || [];
    for (const section of sections) {
        const field = section.fields?.find(f => f.key === fieldKey);
        if (field) {
            return true; // Field is configured, so it should be visible
        }
    }
    return false; // Field not found in configuration, hide it
};

// Create dynamic validation schema based on job configuration
export const createDynamicApplicationSchema = (jobConfig: JobConfiguration | null) => {
    if (!jobConfig) {
        // If no config, use the original schema
        return applicationFormSchema;
    }

    const sections = jobConfig.application_form?.sections || [];
    const configuredFields = new Set<string>();

    // Collect all configured fields
    for (const section of sections) {
        for (const field of section.fields || []) {
            configuredFields.add(field.key);
        }
    }

    // Build schema based on configured fields
    const dynamicSchema: any = {};

    // Only include fields that are configured
    if (configuredFields.has("photo_profile")) {
        dynamicSchema.photo_profile = isFieldRequired(jobConfig, "photo_profile")
            ? z.string().min(1, "Photo profile is required")
            : z.string().optional();
    }

    if (configuredFields.has("full_name")) {
        dynamicSchema.full_name = isFieldRequired(jobConfig, "full_name")
            ? z.string().min(1, "Full name is required")
            : z.string().optional();
    }

    if (configuredFields.has("date_of_birth")) {
        dynamicSchema.date_of_birth = isFieldRequired(jobConfig, "date_of_birth")
            ? z.string().min(1, "Date of birth is required")
            : z.string().optional();
    }

    if (configuredFields.has("gender")) {
        dynamicSchema.gender = isFieldRequired(jobConfig, "gender")
            ? z.enum(["female", "male"], { message: "Please select your gender" })
            : z.enum(["female", "male"]).optional();
    }

    if (configuredFields.has("domicile")) {
        dynamicSchema.domicile = isFieldRequired(jobConfig, "domicile")
            ? z.string().min(1, "Domicile is required")
            : z.string().optional();
    }

    if (configuredFields.has("phone_number")) {
        dynamicSchema.phone_number = isFieldRequired(jobConfig, "phone_number")
            ? z.string().min(1, "Phone number is required")
            : z.string().optional();
    }

    if (configuredFields.has("email")) {
        dynamicSchema.email = isFieldRequired(jobConfig, "email")
            ? z.string().email("Please enter a valid email address")
            : z.string().email().optional();
    }

    if (configuredFields.has("linkedin_link")) {
        dynamicSchema.linkedin_link = isFieldRequired(jobConfig, "linkedin_link")
            ? z.string().url("Please enter a valid LinkedIn URL")
            : z.string().url().optional();
    }

    return z.object(dynamicSchema);
};

// Export helper functions for use in components
export { isFieldRequired, isFieldVisible };
