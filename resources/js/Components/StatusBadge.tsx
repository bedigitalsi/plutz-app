import React from 'react';

interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const colors = {
        pending: 'bg-stone-800 text-stone-400 border border-stone-700',
        confirmed: 'bg-plutz-tan text-plutz-dark',
        rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };

    const labels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
        >
            {labels[status]}
        </span>
    );
}
