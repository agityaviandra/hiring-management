import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/stores/useAuthStore";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Hiring Management App" },
        { name: "description", content: "Manage job postings and applications" },
    ];
}

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin/jobs');
            } else {
                navigate('/applicant/jobs');
            }
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Hiring Management App</h1>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}
