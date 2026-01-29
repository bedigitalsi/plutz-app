import { Head } from '@inertiajs/react';

export default function Install() {
    return (
        <>
            <Head title="Install Plutz App" />

            <div className="min-h-screen bg-plutz-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-plutz-surface shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-3xl font-bold text-plutz-cream mb-6">
                                Install Plutz on Your iPhone
                            </h1>

                            <div className="prose prose-blue max-w-none">
                                <h2 className="text-xl font-semibold text-plutz-cream mt-6 mb-4">
                                    Installation Steps
                                </h2>

                                <ol className="list-decimal list-inside space-y-4 text-stone-400">
                                    <li className="pl-2">
                                        <strong>Open Safari</strong> on your iPhone (this only works in Safari, not Chrome or other browsers)
                                    </li>
                                    <li className="pl-2">
                                        <strong>Navigate to</strong> the Plutz app URL
                                    </li>
                                    <li className="pl-2">
                                        <strong>Tap the Share button</strong> (the square with an arrow pointing up) at the bottom of the screen
                                    </li>
                                    <li className="pl-2">
                                        <strong>Scroll down</strong> and tap "Add to Home Screen"
                                    </li>
                                    <li className="pl-2">
                                        <strong>Confirm</strong> by tapping "Add" in the top-right corner
                                    </li>
                                </ol>

                                <div className="mt-8 bg-plutz-tan/10 border-l-4 border-plutz-tan/30 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-blue-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-plutz-tan">
                                                <strong>Tip:</strong> Once installed, the app will open in full-screen mode without the Safari browser chrome, giving you a native app experience!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold text-plutz-cream mt-8 mb-4">
                                    Benefits of Installing
                                </h2>

                                <ul className="list-disc list-inside space-y-2 text-stone-400">
                                    <li className="pl-2">Quick access from your home screen</li>
                                    <li className="pl-2">Full-screen experience without browser UI</li>
                                    <li className="pl-2">Faster loading times</li>
                                    <li className="pl-2">Works like a native app</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

