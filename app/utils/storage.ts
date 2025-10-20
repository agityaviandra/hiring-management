import {
    type JobListItem,
    type JobListResponse,
    type JobConfiguration,
    type Candidate,
    type CandidateListResponse,
    type ApplicationField,
    type Application,
    STANDARD_FIELDS
} from '~/types';

// In a real application, these would be API calls
// For now, we'll use localStorage for persistence

const JOBS_KEY = 'hiring-app-jobs';
const JOB_CONFIG_KEY = 'hiring-app-job-config';
const APPLICATIONS_KEY = 'hiring-app-applications';
const CANDIDATES_KEY = 'hiring-app-candidates';

// Jobs storage
export const jobsStorage = {
    getAll: (): JobListResponse => {
        if (typeof window === 'undefined') return { data: [] };
        const data = localStorage.getItem(JOBS_KEY);
        return data ? JSON.parse(data) : { data: [] };
    },

    getById: (id: string): JobListItem | undefined => {
        const jobs = jobsStorage.getAll();
        return jobs.data?.find(job => job.id === id);
    },

    create: (jobData: Omit<JobListItem, 'id'>): JobListItem => {
        const jobs = jobsStorage.getAll();
        const newJob: JobListItem = {
            ...jobData,
            id: `job_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${String(jobs.data.length + 1).padStart(4, '0')}`,
        };

        const updatedJobs = { data: [...jobs.data, newJob] };
        localStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));
        return newJob;
    },

    update: (id: string, updates: Partial<Omit<JobListItem, 'id'>>): JobListItem | null => {
        const jobs = jobsStorage.getAll();
        const index = jobs.data.findIndex(job => job.id === id);

        if (index === -1) return null;

        const updatedJob: JobListItem = {
            ...jobs.data[index],
            ...updates,
        };

        jobs.data[index] = updatedJob;
        localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
        return updatedJob;
    },

    delete: (id: string): boolean => {
        const jobs = jobsStorage.getAll();
        const filteredJobs = { data: jobs.data.filter(job => job.id !== id) };

        if (filteredJobs.data.length === jobs.data.length) return false;

        localStorage.setItem(JOBS_KEY, JSON.stringify(filteredJobs));
        return true;
    },
};

// Job Configuration storage
export const jobConfigStorage = {
    get: (jobId: string): JobConfiguration | null => {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(`${JOB_CONFIG_KEY}_${jobId}`);
        return data ? JSON.parse(data) : null;
    },

    set: (jobId: string, config: JobConfiguration): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`${JOB_CONFIG_KEY}_${jobId}`, JSON.stringify(config));
    },

    getDefault: (): JobConfiguration => {
        return {
            application_form: {
                sections: [
                    {
                        title: "Minimum Profile Information Required",
                        fields: STANDARD_FIELDS
                    }
                ]
            }
        };
    }
};

// Candidates storage
export const candidatesStorage = {
    getAll: (): CandidateListResponse => {
        if (typeof window === 'undefined') return { data: [] };
        const data = localStorage.getItem(CANDIDATES_KEY);
        return data ? JSON.parse(data) : { data: [] };
    },

    getById: (id: string): Candidate | undefined => {
        const candidates = candidatesStorage.getAll();
        return candidates.data.find(candidate => candidate.id === id);
    },

    create: (candidateData: Omit<Candidate, 'id'>): Candidate => {
        const candidates = candidatesStorage.getAll();
        const newCandidate: Candidate = {
            ...candidateData,
            id: `cand_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${String(candidates.data.length + 1).padStart(4, '0')}`,
        };

        const updatedCandidates = { data: [...candidates.data, newCandidate] };
        localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedCandidates));
        return newCandidate;
    },

    update: (id: string, updates: Partial<Omit<Candidate, 'id'>>): Candidate | null => {
        const candidates = candidatesStorage.getAll();
        const index = candidates.data.findIndex(candidate => candidate.id === id);

        if (index === -1) return null;

        const updatedCandidate: Candidate = {
            ...candidates.data[index],
            ...updates,
        };

        candidates.data[index] = updatedCandidate;
        localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
        return updatedCandidate;
    },

    delete: (id: string): boolean => {
        const candidates = candidatesStorage.getAll();
        const filteredCandidates = { data: candidates.data.filter(candidate => candidate.id !== id) };

        if (filteredCandidates.data.length === candidates.data.length) return false;

        localStorage.setItem(CANDIDATES_KEY, JSON.stringify(filteredCandidates));
        return true;
    },
};

// Applications storage (legacy - can be removed later)
export const applicationsStorage = {
    getAll: (): Application[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(APPLICATIONS_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: (id: string): Application | undefined => {
        const applications = applicationsStorage.getAll();
        return applications.find(app => app.id === id);
    },

    getByJobId: (jobId: string): Application[] => {
        const applications = applicationsStorage.getAll();
        return applications.filter(app => app.jobId === jobId);
    },

    create: (application: Omit<Application, 'id' | 'submittedAt'>): Application => {
        const applications = applicationsStorage.getAll();
        const newApplication: Application = {
            ...application,
            id: crypto.randomUUID(),
            submittedAt: new Date().toISOString(),
        };

        const updatedApplications = [...applications, newApplication];
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updatedApplications));
        return newApplication;
    },

    update: (id: string, updates: Partial<Omit<Application, 'id' | 'submittedAt'>>): Application | null => {
        const applications = applicationsStorage.getAll();
        const index = applications.findIndex(app => app.id === id);

        if (index === -1) return null;

        const updatedApplication: Application = {
            ...applications[index],
            ...updates,
        };

        applications[index] = updatedApplication;
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
        return updatedApplication;
    },

    delete: (id: string): boolean => {
        const applications = applicationsStorage.getAll();
        const filteredApplications = applications.filter(app => app.id !== id);

        if (filteredApplications.length === applications.length) return false;

        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(filteredApplications));
        return true;
    },
};