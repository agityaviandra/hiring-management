import { type Job, type Application } from '~/types';

// In a real application, these would be API calls
// For now, we'll use localStorage for persistence

const JOBS_KEY = 'hiring-app-jobs';
const APPLICATIONS_KEY = 'hiring-app-applications';

// Jobs storage
export const jobsStorage = {
    getAll: (): Job[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(JOBS_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: (id: string): Job | undefined => {
        const jobs = jobsStorage.getAll();
        return jobs.find(job => job.id === id);
    },

    create: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job => {
        const jobs = jobsStorage.getAll();
        const newJob: Job = {
            ...job,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const updatedJobs = [...jobs, newJob];
        localStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));

        // Create sample applications for the first job
        if (jobs.length === 0) {
            const sampleApplications: Application[] = [
                {
                    id: 'app-1',
                    jobId: newJob.id,
                    applicantEmail: 'john.doe@example.com',
                    fieldData: {
                        fullName: 'John Doe',
                        phone: '+1 (555) 123-4567',
                        linkedin: 'https://linkedin.com/in/johndoe',
                        yearsOfExperience: '5',
                        coverLetter: 'I am excited to apply for this position...'
                    },
                    status: 'pending',
                    submittedAt: new Date().toISOString()
                },
                {
                    id: 'app-2',
                    jobId: newJob.id,
                    applicantEmail: 'jane.smith@example.com',
                    fieldData: {
                        fullName: 'Jane Smith',
                        phone: '+1 (555) 987-6543',
                        linkedin: 'https://linkedin.com/in/janesmith',
                        yearsOfExperience: '3',
                        coverLetter: 'I have extensive experience in...'
                    },
                    status: 'reviewed',
                    submittedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 'app-3',
                    jobId: newJob.id,
                    applicantEmail: 'mike.wilson@example.com',
                    fieldData: {
                        fullName: 'Mike Wilson',
                        phone: '+1 (555) 456-7890',
                        linkedin: 'https://linkedin.com/in/mikewilson',
                        yearsOfExperience: '7',
                        coverLetter: 'I am passionate about...'
                    },
                    status: 'shortlisted',
                    submittedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
                }
            ];

            localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(sampleApplications));
        }

        return newJob;
    },

    update: (id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>): Job | null => {
        const jobs = jobsStorage.getAll();
        const index = jobs.findIndex(job => job.id === id);

        if (index === -1) return null;

        const updatedJob: Job = {
            ...jobs[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        jobs[index] = updatedJob;
        localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
        return updatedJob;
    },

    delete: (id: string): boolean => {
        const jobs = jobsStorage.getAll();
        const filteredJobs = jobs.filter(job => job.id !== id);

        if (filteredJobs.length === jobs.length) return false;

        localStorage.setItem(JOBS_KEY, JSON.stringify(filteredJobs));
        return true;
    },
};

// Applications storage
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
