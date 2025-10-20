import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { jobsStorage, applicationsStorage } from "~/utils/storage";
import { type Job, type Application } from "~/types";
import { EmptyState } from "~/components/ui/empty-state";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~/stores/useAuthStore";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import FilterPopOver, { type CandidateFilters } from "~/components/ui/filter-popover";

export default function ManageJobPage() {
    const { id } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<CandidateFilters>({
        name: "",
        email: "",
        phone: "",
        gender: "",
        domicile: "",
        appliedDate: "",
    });
    const { user, logout } = useAuthStore();
    const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    type ColumnId = 'name' | 'email' | 'phone' | 'gender' | 'linkedin' | 'domicile' | 'appliedDate';
    interface ColumnDef {
        id: ColumnId;
        label: string;
        width: number; // px
        sortable?: boolean;
        getValue: (app: Application) => React.ReactNode;
    }

    const [columns, setColumns] = useState<ColumnDef[]>([
        {
            id: 'name',
            label: 'NAME',
            width: 189,
            sortable: true,
            getValue: (app) => app.applicantName || app.fieldData.full_name || 'N/A'
        },
        {
            id: 'email',
            label: 'EMAIL',
            width: 220,
            sortable: true,
            getValue: (app) => app.applicantEmail
        },
        {
            id: 'phone',
            label: 'PHONE',
            width: 170,
            sortable: true,
            getValue: (app) => app.fieldData.phone_number || app.fieldData.phone || 'N/A'
        },
        {
            id: 'gender',
            label: 'GENDER',
            width: 125,
            sortable: true,
            getValue: (app) => app.fieldData.gender || 'N/A'
        },
        {
            id: 'linkedin',
            label: 'LINKEDIN',
            width: 260,
            sortable: false,
            getValue: (app) => (app.fieldData.linkedin_link || app.fieldData.linkedinUrl) ? (
                <a
                    href={app.fieldData.linkedin_link || app.fieldData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-main hover:text-primary-hover underline break-all"
                >
                    {app.fieldData.linkedin_link || app.fieldData.linkedinUrl}
                </a>
            ) : 'N/A'
        },
        {
            id: 'domicile',
            label: 'DOMICILE',
            width: 180,
            sortable: true,
            getValue: (app) => app.fieldData.domicile || 'N/A'
        },
        {
            id: 'appliedDate',
            label: 'APPLIED DATE',
            width: 160,
            sortable: true,
            getValue: (app) => formatDate(app.submittedAt)
        }
    ]);

    const [sortBy, setSortBy] = useState<{ column: ColumnId | null; direction: 'asc' | 'desc' }>(() => ({ column: null, direction: 'asc' }));
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const dragColIdRef = useRef<ColumnId | null>(null);
    const resizeStateRef = useRef<{ id: ColumnId | null; startX: number; startWidth: number } | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

    const filteredApplications = useMemo(() => {
        const hasGlobal = searchQuery.trim().length > 0;
        const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => (v as string).trim().length > 0)) as Partial<CandidateFilters>;

        if (!hasGlobal && Object.keys(active).length === 0) return applications;

        const globalLower = searchQuery.toLowerCase();
        return applications.filter(app => {
            const name = (app.applicantName || app.fieldData.full_name || '').toLowerCase();
            const email = (app.applicantEmail || '').toLowerCase();
            const phone = String(app.fieldData.phone_number || app.fieldData.phone || '').toLowerCase();
            const gender = String(app.fieldData.gender || '').toLowerCase();
            const domicile = String(app.fieldData.domicile || '').toLowerCase();
            const linkedin = String(app.fieldData.linkedin_link || app.fieldData.linkedinUrl || '').toLowerCase();
            const appliedDate = formatDate(app.submittedAt).toLowerCase();

            // Global OR across all fields
            const matchesGlobal = !hasGlobal || (
                name.includes(globalLower) || email.includes(globalLower) || phone.includes(globalLower) ||
                gender.includes(globalLower) || domicile.includes(globalLower) || linkedin.includes(globalLower) ||
                appliedDate.includes(globalLower)
            );

            if (!matchesGlobal) return false;

            // Field-specific filters: AND over active filters
            if (active.name && !name.includes(active.name.toLowerCase())) return false;
            if (active.email && !email.includes(active.email.toLowerCase())) return false;
            if (active.phone && !phone.includes(active.phone.toLowerCase())) return false;
            if (active.gender && gender !== active.gender.toLowerCase()) return false;
            // linkedin filter removed
            if (active.domicile && !domicile.includes(active.domicile.toLowerCase())) return false;
            if (active.appliedDate && !appliedDate.includes(active.appliedDate.toLowerCase())) return false;
            return true;
        });
    }, [applications, searchQuery, filters]);

    const sortedApplications = useMemo(() => {
        if (!sortBy.column) return filteredApplications;
        const col = columns.find(c => c.id === sortBy.column);
        if (!col) return filteredApplications;
        const appsCopy = [...filteredApplications];
        appsCopy.sort((a, b) => {
            const aValRaw = col.getValue(a);
            const bValRaw = col.getValue(b);
            const aVal = typeof aValRaw === 'string' ? aValRaw : (aValRaw as any)?.props?.children ?? '';
            const bVal = typeof bValRaw === 'string' ? bValRaw : (bValRaw as any)?.props?.children ?? '';
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return sortBy.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortBy.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return appsCopy;
    }, [filteredApplications, sortBy, columns]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedApplications.length / pageSize)), [sortedApplications.length, pageSize]);
    const pagedApplications = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedApplications.slice(start, start + pageSize);
    }, [sortedApplications, currentPage, pageSize]);

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
            const allIds = new Set(pagedApplications.map(app => app.id));
            setSelectedApplications(allIds);
        } else {
            setSelectedApplications(new Set());
        }
    };

    const isAllSelected = pagedApplications.length > 0 && pagedApplications.every(app => selectedApplications.has(app.id));
    const isIndeterminate = selectedApplications.size > 0 && selectedApplications.size < pagedApplications.length;

    const onHeaderClick = (col: ColumnDef) => {
        if (!col.sortable) return;
        setSortBy(prev => {
            if (prev.column === col.id) {
                return { column: col.id, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { column: col.id, direction: 'asc' };
        });
    };

    const onDragStartHeader = (id: ColumnId) => (e: React.DragEvent) => {
        dragColIdRef.current = id;
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDropHeader = (targetId: ColumnId) => (e: React.DragEvent) => {
        e.preventDefault();
        const sourceId = dragColIdRef.current;
        dragColIdRef.current = null;
        if (!sourceId || sourceId === targetId) return;
        setColumns(prev => {
            const next = [...prev];
            const fromIdx = next.findIndex(c => c.id === sourceId);
            const toIdx = next.findIndex(c => c.id === targetId);
            if (fromIdx === -1 || toIdx === -1) return prev;
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
    };

    const onDragOverHeader = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onMouseDownResize = (colId: ColumnId, startWidth: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        resizeStateRef.current = { id: colId, startX, startWidth };
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!resizeStateRef.current || !resizeStateRef.current.id) return;
            const { id, startX, startWidth } = resizeStateRef.current;
            const delta = e.clientX - startX;
            const newWidth = Math.max(100, startWidth + delta);
            setColumns(prev => prev.map(c => c.id === id ? { ...c, width: newWidth } : c));
        };
        const onMouseUp = () => {
            resizeStateRef.current = null;
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

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

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

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
            <div className="container mx-auto px-6 py-8">
                {/* Job Title */}
                <h1 className="text-xl-bold text-neutral-100 mb-4">{job?.title}</h1>
                {/* <p className="text-m-regular text-neutral-70">{job.}</p> */}

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-neutral-40 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Global search..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-10 border-2 border-neutral-30 focus:border-primary-main focus:ring-2 focus:ring-primary-focus"
                            />
                        </div>
                        <FilterPopOver
                            filters={filters}
                            onChange={(next) => {
                                setFilters(next);
                                setCurrentPage(1);
                            }}
                            onClear={() => {
                                setFilters({ name: '', email: '', phone: '', gender: '', domicile: '', appliedDate: '' });
                                setCurrentPage(1);
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-s-regular text-neutral-70">Rows per page</span>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-20 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="min-w-[100px]">
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active filter badges */}
                    {Object.values(filters).some(v => v) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {filters.name && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Name: {filters.name}</span>}
                            {filters.email && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Email: {filters.email}</span>}
                            {filters.phone && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Phone: {filters.phone}</span>}
                            {filters.gender && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Gender: {filters.gender}</span>}
                            {/* LinkedIn filter removed */}
                            {filters.domicile && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Domicile: {filters.domicile}</span>}
                            {filters.appliedDate && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-20 border border-neutral-40 px-2 py-0.5 text-xs">Applied: {filters.appliedDate}</span>}
                        </div>
                    )}
                </div>
                {selectedApplications.size > 0 && (
                    <div className="bg-primary-surface border border-primary-border rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-m-regular text-primary-main">
                                    {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} seleced
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
                                    {columns.map((col) => (
                                        <TableHead
                                            key={col.id}
                                            draggable
                                            onDragStart={onDragStartHeader(col.id)}
                                            onDragOver={onDragOverHeader}
                                            onDrop={onDropHeader(col.id)}
                                            onClick={() => onHeaderClick(col)}
                                            className="text-s-bold text-neutral-100 font-bold p-4 select-none"
                                            style={{ width: col.width, minWidth: col.width, maxWidth: col.width, position: 'relative' }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{col.label}</span>
                                                {sortBy.column === col.id && (
                                                    <span className="text-neutral-70">{sortBy.direction === 'asc' ? '▲' : '▼'}</span>
                                                )}
                                            </div>
                                            <span
                                                onMouseDown={onMouseDownResize(col.id, col.width)}
                                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize"
                                                style={{ userSelect: 'none' }}
                                            />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagedApplications.map((application) => (
                                    <TableRow key={application.id} className="border-neutral-40 bg-white hover:bg-neutral-20">
                                        <TableCell className="p-4">
                                            <Checkbox
                                                checked={selectedApplications.has(application.id)}
                                                onCheckedChange={(checked) => handleSelectApplication(application.id, checked as boolean)}
                                                className="size-5 border-primary-main data-[state=checked]:bg-primary-main data-[state=checked]:border-primary-main"
                                            />
                                        </TableCell>
                                        {columns.map(col => (
                                            <TableCell key={col.id} className="text-m-regular text-neutral-100 p-4" style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}>
                                                {col.getValue(application)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredApplications.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-s-regular text-neutral-70">
                            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedApplications.length)} of {sortedApplications.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            <span className="text-m-regular text-neutral-100">Page {currentPage} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

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