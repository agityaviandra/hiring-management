export type JobStatus = 'active' | 'draft' | 'closed' | 'inactive';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
export type FieldVisibility = 'mandatory' | 'optional' | 'hidden';

export interface SalaryRange {
    min: number;
    max: number;
    currency: string;
    display_text: string;
}

export interface ListCard {
    badge: string;
    started_on_text: string;
    cta: string;
}

export interface JobListItem {
    id: string;
    slug: string;
    title: string;
    status: JobStatus;
    jobType?: string;
    description?: string;
    salary_range: SalaryRange;
    list_card: ListCard;
}

export interface JobListResponse {
    data: JobListItem[];
}

export interface FieldValidation {
    required?: boolean; // Backend compatibility
    visibility?: FieldVisibility; // Frontend state management
}

export interface ApplicationField {
    key: string;
    validation: FieldValidation;
}

export interface ApplicationSection {
    title: string;
    fields: ApplicationField[];
}

export interface ApplicationForm {
    sections: ApplicationSection[];
}

export interface JobConfiguration {
    application_form: ApplicationForm;
}

export interface CandidateAttribute {
    key: string;
    label: string;
    value: string;
    order: number;
}

export interface Candidate {
    id: string;
    attributes: CandidateAttribute[];
}

export interface CandidateListResponse {
    data: Candidate[];
}

export interface Job {
    id: string;
    slug: string;
    title: string;
    status: JobStatus;
    salary_range: SalaryRange;
    list_card: ListCard;
}

export interface Application {
    id: string;
    jobId: string;
    applicantEmail: string;
    applicantName?: string;
    fieldData: Record<string, any>;
    status: ApplicationStatus;
    submittedAt: string;
    reviewedAt?: string;
    notes?: string;
}

export const STANDARD_FIELDS: ApplicationField[] = [
    { key: 'full_name', validation: { required: true, visibility: 'mandatory' } },
    { key: 'photo_profile', validation: { required: true, visibility: 'mandatory' } },
    { key: 'gender', validation: { required: true, visibility: 'mandatory' } },
    { key: 'domicile', validation: { required: false, visibility: 'optional' } },
    { key: 'email', validation: { required: true, visibility: 'mandatory' } },
    { key: 'phone_number', validation: { required: true, visibility: 'mandatory' } },
    { key: 'linkedin_link', validation: { required: true, visibility: 'mandatory' } },
    { key: 'date_of_birth', validation: { required: false, visibility: 'optional' } }
];
