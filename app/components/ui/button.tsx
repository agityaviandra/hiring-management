import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-m-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus disabled:pointer-events-none disabled:bg-neutral-30 disabled:border disabled:border-[#e0e0e0] disabled:text-neutral-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary-main !text-neutral-10 shadow-sm hover:bg-primary-hover active:bg-primary-pressed focus-visible:ring-primary-focus",
                "alternative-primary":
                    "bg-secondary-main !text-neutral-90 shadow-sm hover:bg-secondary-hover active:bg-secondary-pressed focus-visible:ring-secondary-focus",
                outline:
                    "border border-neutral-40 bg-white text-neutral-100 shadow-sm hover:bg-neutral-20 hover:text-neutral-100 active:bg-neutral-30 focus-visible:ring-primary-focus",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-4 text-s-bold",
                lg: "h-12 rounded-md px-4 py-1.5 text-l-bold",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
