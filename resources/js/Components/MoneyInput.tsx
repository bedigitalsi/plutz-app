import React from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import InputError from './InputError';

interface MoneyInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    currency?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function MoneyInput({
    label,
    value,
    onChange,
    error,
    currency = 'EUR',
    required = false,
    disabled = false,
}: MoneyInputProps) {
    return (
        <div>
            {label && <InputLabel value={label + (required ? ' *' : '')} />}
            <div className="mt-1 flex rounded-md shadow-sm">
                <TextInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full rounded-none rounded-l-md"
                    disabled={disabled}
                    required={required}
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    {currency}
                </span>
            </div>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
