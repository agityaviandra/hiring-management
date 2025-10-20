import z from "zod";

export const jobSchema = z.object({
    title: z.string().min(1, "Job title is required").max(100, "Title must be less than 100 characters"),
    jobType: z.string().min(1, "Job type is required"),
    description: z.string().min(1, "Job description is required").max(2000, "Description must be less than 2000 characters"),
    candidateCount: z.number({ message: "Number of candidates is required" }).min(1, "Number of candidates must be at least 1"),
    salaryMin: z.number({ message: "Minimum estimated salary is required" }).min(0, "Minimum estimated salary must be positive"),
    salaryMax: z.number({ message: "Maximum estimated salary is required" }).min(0, "Maximum estimated alary must be positive"),
}).refine((data) => data.salaryMax >= data.salaryMin, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
});
export type JobFormData = z.infer<typeof jobSchema>;