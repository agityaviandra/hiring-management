export type FieldType = 'text' | 'email' | 'phone' | 'file' | 'textarea' | 'url';
export type FieldVisibility = 'mandatory' | 'optional' | 'hidden';
export type JobStatus = 'active' | 'draft' | 'closed' | 'inactive';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface ApplicationField {
    id: string;
    fieldName: string;
    fieldType: FieldType;
    visibility: FieldVisibility;
    order: number;
    label?: string;
    placeholder?: string;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    applicationFields: ApplicationField[];
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

// Standard application fields that can be configured
export const STANDARD_FIELDS: Omit<ApplicationField, 'id' | 'order' | 'visibility'>[] = [
    {
        fieldName: 'cv',
        fieldType: 'file',
        label: 'CV/Resume',
        validation: { maxLength: 10485760 }, // 10MB
    },
    {
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        validation: { minLength: 2, maxLength: 100 },
    },
    {
        fieldName: 'email',
        fieldType: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        validation: { maxLength: 255 },
    },
    {
        fieldName: 'phone',
        fieldType: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        validation: { minLength: 10, maxLength: 20 },
    },
    {
        fieldName: 'portfolioUrl',
        fieldType: 'url',
        label: 'Portfolio URL',
        placeholder: 'https://your-portfolio.com',
        validation: { maxLength: 500 },
    },
    {
        fieldName: 'coverLetter',
        fieldType: 'textarea',
        label: 'Cover Letter',
        placeholder: 'Tell us why you\'re interested in this position...',
        validation: { maxLength: 2000 },
    },
    {
        fieldName: 'linkedinUrl',
        fieldType: 'url',
        label: 'LinkedIn Profile',
        placeholder: 'https://linkedin.com/in/yourprofile',
        validation: { maxLength: 500 },
    },
    {
        fieldName: 'yearsOfExperience',
        fieldType: 'text',
        label: 'Years of Experience',
        placeholder: 'e.g., 3-5 years',
        validation: { maxLength: 50 },
    },
    {
        fieldName: 'dateOfBirth',
        fieldType: 'text',
        label: 'Date of Birth',
        placeholder: 'DD/MM/YYYY',
        validation: { maxLength: 10 },
    },
    {
        fieldName: 'domicile',
        fieldType: 'text',
        label: 'Domicile',
        placeholder: 'Enter your domicile/location',
        validation: { maxLength: 100 },
    },
    {
        fieldName: 'gender',
        fieldType: 'text',
        label: 'Gender',
        placeholder: 'Enter your gender',
        validation: { maxLength: 20 },
    },
];
