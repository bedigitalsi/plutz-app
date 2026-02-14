import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

interface CalendarEvent {
    id: number;
    date: string;
    day: number;
    title: string;
    location_address: string | null;
    status: string;
    time: string | null;
    price: number | null;
    currency: string;
    performance_type: string | null;
    contact_person: string | null;
}

interface UpcomingEvent {
    id: number;
    date: string;
    day_label: string;
    day_name: string;
    title: string;
    location_address: string | null;
    status: string;
    time: string | null;
    price: number | null;
    currency: string;
}

interface Props {
    currentMonth: string;
    monthLabel: string;
    events: CalendarEvent[];
    upcoming: UpcomingEvent[];
    calendarStart: string;
    calendarEnd: string;
    today: string;
}

export default function Index({ currentMonth, monthLabel, events, upcoming, calendarStart, calendarEnd, today }: Props) {
    const { t } = useTranslation();
    const hidePrices = (usePage().props.auth as any).user?.hide_prices;
    const [modalDate, setModalDate] = useState<string | null>(null);
    const [modalEvents, setModalEvents] = useState<CalendarEvent[]>([]);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] = [];
        const [year, month] = currentMonth.split('-').map(Number);
        const start = new Date(calendarStart + 'T00:00:00');
        const end = new Date(calendarEnd + 'T00:00:00');

        const current = new Date(start);
        while (current <= end) {
            const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            const dayNum = current.getDate();
            const isCurrentMonth = current.getMonth() + 1 === month && current.getFullYear() === year;
            const isToday = dateStr === today;
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push({ date: dateStr, day: dayNum, isCurrentMonth, isToday, events: dayEvents });
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [currentMonth, calendarStart, calendarEnd, events, today]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const [year, month] = currentMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + (direction === 'next' ? 1 : -1), 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        router.visit(route('calendar.index', { month: newMonth }));
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price) + ' ' + currency;
    };

    const getBadgeColor = (dayEvents: CalendarEvent[]) => {
        const hasConfirmed = dayEvents.some(e => e.status === 'confirmed');
        const hasRejected = dayEvents.some(e => e.status === 'rejected');
        if (hasConfirmed) return 'emerald';
        if (hasRejected) return 'red';
        return 'amber';
    };

    const colorClasses: Record<string, { badge: string; text: string }> = {
        emerald: { badge: 'bg-emerald-500 shadow-lg shadow-emerald-500/30', text: 'text-white' },
        red: { badge: 'bg-red-500 shadow-lg shadow-red-500/30', text: 'text-white' },
        amber: { badge: 'bg-amber-500 shadow-lg shadow-amber-500/30', text: 'text-black' },
    };

    const openModal = (date: string, dayEvents: CalendarEvent[]) => {
        setModalDate(date);
        setModalEvents(dayEvents);
    };

    const closeModal = () => {
        setModalDate(null);
        setModalEvents([]);
    };

    const formatModalDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('sl-SI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const statusDotColor = (status: string) => {
        if (status === 'confirmed') return 'bg-emerald-400';
        if (status === 'rejected') return 'bg-red-400';
        return 'bg-amber-400';
    };

    const statusLabel = (status: string) => {
        if (status === 'confirmed') return t('calendar.confirmed');
        if (status === 'rejected') return t('calendar.rejected') || 'Zavrnjeno';
        return t('calendar.pending');
    };

    const weekDays = [t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun')];

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('calendar.title')} />

            <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                    {/* Left Column: Calendar Grid (2/3) */}
                    <section className="lg:col-span-2 flex flex-col gap-6">

                        {/* Calendar Header */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-2 rounded-lg hover:bg-plutz-surface text-stone-400 hover:text-white transition-colors group"
                            >
                                <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
                            </button>
                            <h2 className="font-serif text-3xl font-semibold text-white tracking-wide">{monthLabel}</h2>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-2 rounded-lg hover:bg-plutz-surface text-stone-400 hover:text-white transition-colors group"
                            >
                                <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                            </button>
                        </div>

                        {/* Calendar Component */}
                        <div className="flex flex-col gap-4">
                            {/* Weekdays Header */}
                            <div className="grid grid-cols-7 text-center">
                                {weekDays.map(d => (
                                    <div key={d} className="text-xs font-semibold text-stone-500 uppercase tracking-widest py-2">{d}</div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-2 lg:gap-3 auto-rows-fr">
                                {calendarDays.map((day) => (
                                    <div
                                        key={day.date}
                                        onClick={() => {
                                            if (!day.isCurrentMonth) return;
                                            if (day.events.length > 0) {
                                                openModal(day.date, day.events);
                                            } else {
                                                router.visit(route('inquiries.create', { date: day.date }));
                                            }
                                        }}
                                        className={`min-h-[80px] lg:min-h-[120px] rounded-lg p-2 lg:p-3 flex flex-col transition-colors overflow-hidden ${
                                            !day.isCurrentMonth
                                                ? 'bg-plutz-surface/30 text-stone-600 cursor-default'
                                                : day.isToday
                                                    ? 'bg-plutz-surface border border-plutz-tan cursor-pointer hover:bg-[#2a2624] shadow-[0_0_15px_-3px_rgba(164,137,112,0.15)]'
                                                    : 'bg-plutz-surface cursor-pointer hover:bg-[#2a2624] group'
                                        }`}
                                    >
                                        {/* Day Number */}
                                        {day.isToday ? (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-bold text-plutz-tan">{day.day}</span>
                                                <span className="hidden lg:inline text-[10px] uppercase font-bold text-plutz-tan tracking-wide">{t('calendar.today')}</span>
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-medium ${day.isCurrentMonth ? 'text-plutz-cream group-hover:text-plutz-tan transition-colors' : ''}`}>
                                                {day.day}
                                            </span>
                                        )}

                                        {/* Event Count Badge */}
                                        {day.events.length > 0 && (() => {
                                            const color = getBadgeColor(day.events);
                                            const cls = colorClasses[color];
                                            return (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center ${cls.badge}`}>
                                                        <span className={`text-base lg:text-lg font-bold ${cls.text}`}>{day.events.length}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Upcoming Events (1/3) */}
                    <aside className="lg:col-span-1">
                        <div className="bg-plutz-surface rounded-xl p-6 h-full border border-[#2d2a28] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-xl font-semibold text-white">{t('calendar.upcoming_events')}</h3>
                                <Link
                                    href={route('inquiries.index')}
                                    className="text-xs text-plutz-tan font-medium hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    {t('calendar.view_all')}
                                </Link>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                {upcoming.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={route('inquiries.show', event.id)}
                                        className={`group flex flex-col p-4 rounded-lg transition-all cursor-pointer ${
                                            event.status === 'confirmed'
                                                ? 'border-2 border-emerald-500/60 bg-emerald-500/5 hover:border-emerald-400 hover:bg-emerald-500/10'
                                                : event.status === 'rejected'
                                                    ? 'border-2 border-red-500/60 bg-red-500/5 hover:border-red-400 hover:bg-red-500/10'
                                                    : 'border-2 border-amber-500/60 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-500/10'
                                        }`}
                                    >
                                        {/* Header: Date + Status */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-plutz-cream">{event.day_label}</span>
                                                <span className="text-sm text-stone-400 font-medium">{event.day_name}</span>
                                            </div>
                                            {event.status === 'confirmed' ? (
                                                <span className="px-2.5 py-1 rounded bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/25">
                                                    {t('calendar.confirmed')}
                                                </span>
                                            ) : event.status === 'rejected' ? (
                                                <span className="px-2.5 py-1 rounded bg-red-500 text-white text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-red-500/25">
                                                    {t('calendar.rejected') || 'ZAVRNJENO'}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded bg-amber-500 text-black text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-amber-500/25">
                                                    {t('calendar.pending')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Venue */}
                                        <div className="mb-1">
                                            <h4 className="text-base font-medium text-white group-hover:text-plutz-tan transition-colors">{event.title}</h4>
                                            {event.location_address && (
                                                <p className="text-sm text-stone-400">{event.location_address}</p>
                                            )}
                                        </div>

                                        {/* Footer: Time + Price */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#3a3633]">
                                            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                <span>{event.time || t('calendar.tbd')}</span>
                                            </div>
                                            {!hidePrices && event.status === 'confirmed' && event.price ? (
                                                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                                    <span>{formatPrice(event.price, event.currency)}</span>
                                                </div>
                                            ) : event.status === 'pending' ? (
                                                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                                    <span>{t('calendar.awaiting_reply')}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </Link>
                                ))}

                                {upcoming.length === 0 && (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-stone-600 text-4xl block mb-2">event_busy</span>
                                        <p className="text-stone-500 text-sm">{t('calendar.no_upcoming_events')}</p>
                                    </div>
                                )}

                                {/* Add Event Button */}
                                <div className="pt-4">
                                    <Link
                                        href={route('inquiries.create')}
                                        className="w-full py-3 rounded border border-dashed border-stone-600 text-stone-400 hover:text-white hover:border-stone-400 hover:bg-[#252220] transition-all text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        {t('calendar.add_event_request')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Modal for day events */}
            {modalDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative bg-plutz-surface rounded-xl border border-[#2d2a28] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#2d2a28]">
                            <h3 className="font-serif text-xl font-semibold text-white capitalize">{formatModalDate(modalDate)}</h3>
                            <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {modalEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={route('inquiries.show', event.id)}
                                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                                        event.status === 'confirmed'
                                            ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                                            : event.status === 'rejected'
                                                ? 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10'
                                                : 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10'
                                    }`}
                                >
                                    {/* Status dot */}
                                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${statusDotColor(event.status)}`} />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-base font-semibold text-white truncate">{event.title}</h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 px-2 py-0.5 rounded ${
                                                event.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300'
                                                : event.status === 'rejected' ? 'bg-red-500/20 text-red-300'
                                                : 'bg-amber-500/20 text-amber-300'
                                            }`}>{statusLabel(event.status)}</span>
                                        </div>
                                        <div className="mt-1 space-y-0.5">
                                            {event.contact_person && (
                                                <p className="text-sm text-stone-400 flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                                    {event.contact_person}
                                                </p>
                                            )}
                                            {event.location_address && (
                                                <p className="text-sm text-stone-400 flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                    {event.location_address}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            {event.time && (
                                                <span className="text-xs text-stone-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {event.time}
                                                </span>
                                            )}
                                            {!hidePrices && event.price != null && (
                                                <span className="text-xs text-stone-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">payments</span>
                                                    {formatPrice(event.price, event.currency)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Modal Footer — Add New */}
                        <div className="p-5 border-t border-[#2d2a28]">
                            <Link
                                href={route('inquiries.create', { date: modalDate })}
                                className="w-full py-3 rounded-lg border border-dashed border-stone-600 text-stone-400 hover:text-white hover:border-stone-400 hover:bg-[#252220] transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                {t('calendar.add_event_request')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
