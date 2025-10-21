import { useEffect, useMemo, useState } from "react";
import { COUNTRY_CODES, type CountryCode } from "~/components/ui/country-codes";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    defaultCountryIso2?: string;
    placeholder?: string;
    hasError?: boolean;
}

export default function PhoneInput({ value, onChange, defaultCountryIso2 = 'US', placeholder = 'Enter phone number', hasError = false }: PhoneInputProps) {
    const defaultCountry = useMemo<CountryCode>(() => {
        return COUNTRY_CODES.find(c => c.iso2 === defaultCountryIso2) || COUNTRY_CODES[0];
    }, [defaultCountryIso2]);
    const [country, setCountry] = useState<CountryCode>(defaultCountry);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return COUNTRY_CODES;
        return COUNTRY_CODES.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.iso2.toLowerCase().includes(q) ||
            c.dialCode.includes(q.replace(/^[+]/, ""))
        );
    }, [query]);

    const stripAnyDialPrefix = (v: string) => v.replace(/^\s*\+?\d+\s*/, "");
    const stripSelectedDialPrefix = (v: string, dial: string) => v.replace(new RegExp(`^\\s*\\+?${dial}\\s*`), "");

    // Derive local part from the external value
    const localValue = useMemo(() => {
        if (!value) return "";
        // Prefer current country, fallback to any +digits prefix
        const fromSelected = stripSelectedDialPrefix(value, country.dialCode);
        if (fromSelected !== value) return fromSelected;
        return stripAnyDialPrefix(value);
    }, [value, country.dialCode]);

    // If value has a dial code that maps to another country, sync the selector
    useEffect(() => {
        if (!value) return;
        const match = value.match(/^\s*\+(\d+)/);
        if (!match) return;
        const dial = match[1];
        if (dial && dial !== country.dialCode) {
            const found = COUNTRY_CODES.find(c => c.dialCode === dial);
            if (found) setCountry(found);
        }
    }, [value]);

    const handleSelect = (c: CountryCode) => {
        setCountry(c);
        setOpen(false);
        const combined = localValue ? `+${c.dialCode} ${localValue}` : `+${c.dialCode}`;
        onChange(combined);
    };

    const fullValue = `+${country.dialCode} ${value}`.trim();

    return (
        <div className={`bg-white border-2 rounded-lg flex items-center px-4 py-2 h-10 focus-within:border-[3px] focus-within:border-primary-main/20 ${hasError ? 'border-danger-main' : 'border-neutral-40'}`}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button type="button" className="flex items-center gap-1 pr-2 text-neutral-100">
                        <span className="size-4 leading-none mr-1">{country.flag}</span>
                        <ChevronDownIcon className="size-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="start">
                    <div>
                        <Input
                            placeholder="Search country or code"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-9 border-neutral-40"
                        />
                    </div>
                    <div className="my-2 h-px w-full bg-neutral-40" />
                    <div className="max-h-64 overflow-y-auto">
                        {filtered.map(c => (
                            <button
                                type="button"
                                key={c.iso2}
                                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-neutral-20 ${c.iso2 === country.iso2 ? 'bg-neutral-20' : ''}`}
                                onClick={() => handleSelect(c)}
                            >
                                <span className="text-base leading-none">{c.flag}</span>
                                <span className="flex-1 text-sm text-neutral-100">{c.name}</span>
                                <span className="text-sm text-neutral-70">+{c.dialCode}</span>
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            <div className="mx-3 h-5 w-px bg-neutral-40" />

            <span className="text-neutral-100 text-sm mr-2">+{country.dialCode}</span>

            <input
                value={localValue}
                onChange={(e) => {
                    const nextLocal = e.target.value;
                    const combined = nextLocal ? `+${country.dialCode} ${nextLocal}` : `+${country.dialCode}`;
                    onChange(combined);
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm text-neutral-100 placeholder:text-neutral-60"
            />
        </div>
    );
}

export function getE164Value(raw: string, countryIso2: string): string {
    const c = COUNTRY_CODES.find(cc => cc.iso2.toLowerCase() === countryIso2.toLowerCase());
    const digits = String(raw).replace(/\D/g, "");
    return c ? `+${c.dialCode}${digits}` : digits;
}


