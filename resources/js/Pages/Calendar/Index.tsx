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
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {currentTitle || 'Calendar'}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Navigation */}
                        <div className="flex rounded-md shadow-sm" role="group">
                            <SecondaryButton
                                onClick={goToPrev}
                                className="rounded-r-none border-r-0 px-3"
                                title="Previous"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={goToToday}
                                className="rounded-none px-3"
                            >
                                Today
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={goToNext}
                                className="rounded-l-none border-l-0 px-3"
                                title="Next"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </SecondaryButton>
                        </div>

                        {/* View Switcher */}
                        <div className="flex rounded-md shadow-sm" role="group">
                            {view === 'dayGridMonth' ? (
                                <PrimaryButton onClick={() => changeView('dayGridMonth')} className="rounded-r-none border-r-0">
                                    Month
                                </PrimaryButton>
                            ) : (
                                <SecondaryButton onClick={() => changeView('dayGridMonth')} className="rounded-r-none border-r-0">
                                    Month
                                </SecondaryButton>
                            )}
                            
                            {view === 'timeGridWeek' ? (
                                <PrimaryButton onClick={() => changeView('timeGridWeek')} className="rounded-none">
                                    Week
                                </PrimaryButton>
                            ) : (
                                <SecondaryButton onClick={() => changeView('timeGridWeek')} className="rounded-none">
                                    Week
                                </SecondaryButton>
                            )}
                            
                            {view === 'timeGridDay' ? (
                                <PrimaryButton onClick={() => changeView('timeGridDay')} className="rounded-l-none border-l-0">
                                    Day
                                </PrimaryButton>
                            ) : (
                                <SecondaryButton onClick={() => changeView('timeGridDay')} className="rounded-l-none border-l-0">
                                    Day
                                </SecondaryButton>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Legend */}
                    <div className="mb-6 flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-amber-500"></div>
                            <span className="text-sm text-gray-700">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-green-500"></div>
                            <span className="text-sm text-gray-700">Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded bg-gray-500"></div>
                            <span className="text-sm text-gray-700">Rejected</span>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
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
            </div>
        </AuthenticatedLayout>
    );
}
