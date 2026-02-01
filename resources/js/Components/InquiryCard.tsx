import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import StatusBadge from './StatusBadge';

interface InquiryCardProps {
    inquiry: {
        id: number;
        performance_date: string;
        performance_time_exact?: string;
        performance_time_text?: string;
        location_name: string;
        contact_person: string;
        status: 'pending' | 'confirmed' | 'rejected';
        price_amount?: number;
        currency?: string;
        performance_type?: {
            name: string;
        };
        band_size?: {
            label: string;
        };
    };
}

export default function InquiryCard({ inquiry }: InquiryCardProps) {
    const hidePrices = (usePage().props.auth as any).user?.hide_prices;
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (timeString.includes('T') || timeString.includes(' ')) {
            return new Date(timeString).toLocaleTimeString('sl-SI', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        return timeString.substring(0, 5);
    };

    return (
        <Link
            href={route('inquiries.show', inquiry.id)}
            className="block rounded-xl border border-plutz-tan/10 bg-plutz-surface p-4 shadow-sm transition hover:border-plutz-tan/30"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-plutz-cream">
                            {inquiry.location_name}
                        </h3>
                        <StatusBadge status={inquiry.status} />
                    </div>
                    
                    <div className="space-y-1 text-sm text-stone-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-stone-500">calendar_today</span>
                            <span>{formatDate(inquiry.performance_date)}</span>
                            {inquiry.performance_time_exact && (
                                <span className="text-stone-500">at {formatTime(inquiry.performance_time_exact)}</span>
                            )}
                            {inquiry.performance_time_text && (
                                <span className="text-stone-500">({inquiry.performance_time_text})</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-stone-500">person</span>
                            <span>{inquiry.contact_person}</span>
                        </div>

                        {inquiry.performance_type && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-stone-500">music_note</span>
                                <span>{inquiry.performance_type.name}</span>
                                {inquiry.band_size && (
                                    <span className="text-stone-500">• {inquiry.band_size.label}</span>
                                )}
                            </div>
                        )}

                        {!hidePrices && inquiry.price_amount && (
                            <div className="mt-2 text-base font-semibold text-plutz-cream">
                                {inquiry.price_amount} {inquiry.currency || 'EUR'}
                            </div>
                        )}
                    </div>
                </div>

                <span className="material-symbols-outlined text-stone-500">chevron_right</span>
            </div>
        </Link>
    );
}
