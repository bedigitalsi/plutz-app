import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index() {
    const calendarRef = useRef<any>(null);
    const [view, setView] = useState('dayGridMonth');
    const [currentTitle, setCurrentTitle] = useState('');

    const fetchEvents = (fetchInfo: any, successCallback: any, failureCallback: any) => {
        fetch(
            route('calendar.events', {
                start: fetchInfo.startStr,
                end: fetchInfo.endStr,
            })
        )
            .then((response) => response.json())
            .then((data) => successCallback(data))
            .catch((error) => {
                console.error('Error fetching events:', error);
                failureCallback(error);
            });
    };

    const handleEventClick = (clickInfo: any) => {
        const inquiryId = clickInfo.event.extendedProps.inquiry_id;
        if (inquiryId) {
            router.visit(route('inquiries.show', inquiryId));
        }
    };

    const handleDateClick = (arg: any) => {
        router.visit(route('inquiries.create', { date: arg.dateStr }));
    };

    const handleDatesSet = (arg: any) => {
        setCurrentTitle(arg.view.title);
    };

    const changeView = (newView: string) => {
        setView(newView);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(newView);
        }
    };

    const goToToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.today();
        }
    };

    const goToPrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.prev();
        }
    };

    const goToNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.next();
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Calendar" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{currentTitle || 'Calendar'}</h2>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Legend */}
                    <div className="mb-6 flex gap-4 rounded-lg bg-plutz-surface p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-amber-500"></div>
                            <span className="text-sm text-stone-400">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-green-500/100"></div>
                            <span className="text-sm text-stone-400">Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-stone-900/500"></div>
                            <span className="text-sm text-stone-400">Rejected</span>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="overflow-hidden rounded-lg bg-plutz-surface p-6 shadow-sm">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={fetchEvents}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}
                            datesSet={handleDatesSet}
                            height="auto"
                            locale="sl"
                            firstDay={1}
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            }}
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            }}
                            nowIndicator={true}
                            selectable={true}
                            eventDisplay="block"
                            displayEventTime={true}
                            displayEventEnd={false}
                        />
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
