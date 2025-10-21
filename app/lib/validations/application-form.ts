import { z } from "zod";

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
