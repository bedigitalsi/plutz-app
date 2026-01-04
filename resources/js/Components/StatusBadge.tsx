import React from 'react';

interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const colors = {
        pending: 'bg-amber-100 text-amber-800',
        confirmed: 'bg-green-100 text-green-800',
        rejected: 'bg-gray-100 text-gray-800',
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
