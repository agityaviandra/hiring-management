import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast as sonnerToast } from "sonner";
import { cn } from "~/lib/utils";

interface ToastProps {
    title: string;
    description?: string;
    variant?: "success" | "error" | "warning" | "info";
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const ToastComponent = ({ title, description, variant = "success" }: ToastProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case "success":
                return "border-l-4 border-primary-main";
            case "error":
                return "border-l-4 border-danger-main";
            case "warning":
                return "border-l-4 border-warning-main";
            case "info":
                return "border-l-4 border-info-main";
            default:
                return "border-l-4 border-primary-main";
        }
    };

    const getIcon = () => {
        switch (variant) {
            case "success":
                return <CheckCircleIcon className="w-6 h-6 text-primary-main" />;
            case "error":
                return <XMarkIcon className="w-6 h-6 text-danger-main" />;
            case "warning":
                return <XMarkIcon className="w-6 h-6 text-warning-main" />;
            case "info":
                return <XMarkIcon className="w-6 h-6 text-info-main" />;
            default:
                return <CheckCircleIcon className="w-6 h-6 text-primary-main" />;
        }
    };

    return (
        <div className={cn(
            "bg-white border border-solid rounded-lg w-[319px] shadow-modal",
            getVariantStyles()
        )}>
            <div className="flex gap-2 items-center p-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-m-bold text-neutral-90 leading-6">
                        {title}
                    </p>
                    {description && (
                        <p className="text-s-regular text-neutral-60 leading-5 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={() => sonnerToast.dismiss()}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-neutral-20 rounded transition-colors"
                >
                    <XMarkIcon className="w-4 h-4 text-neutral-70" />
                </button>
            </div>
        </div>
    );
};

export const toast = {
    success: (props: Omit<ToastProps, "variant">) => {
        return sonnerToast.custom(() => (
            <ToastComponent {...props} variant="success" />
        ), {
            duration: props.duration || 4000,
        });
    },

    error: (props: Omit<ToastProps, "variant">) => {
        return sonnerToast.custom(() => (
            <ToastComponent {...props} variant="error" />
        ), {
            duration: props.duration || 6000,
        });
    },

    warning: (props: Omit<ToastProps, "variant">) => {
        return sonnerToast.custom(() => (
            <ToastComponent {...props} variant="warning" />
        ), {
            duration: props.duration || 5000,
        });
    },

    info: (props: Omit<ToastProps, "variant">) => {
        return sonnerToast.custom(() => (
            <ToastComponent {...props} variant="info" />
        ), {
            duration: props.duration || 4000,
        });
    },
};

export { Toaster } from "sonner";