import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { type Job, type JobStatus } from "~/types";
import { jobsStorage } from "~/utils/storage";
import { toast } from "~/components/ui/toast";

interface JobStatusBadgeProps {
    status: JobStatus;
}

function JobStatusBadge({ status }: JobStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case 'active':
                return {
                    container: 'bg-success-surface border-success-border',
                    text: 'text-success-main'
                };
            case 'draft':
                return {
                    container: 'bg-secondary-surface border-secondary-border',
                    text: 'text-secondary-main'
                };
            case 'inactive':
                return {
                    container: 'bg-danger-surface border-danger-border',
                    text: 'text-danger-main'
                };
            default:
                return {
                    container: 'bg-neutral-20 border-neutral-40',
                    text: 'text-neutral-70'
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className={`border border-solid box-border flex gap-2 items-center px-4 py-1 relative rounded-lg shrink-0 ${styles.container}`}>
            <p className={`font-bold leading-6 relative shrink-0 text-sm text-nowrap text-right whitespace-pre ${styles.text}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
        </div>
    );
}

interface JobCardProps {
    job: Job;
    onStatusUpdate?: () => void;
}

export function JobCard({ job, onStatusUpdate }: JobCardProps) {
    const handleStatusChange = (newStatus: JobStatus) => {
        try {
            const updatedJob = jobsStorage.update(job.id, {
                status: newStatus,
                list_card: {
                    ...job.list_card,
                    badge: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
                }
            });

            if (updatedJob) {
                toast.success({
                    title: "Status updated successfully",
                    description: `Job status changed to ${newStatus}`
                });
                onStatusUpdate?.();
            } else {
                throw new Error('Failed to update job status');
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            toast.error({
                title: "Failed to update status",
                description: "There was an error updating the job status. Please try again."
            });
        }
    };
    return (
        <div className="bg-neutral-10 box-border flex flex-col gap-3 items-start p-4 sm:p-6 relative rounded-2xl w-full transition-all duration-200 shadow-modal">
            {/* Status + Start Date Row */}
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between relative shrink-0 w-full gap-2 xs:gap-0">
                <div className="flex gap-2 sm:gap-4 items-center min-h-px min-w-px relative shrink-0 flex-wrap">
                    {/* Job Status Badge */}
                    <JobStatusBadge status={job.status} />

                    {/* Start Date Badge */}
                    <div className="border border-neutral-40 border-solid box-border flex gap-2 items-center px-3 py-1 sm:px-4 sm:py-1 relative rounded shrink-0 mt-0">
                        <p className="font-normal leading-6 relative shrink-0 text-xs sm:text-sm text-neutral-70 text-nowrap whitespace-pre">
                            started on {job.list_card.started_on_text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Row */}
            <div className="flex flex-col-reverse sm:flex-row items-end sm:items-end justify-between relative shrink-0 w-full gap-3 sm:gap-0">
                <div className="flex flex-col gap-2 sm:gap-3 items-start relative shrink-0 w-full sm:w-[495px]">
                    <div className="flex flex-col gap-1 sm:gap-2 items-start justify-center relative shrink-0 w-full">
                        {/* Job Title */}
                        <p className="font-bold leading-7 relative shrink-0 text-neutral-100 text-base sm:text-lg text-nowrap whitespace-pre capitalize line-clamp-2 max-w-full">
                            {job.title}
                        </p>
                        {/* Salary Range */}
                        <div className="flex font-normal gap-1 items-start leading-7 relative shrink-0 text-neutral-80 text-sm sm:text-base text-nowrap whitespace-pre">
                            <p className="relative shrink-0">
                                Rp{job.salary_range.min.toLocaleString('id-ID')}
                            </p>
                            <p className="relative shrink-0">
                                -
                            </p>
                            <p className="relative shrink-0">
                                Rp{job.salary_range.max.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Update + CTA Buttons */}
                <div className="flex gap-2 items-end justify-end relative shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
                    {/* Status Update Dropdown */}
                    <Select value={job.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-8 min-h-0 px-2 sm:px-3 py-1 text-xs w-full sm:w-24 text-xs-bold rounded-lg border-2 border-neutral-40" style={{ height: '32px' }}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[100px] w-28">
                            <SelectItem className="text-xs px-2" value="active">Active</SelectItem>
                            <SelectItem className="text-xs px-2" value="inactive">Inactive</SelectItem>
                            <SelectItem className="text-xs px-2" value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Manage Job Button */}
                    <Button variant={"default"} size={"sm"} className="w-full sm:w-auto" asChild>
                        <Link to={`/admin/jobs/${job.id}`}>
                            Manage Job
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
