import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import DatePicker from "~/components/ui/date-picker";
import PhoneInput from "~/components/ui/phone-input";
import { PhotoProfileUpload } from "~/components/ui/photo-profile-upload";
import { jobsStorage, applicationsStorage } from "~/utils/storage";
import { applicationFormSchema, type ApplicationFormData } from "~/lib/validations/application-form";
import { type JobListItem } from "~/types";

export default function ApplicantJobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobListItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues: {
            photo_profile: "",
            full_name: "",
            date_of_birth: "",
            gender: undefined,
            domicile: "",
            phone_number: "",
            email: "",
            linkedin_link: "",
        },
    });

    useEffect(() => {
        if (id) {
            const jobData = jobsStorage.getById(id);
            if (jobData) {
                setJob(jobData);
            }
            setIsLoading(false);
        }
    }, [id]);

    const onSubmit = async (data: ApplicationFormData) => {
        try {
            if (!job) return;

            // Create application
            const application = applicationsStorage.create({
                jobId: job.id,
                applicantEmail: data.email,
                applicantName: data.full_name,
                fieldData: data,
                status: "pending",
            });

            console.log("Application submitted:", application);

            // Navigate back to jobs list
            navigate("/applicant/jobs");
        } catch (error) {
            console.error("Error submitting application:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main mx-auto"></div>
                    <p className="mt-2 text-neutral-70 text-m-regular">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-neutral-20 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl-bold text-neutral-100 mb-2">Job Not Found</h1>
                    <p className="text-m-regular text-neutral-70 mb-4">The job you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate("/applicant/jobs")}>
                        Back to Jobs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-20">
            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl">

                {/* Form Container */}
                <div className="bg-white border border-neutral-40 rounded-lg overflow-hidden">
                    {/* Header */}

                    {/* Form */}
                    <div className="p-10">
                        <div className="flex gap-4 items-start mb-6">
                            <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button
                                        size={"icon"}
                                        variant="outline"
                                        onClick={() => navigate("/applicant/jobs")}
                                    >
                                        <ArrowLeftIcon className="size-5 stroke-2" />
                                    </Button>
                                    <h1 className="text-xl-bold text-neutral-100">
                                        Apply {job.title} at Rakamin
                                    </h1>
                                </div>
                                <p className="text-m-regular text-neutral-70">
                                    ℹ️ This field required to fill
                                </p>
                            </div>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Required Field Notice */}
                                <p className="text-s-bold text-danger-main">* Required</p>

                                {/* Photo Profile */}
                                <FormField
                                    control={form.control}
                                    name="photo_profile"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <PhotoProfileUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={fieldState.error?.message}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-90">
                                                Full name<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your full name"
                                                    hasError={!!fieldState.error}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Date of Birth */}
                                <FormField
                                    control={form.control}
                                    name="date_of_birth"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Date of birth<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select date of birth"
                                                    hasError={!!fieldState.error}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Gender */}
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Pronoun (gender)<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className="flex gap-6"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="female" id="female" />
                                                        <Label htmlFor="female" className="text-m-regular text-neutral-100">
                                                            She/her (Female)
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="male" id="male" />
                                                        <Label htmlFor="male" className="text-m-regular text-neutral-100">
                                                            He/him (Male)
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Domicile */}
                                <FormField
                                    control={form.control}
                                    name="domicile"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Domicile<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger hasError={!!fieldState.error}>
                                                        <SelectValue placeholder="Choose your domicile" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="jakarta">Jakarta</SelectItem>
                                                        <SelectItem value="bandung">Bandung</SelectItem>
                                                        <SelectItem value="surabaya">Surabaya</SelectItem>
                                                        <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
                                                        <SelectItem value="medan">Medan</SelectItem>
                                                        <SelectItem value="makassar">Makassar</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone Number */}
                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Phone number<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    hasError={!!fieldState.error}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Email<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email address"
                                                    hasError={!!fieldState.error}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* LinkedIn Link */}
                                <FormField
                                    control={form.control}
                                    name="linkedin_link"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-s-regular text-neutral-100">
                                                Link Linkedin<span className="text-danger-main">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="url"
                                                    placeholder="https://linkedin.com/in/username"
                                                    hasError={!!fieldState.error}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>

                    {/* Submit Button - Fixed at bottom */}
                    <div className="px-10 py-6 border-t border-neutral-40">
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            className="w-full text-l-bold text-white shadow-button"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
