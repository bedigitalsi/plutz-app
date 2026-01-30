import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation();

    const colors = {
        pending: 'bg-stone-800 text-stone-400 border border-stone-700',
        confirmed: 'bg-plutz-tan text-plutz-dark',
        rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };

    const labels = {
        pending: t('component.status_pending'),
        confirmed: t('component.status_confirmed'),
        rejected: t('component.status_rejected'),
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
        >
            {labels[status]}
        </span>
    );
}
