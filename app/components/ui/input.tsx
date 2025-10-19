import * as React from "react"

import { cn } from "~/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
    icon?: React.ReactNode | string
    iconPosition?: "left" | "right"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, iconPosition = "left", ...props }, ref) => {
        if (icon) {
            const iconElement = typeof icon === "string" ? (
                <span className="text-sm font-medium">{icon}</span>
            ) : (
                icon
            )

            return (
                <div className="relative">
                    {iconPosition === "left" && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-60 pointer-events-none">
                            {iconElement}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-10 w-full text-m-regular text-neutral-100 rounded-lg border-2 border-solid border-neutral-40 bg-white py-2 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-100 placeholder:text-neutral-60 focus-visible:outline-none focus-visible:border-[3px] focus-visible:border-primary-main/20 disabled:cursor-not-allowed disabled:opacity-50",
                            iconPosition === "left" ? "pl-8 pr-4" : "pl-4 pr-8",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {iconPosition === "right" && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-60 pointer-events-none">
                            {iconElement}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full text-m-regular text-neutral-100 rounded-lg border-2 border-solid border-neutral-40 bg-white px-4 py-2 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-100 placeholder:text-neutral-60 focus-visible:outline-none focus-visible:border-[3px] focus-visible:border-primary-main/20 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
