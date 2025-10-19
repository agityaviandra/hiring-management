import { Outlet } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function ApplicantLayout() {
    return (
        <ProtectedRoute allowedRoles={['applicant']}>
            <Outlet />
        </ProtectedRoute>
    );
}
