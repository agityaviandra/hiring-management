import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CreateJobModal } from "~/components/admin/CreateJobModal";

export default function CreateJobPage() {
    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    return (
        <CreateJobModal
            isOpen={true}
            onClose={() => navigate('/admin/jobs')}
        />
    );
}
