import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CreateJobModal } from "~/components/admin/CreateJobModal";
import { jobsStorage } from "~/utils/storage";
import { type Job } from "~/types";

export default function EditJobPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const jobData = jobsStorage.getById(id);
            if (jobData) {
                setJob(jobData);
            }
            setIsLoading(false);
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main mx-auto"></div>
                    <p className="mt-2 text-neutral-70 text-m-regular">Loading job...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="heading-s-bold text-neutral-100 mb-2">Job Not Found</h1>
                    <p className="text-m-regular text-neutral-70 mb-4">The job you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/admin/jobs')}
                        className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-hover"
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <CreateJobModal
            isOpen={true}
            onClose={() => navigate(`/admin/jobs/${id}`)}
            jobToEdit={job}
        />
    );
}
