import { useMemo } from "react";

export interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    month?: Date;
    onMonthChange?: (month: Date) => void;
    className?: string;
    showOutsideDays?: boolean;
}

export function Calendar({ selected, onSelect, month = new Date(), onMonthChange, className, showOutsideDays = false }: CalendarProps) {
    const viewYear = month.getFullYear();
    const viewMonth = month.getMonth();
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const prevMonthEnd = new Date(viewYear, viewMonth, 0).getDate();

    type Cell = { date: Date; inCurrentMonth: boolean } | null;
    const weeks = useMemo(() => {
        const totalCells = startDay + daysInMonth;
        const rowsNeeded = Math.ceil(totalCells / 7);
        const rows: Cell[][] = [];
        let current = 1 - startDay;
        for (let r = 0; r < rowsNeeded; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < 7; c++) {
                if (current < 1) {
                    if (showOutsideDays) {
                        const day = prevMonthEnd + current;
                        row.push({ date: new Date(viewYear, viewMonth - 1, day), inCurrentMonth: false });
                    } else {
                        row.push(null);
                    }
                } else if (current > daysInMonth) {
                    if (showOutsideDays) {
                        const day = current - daysInMonth;
                        row.push({ date: new Date(viewYear, viewMonth + 1, day), inCurrentMonth: false });
                    } else {
                        row.push(null);
                    }
                } else {
                    row.push({ date: new Date(viewYear, viewMonth, current), inCurrentMonth: true });
                }
                current++;
            }
            rows.push(row);
        }
        return rows;
    }, [startDay, daysInMonth, prevMonthEnd, showOutsideDays, viewMonth, viewYear]);

    const isSelected = (day: number) => selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;

    return (
        <div className={className}>
            <div className="grid grid-cols-7 gap-1 text-xs text-neutral-100 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-m-bold mx-auto py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {weeks.flatMap((row, ri) => row.map((cell, ci) => {
                    const key = `${ri}-${ci}`;
                    if (!cell) return <div key={key} className="h-8" />;
                    const d = cell.date;
                    const selectedDay = isSelected(d.getDate()) && cell.inCurrentMonth;
                    const muted = !cell.inCurrentMonth;
                    return (
                        <button
                            key={key}
                            className={`h-8 rounded text-sm text-center hover:bg-neutral-20 ${selectedDay ? 'bg-primary-surface text-primary-main border border-primary-border' : muted ? 'text-neutral-60' : 'text-neutral-90'}`}
                            onClick={() => {
                                if (!onSelect) return;
                                onSelect(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
                                if (onMonthChange && !cell.inCurrentMonth) onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
                            }}
                        >
                            {d.getDate()}
                        </button>
                    );
                }))}
            </div>
        </div>
    );
}

export default Calendar;


