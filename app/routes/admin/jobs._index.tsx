import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MagnifyingGlassIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { EmptyState } from "~/components/ui/empty-state";
import { JobCard } from "~/components/ui/job-card";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { CreateJobModal } from "~/components/admin/CreateJobModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { jobsStorage } from "~/utils/storage";
import { useAuthStore } from "~/stores/useAuthStore";
import { type JobListItem, type JobStatus } from "~/types";

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<JobListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [dropdownContainer, setDropdownContainer] = useState<HTMLElement | null>(null);

    console.log(jobs);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        // Set the dropdown container to the main content area to avoid body portal issues
        const container = document.getElementById('main-content') || document.body;
        setDropdownContainer(container);
    }, []);

    useEffect(() => {
        const loadJobs = () => {
            const allJobs = jobsStorage.getAll();
            setJobs(allJobs.data);
            setIsLoading(false);
        };

        loadJobs();
    }, []);

    const refreshJobs = () => {
        const allJobs = jobsStorage.getAll();
        setJobs(allJobs.data);
    };

    const filteredJobs = jobs?.filter(job =>
        job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminHeader />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main mx-auto"></div>
                        <p className="mt-2 text-neutral-70 text-m-regular">Loading jobs...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" id="main-content">
            {/* Header */}
            <div className="bg-white border-b border-neutral-40 h-16">
                <div className="h-full px-6 flex items-center justify-between">
                    <h1 className="text-xl-bold text-neutral-100">Job List</h1>
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
                            <DropdownMenuContent className="w-56" align="end" forceMount container={dropdownContainer}>
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

            {/* Main Content */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* Left Column - Job List */}
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search by job details"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 px-4 py-2 border-2 border-neutral-30 rounded-lg text-m-regular text-neutral-70 placeholder:text-neutral-70 focus:border-primary-main focus:ring-2 focus:ring-primary-focus"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6">
                                <MagnifyingGlassIcon className="w-full h-full text-neutral-70" />
                            </div>
                        </div>

                        {/* Job List or Empty State */}
                        {filteredJobs.length === 0 || jobs.length === 0 ? (
                            <EmptyState
                                title="No job openings available"
                                description="Create a job opening now and start the candidate process."
                                actionText="Create a new job"
                                actionOnClick={() => setIsCreateModalOpen(true)}
                                actionVariant="alternative-primary"
                                actionSize="lg"
                            />
                        ) : (
                            <div className="grid gap-4 custom-scrollbar h-fit overflow-visible">
                                {filteredJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Promotional Card */}
                    <div className="space-y-6">
                        <div className="relative rounded-2xl p-6 overflow-hidden flex flex-col gap-6 justify-center items-end">
                            {/* Background image */}
                            <img
                                src="/guys-teaching.png"
                                alt="Recruitment background"
                                className="w-full h-full object-cover rounded-2xl absolute inset-0"
                            />
                            {/* Background overlay */}
                            <div className="absolute inset-0 bg-black/72 rounded-2xl"></div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col gap-1 items-start w-full">
                                <h3 className="text-xl-bold text-neutral-40">Recruit the best candidates</h3>
                                <p className="text-m-regular text-neutral-10">Create jobs, invite, and hire with ease</p>
                            </div>

                            <Button
                                variant="default"
                                size="lg"
                                className="w-full z-10"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                Create a new job
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Job Modal */}
            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onJobSaved={refreshJobs}
            />
        </div >
    );
}
