import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CreateJobModal } from "~/components/admin/CreateJobModal";

export default function CreateJobPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // This page will just show the modal and redirect back when closed
        // The actual modal logic is handled by the modal component
    }, []);

    return (
        <CreateJobModal
            isOpen={true}
            onClose={() => navigate('/admin/jobs')}
        />
    );
}
