import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { jobsStorage, applicationsStorage } from "~/utils/storage";
import { type Job, type Application } from "~/types";
import { EmptyState } from "~/components/ui/empty-state";

export default function ManageJobPage() {
    const { id } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) {
            const jobData = jobsStorage.getById(id);
            if (jobData) {
                setJob(jobData as unknown as Job);
                // Get applications for this job
                const jobApplications = applicationsStorage.getByJobId(id);
                setApplications(jobApplications);
            }
            setIsLoading(false);
        }
    }, [id]);

    const filteredApplications = applications.filter(app => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            app.applicantEmail.toLowerCase().includes(searchLower) ||
            (app.fieldData.phone && app.fieldData.phone.toLowerCase().includes(searchLower)) ||
            (app.fieldData.dateOfBirth && app.fieldData.dateOfBirth.toLowerCase().includes(searchLower)) ||
            (app.fieldData.domicile && app.fieldData.domicile.toLowerCase().includes(searchLower)) ||
            (app.fieldData.gender && app.fieldData.gender.toLowerCase().includes(searchLower)) ||
            (app.fieldData.linkedinUrl && app.fieldData.linkedinUrl.toLowerCase().includes(searchLower))
        );
    });

    const handleSelectApplication = (applicationId: string, checked: boolean) => {
        setSelectedApplications(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(applicationId);
            } else {
                newSet.delete(applicationId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredApplications.map(app => app.id));
            setSelectedApplications(allIds);
        } else {
            setSelectedApplications(new Set());
        }
    };

    const isAllSelected = filteredApplications.length > 0 && filteredApplications.every(app => selectedApplications.has(app.id));
    const isIndeterminate = selectedApplications.size > 0 && selectedApplications.size < filteredApplications.length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-warning-surface text-warning-main border-warning-border';
            case 'reviewed':
                return 'bg-primary-surface text-primary-main border-primary-border';
            case 'shortlisted':
                return 'bg-success-surface text-success-main border-success-border';
            case 'rejected':
                return 'bg-danger-surface text-danger-main border-danger-border';
            default:
                return 'bg-neutral-20 text-neutral-70 border-neutral-40';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main mx-auto"></div>
                    <p className="mt-2 text-neutral-70 text-m-regular">Loading job details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-20">
            {/* Header with Breadcrumb */}
            <div className="bg-white border-b border-neutral-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link to="/admin/jobs">
                                <Button variant="outline" size="sm" className="text-m-bold text-neutral-100">
                                    Job list
                                </Button>
                            </Link>
                            <svg className="w-4 h-4 text-neutral-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <Button variant="outline" size="sm" className="bg-neutral-30 text-neutral-100 border-neutral-50">
                                Manage Candidate
                            </Button>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="size-7 rounded-full border border-neutral-40 overflow-hidden">
                                <img
                                    src="/female-avatar.svg"
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Job Title */}
                <h1 className="text-xl-bold text-neutral-100">{job?.title}</h1>
                {/* <p className="text-m-regular text-neutral-70">{job.}</p> */}

                {/* Search and Filters
                <div className="bg-white rounded-lg border border-neutral-40 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by email, phone, domicile, gender, or LinkedIn..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 border-2 border-neutral-30 focus:border-primary-main focus:ring-2 focus:ring-primary-focus"
                            />
                        </div>
                        <Button variant="outline" className="px-6">
                            Filter
                        </Button>
                        <Button className="px-6 bg-primary-main hover:bg-primary-hover">
                            Export
                        </Button>
                    </div>
                </div> */}

                Selected Applications Actions
                {selectedApplications.size > 0 && (
                    <div className="bg-primary-surface border border-primary-border rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-m-regular text-primary-main">
                                    {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedApplications(new Set())}
                                    className="text-primary-main border-primary-border hover:bg-primary-main hover:text-white"
                                >
                                    Clear Selection
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* <Button variant="outline" size="sm" className="text-primary-main border-primary-border hover:bg-primary-main hover:text-white">
                                    Bulk Actions
                                </Button> */}
                                <Button size="sm" className="bg-primary-main hover:bg-primary-hover text-white">
                                    Export Selected
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applications Table */}
                <div className="bg-white rounded-lg border border-neutral-40 overflow-hidden">
                    {filteredApplications.length === 0 || !job ? (
                        <EmptyState
                            className="h-full"
                            illustration="/empty_state_2.svg"
                            title="No candidates found"
                            description="Share your job vacancies so that more candidates will apply."
                            actionOnClick={() => {
                                const navigate = useNavigate();
                                navigate('/admin/jobs');
                            }}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-neutral-40 bg-neutral-10">
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[50px] p-4">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                            className="size-5 border-primary-main data-[state=checked]:bg-primary-main data-[state=checked]:border-primary-main data-[state=indeterminate]:bg-primary-main data-[state=indeterminate]:border-primary-main"
                                        />
                                    </TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[189px] p-4">EMAIL ADDRESS</TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[189px] p-4">PHONE NUMBERS</TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[189px] p-4">DATE OF BIRTH</TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[189px] p-4">DOMICILE</TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[125px] p-4">GENDER</TableHead>
                                    <TableHead className="text-s-bold text-neutral-100 font-bold w-[249px] p-4">LINK LINKEDIN</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application.id} className="border-neutral-40 bg-white hover:bg-neutral-20">
                                        <TableCell className="p-4">
                                            <Checkbox
                                                checked={selectedApplications.has(application.id)}
                                                onCheckedChange={(checked) => handleSelectApplication(application.id, checked as boolean)}
                                                className="size-5 border-primary-main data-[state=checked]:bg-primary-main data-[state=checked]:border-primary-main"
                                            />
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.applicantEmail}
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.fieldData.phone || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.fieldData.dateOfBirth || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.fieldData.domicile || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.fieldData.gender || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-m-regular text-neutral-100 p-4">
                                            {application.fieldData.linkedinUrl ? (
                                                <a
                                                    href={application.fieldData.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-main hover:text-primary-hover underline break-all"
                                                >
                                                    {application.fieldData.linkedinUrl}
                                                </a>
                                            ) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Statistics Summary
                {applications.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg border border-neutral-40 p-6">
                        <h3 className="text-m-bold text-neutral-100 mb-4">Application Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-neutral-100">
                                    {applications.filter(app => app.status === 'pending').length}
                                </div>
                                <div className="text-s-regular text-neutral-70">Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-neutral-100">
                                    {applications.filter(app => app.status === 'reviewed').length}
                                </div>
                                <div className="text-s-regular text-neutral-70">Reviewed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-neutral-100">
                                    {applications.filter(app => app.status === 'shortlisted').length}
                                </div>
                                <div className="text-s-regular text-neutral-70">Shortlisted</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-neutral-100">
                                    {applications.filter(app => app.status === 'rejected').length}
                                </div>
                                <div className="text-s-regular text-neutral-70">Rejected</div>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
}