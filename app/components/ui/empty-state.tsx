import * as React from "react";
import { Link } from "react-router";
import { Button } from "./button";
import { cn } from "~/lib/utils";

export interface EmptyStateProps {
    className?: string;
    illustration?: string;
    title: string;
    description: string;
    actionText?: string;
    actionOnClick?: () => void;
    actionVariant?: "default" | "alternative-primary" | "outline";
    actionSize?: "default" | "sm" | "lg" | "icon";
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({
        className,
        illustration = "/empty-state.svg",
        title,
        description,
        actionText,
        actionOnClick,
        actionVariant = "alternative-primary",
        actionSize = "lg",
        ...props
    }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col items-center justify-center py-16 space-y-6",
                    className
                )}
                {...props}
            >
                {/* Empty State Illustration */}
                <div className="w-80 h-80 relative">
                    <img
                        src={illustration}
                        alt="Empty state illustration"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Empty State Text */}
                <div className="text-center space-y-1">
                    <h2 className={`${actionText ? "heading-s-bold text-neutral-100 " : "text-l-bold text-neutral-100 mb-2"}`}>{title}</h2>
                    <p className={`${actionText ? "text-l-regular text-neutral-70" : "text-m-regular text-neutral-70"}`}>{description}</p>
                </div>

                {/* CTA Button */}
                {actionText && (
                    <Button onClick={actionOnClick} variant={actionVariant} size={actionSize}>
                        {actionText}
                    </Button>
                )}
            </div>
        );
    }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
