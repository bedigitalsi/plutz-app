import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import InquiryCard from '@/Components/InquiryCard';
import { useTranslation } from '@/hooks/useTranslation';

interface Inquiry {
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
    band_members?: {
        id: number;
        name: string;
    }[];
}

interface Props {
    inquiries: {
        data: Inquiry[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function Index({ inquiries, filters }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('inquiries.index'), params, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('inquiries.index'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('inquiries.title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('inquiries.title')}</h2>
                    <Link href={route('inquiries.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('inquiries.new_inquiry')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400">
                                    {t('common.search')}
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('inquiries.search_placeholder')}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400">
                                    {t('common.status')}
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                >
                                    <option value="">{t('inquiries.all')}</option>
                                    <option value="pending">{t('inquiries.pending')}</option>
                                    <option value="confirmed">{t('inquiries.confirmed')}</option>
                                    <option value="rejected">{t('inquiries.rejected')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400">
                                    {t('inquiries.from_date')}
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400">
                                    {t('inquiries.to_date')}
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                            >
                                {t('inquiries.apply_filters')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-md bg-plutz-tan/20 px-4 py-2 text-sm font-semibold text-stone-400 hover:bg-plutz-tan/30"
                            >
                                {t('common.reset')}
                            </button>
                        </div>
                    </div>

                    {/* Inquiries List */}
                    {inquiries.data.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">{t('inquiries.no_inquiries')}</p>
                            <Link
                                href={route('inquiries.create')}
                                className="mt-4 inline-block text-plutz-tan hover:text-plutz-tan"
                            >
                                {t('inquiries.create_first')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inquiries.data.map((inquiry) => (
                                    <InquiryCard key={inquiry.id} inquiry={inquiry} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {inquiries.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex gap-2">
                                        {inquiries.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded-md px-3 py-2 text-sm ${
                                                    link.active
                                                        ? 'bg-plutz-tan text-plutz-dark'
                                                        : 'bg-plutz-surface text-stone-400 hover:bg-stone-900/50'
                                                } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
        </AuthenticatedLayout>
    );
}
