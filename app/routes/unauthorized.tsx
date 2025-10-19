import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Unauthorized</CardTitle>
                    <CardDescription>
                        You don't have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600">
                            Please contact your administrator if you believe this is an error.
                        </p>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" className="flex-1">
                                <Link to="/login">Back to Login</Link>
                            </Button>
                            <Button asChild className="flex-1">
                                <Link to="/">Go Home</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
