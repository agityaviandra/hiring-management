import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import PhoneInput from "~/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import DatePicker from "~/components/ui/date-picker";

export interface CandidateFilters {
    name: string;
    email: string;
    phone: string;
    gender: string;
    domicile: string;
    appliedDate: string;
}

interface FilterPopOverProps {
    filters: CandidateFilters;
    onChange: (next: CandidateFilters) => void;
    onClear?: () => void;
}

export function FilterPopOver({ filters, onChange, onClear }: FilterPopOverProps) {
    const activeCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="px-4">
                    Filter{activeCount > 0 ? ` (${activeCount})` : ""}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-4" align="end">
                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Name</label>
                        <Input
                            value={filters.name}
                            onChange={(e) => onChange({ ...filters, name: e.target.value })}
                            placeholder="e.g. Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Email</label>
                        <Input
                            type="email"
                            value={filters.email}
                            onChange={(e) => onChange({ ...filters, email: e.target.value })}
                            placeholder="e.g. jane@mail.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Phone</label>
                        <PhoneInput
                            value={filters.phone}
                            onChange={(val) => onChange({ ...filters, phone: val })}
                            placeholder="e.g. 555 1234"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Gender</label>
                        <Select
                            value={filters.gender || undefined}
                            onValueChange={(val) => onChange({ ...filters, gender: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Domicile</label>
                        <Input
                            value={filters.domicile}
                            onChange={(e) => onChange({ ...filters, domicile: e.target.value })}
                            placeholder="e.g. San Francisco"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-70 mb-1">Applied Date</label>
                        <DatePicker
                            value={filters.appliedDate}
                            onChange={(val) => onChange({ ...filters, appliedDate: val })}
                        />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={onClear}>Clear all</Button>
                    {/* <Button size="sm">Apply</Button> */}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default FilterPopOver;


