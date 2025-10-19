import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuthStore } from "~/stores/useAuthStore";

export function AdminHeader() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="border-b bg-white">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/jobs" className="text-xl font-bold">
                        Hiring Management
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/admin/jobs"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Jobs
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex flex-col space-y-1 p-2">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                            <DropdownMenuItem onClick={handleLogout}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
