import React from 'react';
import { Link } from '@inertiajs/react';
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
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        // If it's a full datetime string, parse it and extract time
        if (timeString.includes('T') || timeString.includes(' ')) {
            return new Date(timeString).toLocaleTimeString('sl-SI', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        // If it's already just a time string (HH:MM or HH:MM:SS), return as is
        return timeString.substring(0, 5); // Returns HH:MM
    };

    return (
        <Link
            href={route('inquiries.show', inquiry.id)}
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {inquiry.location_name}
                        </h3>
                        <StatusBadge status={inquiry.status} />
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(inquiry.performance_date)}</span>
                            {inquiry.performance_time_exact && (
                                <span className="text-gray-500">at {formatTime(inquiry.performance_time_exact)}</span>
                            )}
                            {inquiry.performance_time_text && (
                                <span className="text-gray-500">({inquiry.performance_time_text})</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{inquiry.contact_person}</span>
                        </div>

                        {inquiry.performance_type && (
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                <span>{inquiry.performance_type.name}</span>
                                {inquiry.band_size && (
                                    <span className="text-gray-400">• {inquiry.band_size.label}</span>
                                )}
                            </div>
                        )}

                        {inquiry.price_amount && (
                            <div className="mt-2 text-base font-semibold text-gray-900">
                                {inquiry.price_amount} {inquiry.currency || 'EUR'}
                            </div>
                        )}
                    </div>
                </div>

                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}
