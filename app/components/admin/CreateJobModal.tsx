import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CurrencyDollarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "~/components/ui/toast";
import { jobsStorage } from "~/utils/storage";
import { type Job, type ApplicationField, STANDARD_FIELDS, type FieldVisibility } from "~/types";

const jobSchema = z.object({
    title: z.string().min(1, "Job title is required").max(100, "Title must be less than 100 characters"),
    jobType: z.string().min(1, "Job type is required"),
    description: z.string().min(1, "Job description is required").max(2000, "Description must be less than 2000 characters"),
    candidateCount: z.number().min(1, "Number of candidates must be at least 1"),
    salaryMin: z.number().min(0, "Minimum salary must be positive"),
    salaryMax: z.number().min(0, "Maximum salary must be positive"),
}).refine((data) => data.salaryMax >= data.salaryMin, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
});

type JobFormData = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobToEdit?: Job;
    onJobSaved?: () => void;
}

export function CreateJobModal({ isOpen, onClose, jobToEdit, onJobSaved }: CreateJobModalProps) {
    const navigate = useNavigate();
    const [applicationFields, setApplicationFields] = useState<ApplicationField[]>(() => {
        if (jobToEdit) {
            return jobToEdit.applicationFields;
        }
        // Initialize with standard fields as optional
        return STANDARD_FIELDS.map((field, index) => ({
            id: crypto.randomUUID(),
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            label: field.label,
            placeholder: field.placeholder,
            validation: field.validation,
            visibility: 'optional' as FieldVisibility,
            order: index,
        }));
    });

    const form = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: jobToEdit ? {
            title: jobToEdit.title,
            jobType: "full-time",
            description: jobToEdit.description,
            candidateCount: undefined,
            salaryMin: undefined,
            salaryMax: undefined,
        } : {
            title: "",
            jobType: "",
            description: "",
            candidateCount: undefined,
            salaryMin: undefined,
            salaryMax: undefined,
        },
    });

    const onSubmit = async (data: JobFormData) => {
        try {
            const jobData = {
                title: data.title,
                description: data.description,
                location: "Remote", // Default location for now
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                status: 'draft' as const,
                applicationFields: applicationFields.sort((a, b) => a.order - b.order),
            };

            if (jobToEdit) {
                jobsStorage.update(jobToEdit.id, jobData);
                toast.success({
                    title: "Job vacancy successfully updated",
                });
            } else {
                jobsStorage.create(jobData);
                toast.success({
                    title: "Job vacancy successfully created",
                });
            }

            // Refresh the jobs list in the parent component
            if (onJobSaved) {
                onJobSaved();
            }

            onClose();
            form.reset();
            navigate('/admin/jobs', { replace: true });
        } catch (error) {
            console.error('Error saving job:', error);
            toast.error({
                title: "Failed to save job",
                description: "There was an error saving the job. Please try again."
            });
        }
    };

    const handleFieldVisibilityChange = (fieldId: string, visibility: FieldVisibility) => {
        setApplicationFields(prev =>
            prev.map(field =>
                field.id === fieldId ? { ...field, visibility } : field
            )
        );
    };

    const getVisibilityColor = (visibility: FieldVisibility) => {
        if (visibility) {
            return 'bg-white border-primary-main text-primary-main';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                {/* Header */}
                <div className="bg-white border-b border-neutral-40 px-6 py-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <DialogHeader>
                            <DialogTitle>Job Opening</DialogTitle>
                        </DialogHeader>
                        <button
                            onClick={onClose}
                            className="w-6 h-6 flex items-center justify-center hover:bg-neutral-20 rounded"
                        >
                            <XMarkIcon onClick={() => form.reset()} className="w-4 h-4 text-neutral-70" />
                        </button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 pt-0">
                        {/* Basic Job Information */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Name<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex. Front End Engineer"

                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-s-regular text-danger-main" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="jobType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Type<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select job type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full-time">Full-time</SelectItem>
                                                    <SelectItem value="part-time">Part-time</SelectItem>
                                                    <SelectItem value="contract">Contract</SelectItem>
                                                    <SelectItem value="internship">Internship</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-s-regular text-danger-main" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Description<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex."
                                                rows={4}
                                                enableBulletList={true}
                                                className="border-2 border-neutral-30 focus:border-primary-main focus:ring-2 focus:ring-primary-focus"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-s-regular text-danger-main" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="candidateCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Number of Candidate Needed<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Ex. 2"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-s-regular text-danger-main" />
                                    </FormItem>
                                )}
                            />

                            {/* Salary Section */}
                            <div className="space-y-4">
                                <div className="border-t border-neutral-30 pt-4">
                                    <div className="text-s-regular text-neutral-70">Job Salary</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="salaryMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-70">
                                                    Minimum Estimated Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="7.000.000"
                                                        icon={
                                                            <span className="text-m-bold text-neutral-90">
                                                                Rp
                                                            </span>
                                                        }
                                                        iconPosition="left"
                                                        pattern="^[0-9.,]+$"
                                                        value={field.value ? field.value.toLocaleString('id-ID') : ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Allow only numbers, periods, and commas
                                                            if (/^[0-9.,]*$/.test(value)) {
                                                                // Remove periods and commas, then parse as integer
                                                                const numericValue = parseInt(value.replace(/[.,]/g, ''));
                                                                field.onChange(numericValue);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-s-regular text-danger-main" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="salaryMax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-70">
                                                    Maximum Estimated Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="8.000.000"
                                                        icon={
                                                            <span className="text-m-bold text-neutral-90">
                                                                Rp
                                                            </span>
                                                        }
                                                        iconPosition="left"
                                                        pattern="^[0-9.,]+$"
                                                        value={field.value ? field.value.toLocaleString('id-ID') : ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Allow only numbers, periods, and commas
                                                            if (/^[0-9.,]*$/.test(value)) {
                                                                // Remove periods and commas, then parse as integer
                                                                const numericValue = parseInt(value.replace(/[.,]/g, ''));
                                                                field.onChange(numericValue);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-s-regular text-danger-main" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Application Fields Configuration */}
                        <div className="bg-white border border-neutral-30 rounded-lg p-4 space-y-4">
                            <h3 className="text-m-bold text-neutral-70">Minimum Profile Information Required</h3>

                            <div className="space-y-2">
                                {applicationFields.map((field) => (
                                    <div key={field.id} className="flex items-center justify-between p-2 border-b border-neutral-30 last:border-b-0">
                                        <div className="flex-1">
                                            <p className="text-m-regular text-neutral-70">{field.label}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {(['mandatory', 'optional', 'hidden'] as const).map((visibility) => (
                                                <Button
                                                    key={visibility}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFieldVisibilityChange(field.id, visibility)}
                                                    className={`px-3 py-1 text-xs rounded-full ${field.visibility === visibility
                                                        ? getVisibilityColor(visibility)
                                                        : 'bg-neutral-20 border-neutral-40 text-neutral-70'
                                                        }`}
                                                >
                                                    {visibility === 'hidden' ? 'Off' : visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-6 border-t border-neutral-30">
                            <Button
                                variant={"default"}
                                type="submit"
                                disabled={!form.formState.dirtyFields}
                            >
                                {form.formState.isSubmitting ? 'Publishing...' : 'Publish Job'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}