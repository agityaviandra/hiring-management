import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "~/components/ui/toast";
import { jobsStorage, jobConfigStorage } from "~/utils/storage";
import { type JobListItem, type ApplicationField, type FieldVisibility, STANDARD_FIELDS } from "~/types";
import { jobSchema, type JobFormData } from "~/lib/validations/job-form";



interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJobSaved?: () => void;
}

export function CreateJobModal({ isOpen, onClose, onJobSaved }: CreateJobModalProps) {
    const navigate = useNavigate();
    const [applicationFields, setApplicationFields] = useState<ApplicationField[]>(STANDARD_FIELDS);
    const [profilePicture, setProfilePicture] = useState<string>("");

    const form = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
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
            // Create slug from title
            const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            // Format salary display text
            const formatSalary = (amount: number) => {
                return `Rp${amount.toLocaleString('id-ID')}`;
            };

            const jobData = {
                slug,
                title: data.title,
                status: 'active' as const,
                salary_range: {
                    min: data.salaryMin,
                    max: data.salaryMax,
                    currency: 'IDR',
                    display_text: `${formatSalary(data.salaryMin)} - ${formatSalary(data.salaryMax)}`
                },
                list_card: {
                    badge: 'Active',
                    started_on_text: `started on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                    cta: 'Manage Job'
                }
            };

            let savedJob: JobListItem;
            savedJob = jobsStorage.create(jobData);
            toast.success({
                title: "Job vacancy successfully created",
            });

            // Save the job configuration - filter out hidden fields and convert visibility to backend format
            const backendFields = applicationFields
                .filter(field => field.validation.visibility !== 'hidden')
                .map(field => ({
                    key: field.key,
                    validation: {
                        required: field.validation.visibility === 'mandatory'
                    }
                }));

            jobConfigStorage.set(savedJob.id, {
                application_form: {
                    sections: [
                        {
                            title: "Minimum Profile Information Required",
                            fields: backendFields
                        }
                    ]
                }
            });

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

    const handleFieldVisibilityChange = (fieldKey: string, visibility: FieldVisibility) => {
        setApplicationFields(prev =>
            prev.map(field =>
                field.key === fieldKey ? {
                    ...field,
                    validation: {
                        required: visibility === 'mandatory',
                        visibility
                    }
                } : field
            )
        );
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
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Name<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex. Front End Engineer"
                                                hasError={!!fieldState.error}
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
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Type<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger hasError={!!fieldState.error}>
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
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Job Description<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex."
                                                rows={4}
                                                enableBulletList={true}
                                                hasError={!!fieldState.error}
                                                // className="border-2 border-neutral-30 focus:border-primary-main focus:ring-2 focus:ring-primary-focus"
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
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-s-regular text-neutral-70">
                                            Number of Candidate Needed<span className="text-danger-main">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Ex. 2"
                                                hasError={!!fieldState.error}
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
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-70">
                                                    Minimum Estimated Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="7.000.000"
                                                        hasError={!!fieldState.error}
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
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-70">
                                                    Maximum Estimated Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="8.000.000"
                                                        hasError={!!fieldState.error}
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
                                    <div key={field.key} className="flex items-center justify-between p-2 border-b border-neutral-30 last:border-b-0">
                                        <div className="flex-1">
                                            <p className="text-m-regular text-neutral-70">{field.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {(['mandatory', 'optional', 'hidden'] as const).map((visibility) => (
                                                <Button
                                                    key={visibility}
                                                    type="button"
                                                    disabled={
                                                        ['full_name', 'photo_profile', 'email'].includes(field.key)
                                                            ? visibility === 'optional' || visibility === 'hidden'
                                                            : false
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFieldVisibilityChange(field.key, visibility)}
                                                    className={`px-3 py-1 text-xs rounded-full ${field.validation.visibility === visibility
                                                        ? "bg-white border-primary-main text-primary-main"
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