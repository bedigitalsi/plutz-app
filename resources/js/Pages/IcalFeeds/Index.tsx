import React, { FormEventHandler, useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface IcalFeed {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    creator: {
        name: string;
    };
}

interface Props {
    feeds: IcalFeed[];
    baseUrl: string;
}

export default function Index({ feeds, baseUrl }: Props) {
    const { flash } = usePage().props as any;
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [generatedToken, setGeneratedToken] = useState('');
    const [copiedToken, setCopiedToken] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    useEffect(() => {
        if (flash?.plainToken) {
            setGeneratedToken(flash.plainToken);
            setShowTokenModal(true);
        }
    }, [flash]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('ical-feeds.store'), {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            },
        });
    };

    const handleDelete = (feedId: number) => {
        if (confirm('Are you sure you want to delete this feed? The subscription URL will stop working.')) {
            router.delete(route('ical-feeds.destroy', feedId));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="iCal Feeds" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">iCal Feeds</h2>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Info Banner */}
                    <div className="mb-6 rounded-lg bg-plutz-tan/10 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-plutz-tan">About iCal Feeds</h3>
                                <div className="mt-2 text-sm text-plutz-tan">
                                    <p>
                                        Create feeds to subscribe to your confirmed inquiries in Apple Calendar or other calendar apps.
                                        Each feed generates a unique URL that you can copy and use in your calendar app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create Form */}
                    {showCreateForm && (
                        <div className="mb-6 overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <form onSubmit={submit} className="p-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Feed Name *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. My Calendar"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="rounded-md bg-plutz-tan/20 px-4 py-2 text-sm font-semibold text-stone-400 hover:bg-plutz-tan/30"
                                    >
                                        Cancel
                                    </button>
                                    <PrimaryButton disabled={processing}>
                                        Create Feed
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Token Modal */}
                    {showTokenModal && generatedToken && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" onClick={() => setShowTokenModal(false)}>
                                    <div className="absolute inset-0 bg-stone-900/500 opacity-75"></div>
                                </div>

                                <div className="inline-block transform overflow-hidden rounded-lg bg-plutz-surface text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                                    <div className="bg-plutz-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500/100/10 sm:mx-0 sm:h-10 sm:w-10">
                                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <h3 className="text-lg font-medium leading-6 text-plutz-cream">
                                                    Feed Created Successfully!
                                                </h3>
                                                <div className="mt-4">
                                                    <p className="text-sm text-stone-500 mb-2">
                                                        Copy this URL to subscribe in your calendar app. This token will only be shown once!
                                                    </p>
                                                    <div className="mt-2 rounded-md bg-stone-800 p-3">
                                                        <code className="text-xs break-all">
                                                            {baseUrl}/{generatedToken}.ics
                                                        </code>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(`${baseUrl}/${generatedToken}.ics`)}
                                                        className="mt-3 w-full rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                                                    >
                                                        {copiedToken ? '✓ Copied!' : 'Copy URL'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-stone-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            onClick={() => setShowTokenModal(false)}
                                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-stone-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-stone-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feeds List */}
                    {feeds.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No feeds created yet.</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="mt-4 inline-block text-plutz-tan hover:text-plutz-tan"
                            >
                                Create your first feed
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feeds.map((feed) => (
                                <div
                                    key={feed.id}
                                    className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-plutz-cream">
                                                    {feed.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-stone-400">
                                                    Created by {feed.creator.name} on {formatDate(feed.created_at)}
                                                </p>
                                                <p className="mt-2 text-xs text-stone-500">
                                                    This feed shows all confirmed inquiries.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(feed.id)}
                                                className="ml-4 rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-red-500/100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </AuthenticatedLayout>
    );
}
