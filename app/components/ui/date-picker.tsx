import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
// Custom navigation icons from public/
import Calendar from "~/components/ui/calendar";

interface DatePickerProps {
    value?: string; // yyyy-mm-dd
    onChange: (next: string) => void;
    placeholder?: string;
}

function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
    const initialDate = useMemo(() => (value ? new Date(value) : new Date()), [value]);
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-based

    const selected = value ? new Date(value) : undefined;

    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long' });

    const handlePick = (day: number) => {
        const picked = new Date(viewYear, viewMonth, day);
        onChange(toISODate(picked));
        setOpen(false);
    };

    const displayText = selected ? selected.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start w-full h-10">
                    {displayText}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[376px] p-6 shadow-modal border border-neutral-40 rounded-2xl" align="start">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="px-0 py-0 rounded hover:bg-neutral-20"
                            aria-label="Previous year"
                            onClick={() => setViewYear(y => y - 1)}
                        >
                            <img src="/u_angle-double-left.svg" alt="Previous year" className="w-6" />
                        </button>
                        <button
                            type="button"
                            className="px-0 py-0 rounded hover:bg-neutral-20"
                            aria-label="Previous month"
                            onClick={() => {
                                const m = viewMonth - 1;
                                if (m < 0) { setViewMonth(11); setViewYear(y => y - 1); } else { setViewMonth(m); }
                            }}
                        >
                            <img src="/u_angle-left.svg" alt="Previous month" className="w-6" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <MonthPicker value={viewMonth} onChange={setViewMonth} />
                        <YearPicker value={viewYear} onChange={setViewYear} />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="px-0 py-0 rounded hover:bg-neutral-20"
                            aria-label="Next month"
                            onClick={() => {
                                const m = viewMonth + 1;
                                if (m > 11) { setViewMonth(0); setViewYear(y => y + 1); } else { setViewMonth(m); }
                            }}
                        >
                            <img src="/u_angle-right.svg" alt="Next month" className="w-6" />
                        </button>
                        <button
                            type="button"
                            className="px-0 py-0 rounded hover:bg-neutral-20"
                            aria-label="Next year"
                            onClick={() => setViewYear(y => y + 1)}
                        >
                            <img src="/u_angle-double-right.svg" alt="Next year" className="w-6" />                        </button>
                    </div>
                </div>
                <Calendar
                    selected={selected}
                    onSelect={(d) => { if (d) { onChange(toISODate(d)); setOpen(false); } }}
                    month={new Date(viewYear, viewMonth, 1)}
                    onMonthChange={(m) => { setViewYear(m.getFullYear()); setViewMonth(m.getMonth()); }}
                    showOutsideDays
                />
            </PopoverContent>
        </Popover>
    );
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'short' }), value: i }));

function MonthPicker({ value, onChange }: { value: number; onChange: (m: number) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 px-2 text-sm text-neutral-100">
                    {MONTHS[value].label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-2" align="center">
                <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map(m => (
                        <button
                            key={m.value}
                            type="button"
                            className={`px-2 py-1 rounded text-sm hover:bg-neutral-20 ${m.value === value ? 'bg-primary-surface text-primary-main border border-primary-border' : 'text-neutral-100'}`}
                            onClick={() => { onChange(m.value); setOpen(false); }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function YearPicker({ value, onChange }: { value: number; onChange: (y: number) => void }) {
    const [open, setOpen] = useState(false);
    const years = useMemo(() => {
        const current = new Date().getFullYear();
        const start = current - 50;
        const end = current + 10;
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, []);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 px-2 text-sm text-neutral-100">
                    {value}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[120px] p-2" align="center">
                <div className="max-h-64 overflow-y-auto">
                    {years.map(y => (
                        <button
                            key={y}
                            type="button"
                            className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-neutral-20 ${y === value ? 'bg-primary-surface text-primary-main border border-primary-border' : 'text-neutral-100'}`}
                            onClick={() => { onChange(y); setOpen(false); }}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}


