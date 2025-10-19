import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "~/stores/useAuthStore";

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'applicant')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps = {}) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
