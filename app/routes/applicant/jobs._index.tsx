import { AdminHeader } from "~/components/admin/AdminHeader";

export default function ApplicantJobsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />
            <main className="container mx-auto px-6 py-8">
                <div className="text-center py-16">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Jobs</h1>
                    <p className="text-gray-600">Applicant job browsing will be implemented in the future.</p>
                </div>
            </main>
        </div>
    );
}
