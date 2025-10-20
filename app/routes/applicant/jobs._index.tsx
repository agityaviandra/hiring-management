import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { jobsStorage } from "~/utils/storage";
import { type JobListItem } from "~/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { ArrowRightStartOnRectangleIcon, BanknotesIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~/stores/useAuthStore";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/empty-state";

// Image assets from Figma
const imgAvatar = "/fb7a940d182bb96ad2c50258c61e53f50565984b.png";
const imgCompanyLogo = "/d181d00d70b3f93bbfd2c083c74aae2e1d3bae5c.png";
const imgLocationIcon = "/93a79efb2389e8c65ebbb953d2c46e30e6388ac6.svg";
const imgMoneyIcon = "/65dc6af73d2ede65daa7f2171bbcfb256f1d6963.svg";

export default function ApplicantJobsPage() {
    const [jobs, setJobs] = useState<JobListItem[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const { data: allJobs } = jobsStorage.getAll();
        const activeJobs = (allJobs || []).filter((job) => job.status === "active");
        setJobs(activeJobs);
        // Set first job as selected by default
        if (activeJobs.length > 0) {
            setSelectedJob(activeJobs[0]);
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white h-16 shadow-modal">
                <div className="container mx-auto px-6 py-4 max-w-7xl">
                    <div className="h-full flex items-center justify-end">
                        <div className="flex items-center gap-6">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="relative size-7 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                                        <img
                                            src="/female-avatar.svg"
                                            alt="User avatar"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-neutral-100">{user?.name}</p>
                                            <p className="text-xs leading-none text-neutral-70">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-danger-main">
                                        <ArrowRightStartOnRectangleIcon className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {jobs.length === 0 ? (
                    <EmptyState
                        title="No job openings available"
                        description="Please wait for the next batch of openings."
                        actionVariant="alternative-primary"
                        actionSize="lg"
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[384px_1fr] gap-6">
                        {/* Left Column - Job Cards */}
                        <div className="space-y-6">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className={`rounded-lg overflow-hidden cursor-pointer transition-all ${selectedJob?.id === job.id
                                        ? 'bg-primary-surface border-2 border-primary-main border-solid'
                                        : 'bg-white border border-neutral-40 hover:border-primary-main'
                                        }`}
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="p-4">
                                        {/* Header with Logo and Job Info */}
                                        <div className="flex gap-4 items-start mb-2">
                                            <div className="border border-neutral-40 border-solid rounded shrink-0 w-[48px] h-[48px]">
                                                <img
                                                    alt="Company Logo"
                                                    className="w-full h-full object-cover rounded"
                                                    src={imgCompanyLogo}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-l-bold text-neutral-100 truncate">{job.title}</h3>
                                                <p className="text-m-regular text-neutral-70">Rakamin</p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px border-t border-dashed border-neutral-40 mb-2"></div>

                                        {/* Job Details */}
                                        <div className="space-y-2">
                                            {/* Location */}
                                            <div className="flex gap-1 items-center justify-center">
                                                <MapPinIcon className="size-4 text-neutral-80" />
                                                <p className="text-s-regular text-neutral-80 flex-1 leading-0">Jakarta Selatan</p>
                                            </div>

                                            {/* Salary */}
                                            <div className="flex gap-1 items-center">
                                                <BanknotesIcon className="size-4 text-neutral-80" />
                                                <p className="text-s-regular text-neutral-80 flex-1 leading-0">
                                                    {job.salary_range?.display_text || "Salary Negotiable"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Column - Job Detail */}
                        <div className="border border-neutral-40 border-solid rounded-lg p-6 bg-white">
                            {selectedJob ? (
                                <>
                                    {/* Sticky Header */}
                                    <div className="sticky top-0 bg-white pb-6 border-b border-neutral-40 mb-6">
                                        <div className="flex gap-6 items-start">
                                            <div className="border border-neutral-40 border-solid rounded shrink-0 w-[48px] h-[48px]">
                                                <img
                                                    alt="Company Logo"
                                                    className="w-full h-full object-cover rounded"
                                                    src={imgCompanyLogo}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {/* Work Type Badge */}
                                                {selectedJob.jobType && (
                                                    <div className="mb-2">
                                                        <div className="bg-success-main px-2 py-0.5 rounded text-s-bold text-white inline-block">
                                                            {selectedJob.jobType === 'full-time' ? 'Full-Time' :
                                                                selectedJob.jobType === 'part-time' ? 'Part-Time' :
                                                                    selectedJob.jobType === 'contract' ? 'Contract' :
                                                                        selectedJob.jobType === 'internship' ? 'Internship' : selectedJob.jobType}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Job Title and Company */}
                                                <div className="space-y-1">
                                                    <h2 className="text-xl-bold text-neutral-100">{selectedJob.title}</h2>
                                                    <p className="text-m-regular text-neutral-70">Rakamin</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <Link to={`/applicant/jobs/${selectedJob.id}`}>
                                                    <Button
                                                        variant="alternative-primary"
                                                        className="!text-m-bold text-neutral-90 shadow-button"
                                                    >
                                                        Apply
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Responsibilities */}
                                    <div className="space-y-6">
                                        {selectedJob.description ? (
                                            <div className="text-m-regular text-neutral-100 whitespace-pre-line">
                                                {selectedJob.description}
                                            </div>
                                        ) : (
                                            <p className="text-m-regular text-neutral-70">No description provided.</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-neutral-60"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <h3 className="mt-3 text-m-bold text-neutral-100">Select a job to view details</h3>
                                    <p className="mt-1 text-s-regular text-neutral-70">Choose a job from the list to see its requirements and responsibilities.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
