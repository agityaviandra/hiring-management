import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { type Job, type JobStatus } from "~/types";

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
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-neutral-10 box-border flex flex-col gap-3 items-start p-6 relative rounded-2xl w-full transition-all duration-200 shadow-modal">
            {/* Status + Start Date Row */}
            <div className="flex items-start justify-between relative shrink-0 w-full">
                <div className="flex gap-4 items-center min-h-px min-w-px relative shrink-0">
                    {/* Job Status Badge */}
                    <JobStatusBadge status={job.status} />

                    {/* Start Date Badge */}
                    <div className="border border-neutral-40 border-solid box-border flex gap-2 items-center px-4 py-1 relative rounded shrink-0">
                        <p className="font-normal leading-6 relative shrink-0 text-sm text-neutral-70 text-nowrap whitespace-pre">
                            started on {job.list_card.started_on_text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Row */}
            <div className="flex items-end justify-between relative shrink-0 w-full">
                <div className="flex flex-col gap-3 items-start relative shrink-0 w-[495px]">
                    <div className="flex flex-col gap-2 items-start justify-center relative shrink-0 w-full">
                        {/* Job Title */}
                        <p className="font-bold leading-7 relative shrink-0 text-neutral-100 text-lg text-nowrap whitespace-pre capitalize">
                            {job.title}
                        </p>
                        {/* Salary Range */}
                        <div className="flex font-normal gap-1 items-start leading-7 relative shrink-0 text-neutral-80 text-base text-nowrap whitespace-pre">
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

                {/* CTA Button */}
                <div className="flex flex-col gap-2.5 items-end justify-end relative shrink-0">
                    <Button variant={"default"} size={"sm"} asChild>
                        <Link to={`/admin/jobs/${job.id}`}>
                            Manage Job
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
