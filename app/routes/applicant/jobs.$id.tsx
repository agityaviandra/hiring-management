import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Combobox } from "~/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import DatePicker from "~/components/ui/date-picker";
import PhoneInput from "~/components/ui/phone-input";
import { PhotoProfileUpload } from "~/components/ui/photo-profile-upload";
import { jobsStorage, applicationsStorage, jobConfigStorage } from "~/utils/storage";
import {
    applicationFormSchema,
    type ApplicationFormData,
    createDynamicApplicationSchema,
    isFieldRequired,
    isFieldVisible
} from "~/lib/validations/application-form";
import { type JobListItem, type JobConfiguration } from "~/types";

// Domicile options
const domicileOptions = [
    { value: "Kabupaten Aceh Barat - Aceh", label: "Kabupaten Aceh Barat - Aceh" },
    { value: "Kabupaten Aceh Besar - Aceh", label: "Kabupaten Aceh Besar - Aceh" },
    { value: "Kabupaten Aceh Selatan - Aceh", label: "Kabupaten Aceh Selatan - Aceh" },
    { value: "Kabupaten Aceh Tamiang - Aceh", label: "Kabupaten Aceh Tamiang - Aceh" },
    { value: "Kabupaten Aceh Tengah - Aceh", label: "Kabupaten Aceh Tengah - Aceh" },
    { value: "Kabupaten Aceh Tenggara - Aceh", label: "Kabupaten Aceh Tenggara - Aceh" },
    { value: "Kabupaten Aceh Utara - Aceh", label: "Kabupaten Aceh Utara - Aceh" },
    { value: "Kota Banda Aceh - Aceh", label: "Kota Banda Aceh - Aceh" },
    { value: "Kota Langsa - Aceh", label: "Kota Langsa - Aceh" },
    { value: "Kota Lhokseumawe - Aceh", label: "Kota Lhokseumawe - Aceh" },
    { value: "Kota Sabang - Aceh", label: "Kota Sabang - Aceh" },
    { value: "Kota Subulussalam - Aceh", label: "Kota Subulussalam - Aceh" },
    { value: "Kabupaten Badung - Bali", label: "Kabupaten Badung - Bali" },
    { value: "Kabupaten Bangli - Bali", label: "Kabupaten Bangli - Bali" },
    { value: "Kabupaten Buleleng - Bali", label: "Kabupaten Buleleng - Bali" },
    { value: "Kabupaten Gianyar - Bali", label: "Kabupaten Gianyar - Bali" },
    { value: "Kabupaten Rembang - Jawa Tengah", label: "Kabupaten Rembang - Jawa Tengah" },
    { value: "Kabupaten Semarang - Jawa Tengah", label: "Kabupaten Semarang - Jawa Tengah" },
    { value: "Kabupaten Sragen - Jawa Tengah", label: "Kabupaten Sragen - Jawa Tengah" },
    { value: "Kabupaten Sukoharjo - Jawa Tengah", label: "Kabupaten Sukoharjo - Jawa Tengah" },
    { value: "Kabupaten Tegal - Jawa Tengah", label: "Kabupaten Tegal - Jawa Tengah" },
    { value: "Kabupaten Temanggung - Jawa Tengah", label: "Kabupaten Temanggung - Jawa Tengah" },
    { value: "Kabupaten Wonogiri - Jawa Tengah", label: "Kabupaten Wonogiri - Jawa Tengah" },
    { value: "Kabupaten Wonosobo - Jawa Tengah", label: "Kabupaten Wonosobo - Jawa Tengah" },
    { value: "Kota Magelang - Jawa Tengah", label: "Kota Magelang - Jawa Tengah" },
    { value: "Kota Pekalongan - Jawa Tengah", label: "Kota Pekalongan - Jawa Tengah" },
    { value: "Kota Salatiga - Jawa Tengah", label: "Kota Salatiga - Jawa Tengah" },
    { value: "Kota Semarang - Jawa Tengah", label: "Kota Semarang - Jawa Tengah" },
    { value: "Kota Surakarta - Jawa Tengah", label: "Kota Surakarta - Jawa Tengah" },
    { value: "Kota Tegal - Jawa Tengah", label: "Kota Tegal - Jawa Tengah" },
    { value: "Kabupaten Bangkalan - Jawa Timur", label: "Kabupaten Bangkalan - Jawa Timur" },
    { value: "Kabupaten Banyuwangi - Jawa Timur", label: "Kabupaten Banyuwangi - Jawa Timur" },
    { value: "Kabupaten Blitar - Jawa Timur", label: "Kabupaten Blitar - Jawa Timur" },
    { value: "Kabupaten Bojonegoro - Jawa Timur", label: "Kabupaten Bojonegoro - Jawa Timur" },
    { value: "Kabupaten Bondowoso - Jawa Timur", label: "Kabupaten Bondowoso - Jawa Timur" },
    { value: "Kabupaten Gresik - Jawa Timur", label: "Kabupaten Gresik - Jawa Timur" },
    { value: "Kabupaten Jember - Jawa Timur", label: "Kabupaten Jember - Jawa Timur" },
    { value: "Kabupaten Jombang - Jawa Timur", label: "Kabupaten Jombang - Jawa Timur" },
    { value: "Kabupaten Kediri - Jawa Timur", label: "Kabupaten Kediri - Jawa Timur" },
    { value: "Kabupaten Lamongan - Jawa Timur", label: "Kabupaten Lamongan - Jawa Timur" },
    { value: "Kabupaten Lumajang - Jawa Timur", label: "Kabupaten Lumajang - Jawa Timur" },
    { value: "Kabupaten Madiun - Jawa Timur", label: "Kabupaten Madiun - Jawa Timur" },
    { value: "Kabupaten Magetan - Jawa Timur", label: "Kabupaten Magetan - Jawa Timur" },
    { value: "Kabupaten Malang - Jawa Timur", label: "Kabupaten Malang - Jawa Timur" },
    { value: "Kabupaten Mojokerto - Jawa Timur", label: "Kabupaten Mojokerto - Jawa Timur" },
    { value: "Kabupaten Nganjuk - Jawa Timur", label: "Kabupaten Nganjuk - Jawa Timur" },
    { value: "Kabupaten Ngawi - Jawa Timur", label: "Kabupaten Ngawi - Jawa Timur" },
    { value: "Kabupaten Pacitan - Jawa Timur", label: "Kabupaten Pacitan - Jawa Timur" },
    { value: "Kabupaten Pamekasan - Jawa Timur", label: "Kabupaten Pamekasan - Jawa Timur" },
    { value: "Kabupaten Pasuruan - Jawa Timur", label: "Kabupaten Pasuruan - Jawa Timur" },
    { value: "Kabupaten Ponorogo - Jawa Timur", label: "Kabupaten Ponorogo - Jawa Timur" },
    { value: "Kabupaten Probolinggo - Jawa Timur", label: "Kabupaten Probolinggo - Jawa Timur" },
    { value: "Kabupaten Sampang - Jawa Timur", label: "Kabupaten Sampang - Jawa Timur" },
    { value: "Kabupaten Sidoarjo - Jawa Timur", label: "Kabupaten Sidoarjo - Jawa Timur" },
    { value: "Kabupaten Situbondo - Jawa Timur", label: "Kabupaten Situbondo - Jawa Timur" },
    { value: "Kabupaten Sumenep - Jawa Timur", label: "Kabupaten Sumenep - Jawa Timur" },
    { value: "Kabupaten Trenggalek - Jawa Timur", label: "Kabupaten Trenggalek - Jawa Timur" },
    { value: "Kabupaten Tuban - Jawa Timur", label: "Kabupaten Tuban - Jawa Timur" },
    { value: "Kabupaten Tulungagung - Jawa Timur", label: "Kabupaten Tulungagung - Jawa Timur" },
    { value: "Kota Batu - Jawa Timur", label: "Kota Batu - Jawa Timur" },
    { value: "Kota Blitar - Jawa Timur", label: "Kota Blitar - Jawa Timur" },
    { value: "Kota Kediri - Jawa Timur", label: "Kota Kediri - Jawa Timur" },
    { value: "Kota Madiun - Jawa Timur", label: "Kota Madiun - Jawa Timur" },
    { value: "Kota Malang - Jawa Timur", label: "Kota Malang - Jawa Timur" },
    { value: "Kota Mojokerto - Jawa Timur", label: "Kota Mojokerto - Jawa Timur" },
    { value: "Kota Pasuruan - Jawa Timur", label: "Kota Pasuruan - Jawa Timur" },
    { value: "Kota Probolinggo - Jawa Timur", label: "Kota Probolinggo - Jawa Timur" },
    { value: "Kota Surabaya - Jawa Timur", label: "Kota Surabaya - Jawa Timur" },
    { value: "Kabupaten Bantul - Yogyakarta", label: "Kabupaten Bantul - Yogyakarta" },
    { value: "Kabupaten Gunung Kidul - Yogyakarta", label: "Kabupaten Gunung Kidul - Yogyakarta" },
    { value: "Kabupaten Kulon Progo - Yogyakarta", label: "Kabupaten Kulon Progo - Yogyakarta" },
    { value: "Kabupaten Sleman - Yogyakarta", label: "Kabupaten Sleman - Yogyakarta" },
    { value: "Kota Yogyakarta - Yogyakarta", label: "Kota Yogyakarta - Yogyakarta" },
    { value: "Kota Jakarta Barat - DKI Jakarta", label: "Kota Jakarta Barat - DKI Jakarta" },
    { value: "Kota Jakarta Selatan - DKI Jakarta", label: "Kota Jakarta Selatan - DKI Jakarta" },
    { value: "Kota Jakarta Timur - DKI Jakarta", label: "Kota Jakarta Timur - DKI Jakarta" },
    { value: "Kota Jakarta Utara - DKI Jakarta", label: "Kota Jakarta Utara - DKI Jakarta" },
    { value: "Kota Jakarta Pusat - DKI Jakarta", label: "Kota Jakarta Pusat - DKI Jakarta" },
    { value: "Kabupaten Deli Serdang - Sumatera Utara", label: "Kabupaten Deli Serdang - Sumatera Utara" },
    { value: "Kabupaten Humbang Hasundutan - Sumatera Utara", label: "Kabupaten Humbang Hasundutan - Sumatera Utara" },
    { value: "Kabupaten Karo - Sumatera Utara", label: "Kabupaten Karo - Sumatera Utara" },
    { value: "Kabupaten Labuhan Batu - Sumatera Utara", label: "Kabupaten Labuhan Batu - Sumatera Utara" },
    { value: "Kabupaten Langkat - Sumatera Utara", label: "Kabupaten Langkat - Sumatera Utara" },
    { value: "Kabupaten Mandailing Natal - Sumatera Utara", label: "Kabupaten Mandailing Natal - Sumatera Utara" },
    { value: "Kabupaten Nias - Sumatera Utara", label: "Kabupaten Nias - Sumatera Utara" },
    { value: "Kabupaten Nias Selatan - Sumatera Utara", label: "Kabupaten Nias Selatan - Sumatera Utara" },
    { value: "Kabupaten Pakpak Bharat - Sumatera Utara", label: "Kabupaten Pakpak Bharat - Sumatera Utara" },
    { value: "Kabupaten Samosir - Sumatera Utara", label: "Kabupaten Samosir - Sumatera Utara" },
    { value: "Kabupaten Serdang Bedagai - Sumatera Utara", label: "Kabupaten Serdang Bedagai - Sumatera Utara" },
    { value: "Kabupaten Simalungun - Sumatera Utara", label: "Kabupaten Simalungun - Sumatera Utara" },
    { value: "Kabupaten Tapanuli Selatan - Sumatera Utara", label: "Kabupaten Tapanuli Selatan - Sumatera Utara" },
    { value: "Kabupaten Tapanuli Tengah - Sumatera Utara", label: "Kabupaten Tapanuli Tengah - Sumatera Utara" },
    { value: "Kabupaten Tapanuli Utara - Sumatera Utara", label: "Kabupaten Tapanuli Utara - Sumatera Utara" },
    { value: "Kabupaten Toba Samosir - Sumatera Utara", label: "Kabupaten Toba Samosir - Sumatera Utara" },
    { value: "Kota Binjai - Sumatera Utara", label: "Kota Binjai - Sumatera Utara" },
    { value: "Kota Gunungsitoli - Sumatera Utara", label: "Kota Gunungsitoli - Sumatera Utara" },
    { value: "Kota Medan - Sumatera Utara", label: "Kota Medan - Sumatera Utara" },
    { value: "Kota Padangsidimpuan - Sumatera Utara", label: "Kota Padangsidimpuan - Sumatera Utara" },
    { value: "Kota Pematangsiantar - Sumatera Utara", label: "Kota Pematangsiantar - Sumatera Utara" },
    { value: "Kota Sibolga - Sumatera Utara", label: "Kota Sibolga - Sumatera Utara" },
    { value: "Kota Tanjungbalai - Sumatera Utara", label: "Kota Tanjungbalai - Sumatera Utara" },
    { value: "Kota Tebing Tinggi - Sumatera Utara", label: "Kota Tebing Tinggi - Sumatera Utara" },
    { value: "Kabupaten Gowa - Sulawesi Selatan", label: "Kabupaten Gowa - Sulawesi Selatan" },
    { value: "Kabupaten Takalar - Sulawesi Selatan", label: "Kabupaten Takalar - Sulawesi Selatan" },
    { value: "Kabupaten Jeneponto - Sulawesi Selatan", label: "Kabupaten Jeneponto - Sulawesi Selatan" },
    { value: "Kabupaten Bantaeng - Sulawesi Selatan", label: "Kabupaten Bantaeng - Sulawesi Selatan" },
    { value: "Kabupaten Bulukumba - Sulawesi Selatan", label: "Kabupaten Bulukumba - Sulawesi Selatan" },
    { value: "Kabupaten Sinjai - Sulawesi Selatan", label: "Kabupaten Sinjai - Sulawesi Selatan" },
    { value: "Kabupaten Bone - Sulawesi Selatan", label: "Kabupaten Bone - Sulawesi Selatan" },
    { value: "Kabupaten Maros - Sulawesi Selatan", label: "Kabupaten Maros - Sulawesi Selatan" },
    { value: "Kabupaten Pangkajene dan Kepulauan - Sulawesi Selatan", label: "Kabupaten Pangkajene dan Kepulauan - Sulawesi Selatan" },
    { value: "Kabupaten Barru - Sulawesi Selatan", label: "Kabupaten Barru - Sulawesi Selatan" },
    { value: "Kabupaten Soppeng - Sulawesi Selatan", label: "Kabupaten Soppeng - Sulawesi Selatan" },
    { value: "Kabupaten Wajo - Sulawesi Selatan", label: "Kabupaten Wajo - Sulawesi Selatan" },
    { value: "Kabupaten Sidenreng Rappang - Sulawesi Selatan", label: "Kabupaten Sidenreng Rappang - Sulawesi Selatan" },
    { value: "Kabupaten Pinrang - Sulawesi Selatan", label: "Kabupaten Pinrang - Sulawesi Selatan" },
    { value: "Kabupaten Enrekang - Sulawesi Selatan", label: "Kabupaten Enrekang - Sulawesi Selatan" },
    { value: "Kabupaten Luwu - Sulawesi Selatan", label: "Kabupaten Luwu - Sulawesi Selatan" },
    { value: "Kabupaten Tana Toraja - Sulawesi Selatan", label: "Kabupaten Tana Toraja - Sulawesi Selatan" },
    { value: "Kabupaten Luwu Utara - Sulawesi Selatan", label: "Kabupaten Luwu Utara - Sulawesi Selatan" },
    { value: "Kabupaten Luwu Timur - Sulawesi Selatan", label: "Kabupaten Luwu Timur - Sulawesi Selatan" },
    { value: "Kabupaten Toraja Utara - Sulawesi Selatan", label: "Kabupaten Toraja Utara - Sulawesi Selatan" },
    { value: "Kota Makassar - Sulawesi Selatan", label: "Kota Makassar - Sulawesi Selatan" },
    { value: "Kota Parepare - Sulawesi Selatan", label: "Kota Parepare - Sulawesi Selatan" },
    { value: "Kota Palopo - Sulawesi Selatan", label: "Kota Palopo - Sulawesi Selatan" },
];

export default function ApplicantJobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobListItem | null>(null);
    const [jobConfig, setJobConfig] = useState<JobConfiguration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const [linkedinUrlFound, setLinkedinUrlFound] = useState(false);

    // Function to validate LinkedIn URL
    const validateLinkedInUrl = (url: string) => {
        if (!url) {
            setLinkedinUrlFound(false);
            return;
        }

        const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
        const isValid = linkedinPattern.test(url);
        setLinkedinUrlFound(isValid);
    };

    // Function to get job configuration from localStorage
    const getJobConfiguration = (jobId: string): JobConfiguration | null => {
        if (typeof window === 'undefined') return null;

        // Try to get configuration using the jobConfigStorage utility first
        const config = jobConfigStorage.get(jobId);
        if (config) return config;

        // Fallback: try to get configuration using the pattern from the example
        const configKey = `hiring-app-job-config_${jobId}`;
        const data = localStorage.getItem(configKey);
        return data ? JSON.parse(data) : null;
    };

    // Create dynamic schema based on job configuration
    const dynamicSchema = createDynamicApplicationSchema(jobConfig);

    const form = useForm<any>({
        resolver: zodResolver(dynamicSchema),
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
                // Load job configuration
                const config = getJobConfiguration(id);
                setJobConfig(config);
            }
            setIsLoading(false);
        }
    }, [id]);

    // Handle countdown timer
    useEffect(() => {
        if (showSuccessAlert && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showSuccessAlert && countdown === 0) {
            navigate("/applicant/jobs");
        }
    }, [showSuccessAlert, countdown, navigate]);

    const onSubmit = async (data: ApplicationFormData) => {
        try {
            if (!job) return;

            // Zod validation will handle the dynamic validation automatically

            // Create application
            const application = applicationsStorage.create({
                jobId: job.id,
                applicantEmail: data.email,
                applicantName: data.full_name,
                fieldData: data,
                status: "pending",
            });

            console.log("Application submitted:", application);

            // Show success alert and reset countdown
            setCountdown(6);
            setShowSuccessAlert(true);
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
                                {isFieldVisible(jobConfig, "photo_profile") && (
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
                                )}

                                {/* Full Name */}
                                {isFieldVisible(jobConfig, "full_name") && (
                                    <FormField
                                        control={form.control}
                                        name="full_name"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-90">
                                                    Full name{isFieldRequired(jobConfig, "full_name") && <span className="text-danger-main">*</span>}
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
                                )}

                                {/* Date of Birth */}
                                {isFieldVisible(jobConfig, "date_of_birth") && (
                                    <FormField
                                        control={form.control}
                                        name="date_of_birth"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Date of birth{isFieldRequired(jobConfig, "date_of_birth") && <span className="text-danger-main">*</span>}
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
                                )}

                                {/* Gender */}
                                {isFieldVisible(jobConfig, "gender") && (
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Pronoun (gender){isFieldRequired(jobConfig, "gender") && <span className="text-danger-main">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        className="flex gap-6 mt-1"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="female" id="female" />
                                                            <Label htmlFor="female" className="text-m-regular text-neutral-90">
                                                                She/her (Female)
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="male" id="male" />
                                                            <Label htmlFor="male" className="text-m-regular text-neutral-90">
                                                                He/him (Male)
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Domicile */}
                                {isFieldVisible(jobConfig, "domicile") && (
                                    <FormField
                                        control={form.control}
                                        name="domicile"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Domicile{isFieldRequired(jobConfig, "domicile") && <span className="text-danger-main">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={domicileOptions}
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder="Choose your domicile"
                                                        searchPlaceholder="Search domicile..."
                                                        hasError={!!fieldState.error}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Phone Number */}
                                {isFieldVisible(jobConfig, "phone_number") && (
                                    <FormField
                                        control={form.control}
                                        name="phone_number"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Phone number{isFieldRequired(jobConfig, "phone_number") && <span className="text-danger-main">*</span>}
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
                                )}

                                {/* Email */}
                                {isFieldVisible(jobConfig, "email") && (
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Email{isFieldRequired(jobConfig, "email") && <span className="text-danger-main">*</span>}
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
                                )}

                                {/* LinkedIn Link */}
                                {isFieldVisible(jobConfig, "linkedin_link") && (
                                    <FormField
                                        control={form.control}
                                        name="linkedin_link"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-s-regular text-neutral-100">
                                                    Link Linkedin{isFieldRequired(jobConfig, "linkedin_link") && <span className="text-danger-main">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://linkedin.com/in/username"
                                                        hasError={!!fieldState.error}
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            validateLinkedInUrl(e.target.value);
                                                        }}
                                                    />
                                                </FormControl>
                                                {/* Info Address Component */}
                                                {linkedinUrlFound && (
                                                    <div className="flex gap-1 items-center h-5">
                                                        <img src="/success_link.svg" alt="Success" className="w-4 h-4" />
                                                        <p className="text-xs text-primary-main leading-0">
                                                            URL address found
                                                        </p>
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
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

            {/* Success Alert Modal */}
            {showSuccessAlert && (
                <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                    <div className="bg-white rounded-[10px] w-full max-w-[500px] mx-4 overflow-hidden">
                        <div className="flex flex-col items-center text-center py-8 px-6">
                            {/* Success Illustration */}
                            <div className="mb-6">
                                <img
                                    src="/success-state.svg"
                                    alt="Success"
                                    className="w-32 h-32 mx-auto"
                                />
                            </div>

                            {/* Success Message */}
                            <div className="mb-6">
                                <h3 className="text-xl-bold text-neutral-100 mb-3">
                                    🎉 Your application was sent!
                                </h3>
                                <p className="text-m-regular text-neutral-70">
                                    Congratulations! You've taken the first step towards a rewarding career at Rakamin. We look forward to learning more about you during the application process.
                                </p>
                            </div>

                            {/* Countdown Timer */}
                            <div className="text-s-regular text-neutral-60">
                                Redirecting to jobs page in <span className="font-semibold text-primary-main">{countdown}</span> seconds...
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
