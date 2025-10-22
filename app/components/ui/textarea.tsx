import * as React from "react"

import { cn } from "~/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
    enableBulletList?: boolean;
    hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, enableBulletList = false, hasError = false, ...props }, ref) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (!enableBulletList) {
                props.onKeyDown?.(e);
                return;
            }

            const textarea = e.currentTarget;
            const { value, selectionStart, selectionEnd } = textarea;

            if (e.key === 'Enter') {
                const beforeCursor = value.substring(0, selectionStart);
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];

                if (currentLine.trim().startsWith('•') || currentLine.trim().startsWith('-')) {
                    e.preventDefault();

                    const indentMatch = currentLine.match(/^(\s*)/);
                    const indent = indentMatch ? indentMatch[1] : '';

                    const newValue =
                        value.substring(0, selectionStart) +
                        '\n' + indent + '• ' +
                        value.substring(selectionEnd);

                    textarea.value = newValue;

                    const newCursorPos = selectionStart + indent.length + 3;
                    setTimeout(() => {
                        textarea.setSelectionRange(newCursorPos, newCursorPos);
                    }, 0);

                    const changeEvent = {
                        target: textarea,
                        currentTarget: textarea,
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    props.onChange?.(changeEvent);
                }
            }

            if (e.key === 'Backspace') {
                const beforeCursor = value.substring(0, selectionStart);
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];

                if (currentLine.trim() === '•' || currentLine.trim() === '-') {
                    e.preventDefault();

                    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
                    const newValue =
                        value.substring(0, lineStart) +
                        value.substring(selectionEnd);

                    textarea.value = newValue;

                    const newCursorPos = lineStart;
                    setTimeout(() => {
                        textarea.setSelectionRange(newCursorPos, newCursorPos);
                    }, 0);

                    const changeEvent = {
                        target: textarea,
                        currentTarget: textarea,
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    props.onChange?.(changeEvent);
                }
            }

            props.onKeyDown?.(e);
        };

        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full text-m-regular text-neutral-100 rounded-lg border-2 border-solid bg-white px-4 py-2 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-100 placeholder:text-neutral-60 focus-visible:outline-none focus-visible:border-[3px] focus-visible:border-primary-main/20 disabled:cursor-not-allowed disabled:opacity-50",
                    hasError ? "border-danger-main" : "border-neutral-40",
                    enableBulletList && "whitespace-pre-wrap",
                    className
                )}
                ref={ref}
                onKeyDown={handleKeyDown}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
