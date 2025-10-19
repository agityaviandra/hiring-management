import { Outlet } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function AdminLayout() {
    return <ProtectedRoute allowedRoles={['admin']} />;
}
