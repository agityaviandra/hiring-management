import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "~/lib/utils"

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn("grid gap-2", className)}
            {...props}
            ref={ref}
        />
    )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                "aspect-square h-6 w-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <div className="relative size-6">
                {/* Outer circle (only when not selected) */}
                <div className="absolute inset-0 size-full [&:not([data-state='checked'])]:block [&[data-state='checked']]:hidden">
                    <img
                        src="/06d55109ec68719a028f100d9bfd92279044446f.svg"
                        alt=""
                        className="size-full"
                    />
                </div>
                {/* Inner circle (only when selected) */}
                <RadioGroupPrimitive.Indicator className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/19ff50bcd301e0b0aab861a28cf09a217f77e163.svg"
                        alt=""
                        className="size-4"
                    />
                </RadioGroupPrimitive.Indicator>
            </div>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
