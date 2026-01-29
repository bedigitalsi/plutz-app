import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Settings {
    mail_from_address: string;
    mail_from_name: string;
    mail_force_from: boolean;
    mail_force_from_name: boolean;
    mail_set_return_path: boolean;
    mail_host: string;
    mail_port: number;
    mail_encryption: string;
    mail_auto_tls: boolean;
    mail_auth_enabled: boolean;
    mail_username: string;
    has_password: boolean;
    mail_admin_recipient: string;
}

interface Props {
    settings: Settings;
}

export default function Email({ settings }: Props) {
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        mail_from_address: settings.mail_from_address,
        mail_from_name: settings.mail_from_name,
        mail_force_from: settings.mail_force_from,
        mail_force_from_name: settings.mail_force_from_name,
        mail_set_return_path: settings.mail_set_return_path,
        mail_host: settings.mail_host,
        mail_port: settings.mail_port,
        mail_encryption: settings.mail_encryption,
        mail_auto_tls: settings.mail_auto_tls,
        mail_auth_enabled: settings.mail_auth_enabled,
        mail_username: settings.mail_username,
        mail_password: '',
        mail_admin_recipient: settings.mail_admin_recipient,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.email.update'));
    };

    const handleSendTest: FormEventHandler = (e) => {
        e.preventDefault();
        if (!testEmail) return;

        setSendingTest(true);
        window.axios.post(route('settings.email.test'), { test_email: testEmail })
            .then(() => {
                alert('Test email sent successfully!');
            })
            .catch((error) => {
                alert('Failed to send test email: ' + (error.response?.data?.message || error.message));
            })
            .finally(() => {
                setSendingTest(false);
            });
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Email Settings" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Email Settings</h2>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Sender Settings */}
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">Sender Settings</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        From Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => setData('mail_from_address', e.target.value)}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                    {errors.mail_from_address && (
                                        <div className="text-red-400 text-sm mt-1">{errors.mail_from_address}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        From Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mail_from_name}
                                        onChange={(e) => setData('mail_from_name', e.target.value)}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                    {errors.mail_from_name && (
                                        <div className="text-red-400 text-sm mt-1">{errors.mail_from_name}</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.mail_force_from}
                                        onChange={(e) => setData('mail_force_from', e.target.checked)}
                                        className="rounded border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                    />
                                    <span className="ml-2 text-sm text-stone-400">
                                        Force From Email (Recommended Settings: Enable)
                                    </span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.mail_force_from_name}
                                        onChange={(e) => setData('mail_force_from_name', e.target.checked)}
                                        className="rounded border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                    />
                                    <span className="ml-2 text-sm text-stone-400">
                                        Force Sender Name
                                    </span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.mail_set_return_path}
                                        onChange={(e) => setData('mail_set_return_path', e.target.checked)}
                                        className="rounded border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                    />
                                    <span className="ml-2 text-sm text-stone-400">
                                        Set the return-path to match the From Email
                                    </span>
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Admin Recipient Email
                                </label>
                                <input
                                    type="email"
                                    value={data.mail_admin_recipient}
                                    onChange={(e) => setData('mail_admin_recipient', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                />
                                <p className="text-sm text-stone-500 mt-1">
                                    Email address to receive admin notifications (e.g., signed contracts)
                                </p>
                                {errors.mail_admin_recipient && (
                                    <div className="text-red-400 text-sm mt-1">{errors.mail_admin_recipient}</div>
                                )}
                            </div>
                        </div>

                        {/* SMTP Settings */}
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">SMTP Settings</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        SMTP Host
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mail_host}
                                        onChange={(e) => setData('mail_host', e.target.value)}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                    {errors.mail_host && (
                                        <div className="text-red-400 text-sm mt-1">{errors.mail_host}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        SMTP Port
                                    </label>
                                    <input
                                        type="number"
                                        value={data.mail_port}
                                        onChange={(e) => setData('mail_port', parseInt(e.target.value))}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                    {errors.mail_port && (
                                        <div className="text-red-400 text-sm mt-1">{errors.mail_port}</div>
                                    )}
                                    <p className="text-sm text-stone-500 mt-1">
                                        SSL usually uses port 465, TLS usually uses 587 or 25
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Encryption
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="none"
                                            checked={data.mail_encryption === 'none'}
                                            onChange={(e) => setData('mail_encryption', e.target.value)}
                                            className="text-plutz-tan focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">None</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="ssl"
                                            checked={data.mail_encryption === 'ssl'}
                                            onChange={(e) => setData('mail_encryption', e.target.value)}
                                            className="text-plutz-tan focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">SSL</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="tls"
                                            checked={data.mail_encryption === 'tls'}
                                            onChange={(e) => setData('mail_encryption', e.target.value)}
                                            className="text-plutz-tan focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">TLS</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.mail_auto_tls}
                                        onChange={(e) => setData('mail_auto_tls', e.target.checked)}
                                        className="rounded border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                    />
                                    <span className="ml-2 text-sm text-stone-400">
                                        Use Auto TLS (By default, the TLS encryption would be used if the server supports it. On some servers, it could be a problem and may need to be disabled.)
                                    </span>
                                </label>
                            </div>

                            <div className="mt-6">
                                <label className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        checked={data.mail_auth_enabled}
                                        onChange={(e) => setData('mail_auth_enabled', e.target.checked)}
                                        className="rounded border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                    />
                                    <span className="ml-2 text-sm text-stone-400 font-medium">
                                        Authentication (If you need to provide your SMTP server's credentials (username and password) enable the authentication, in most cases this is required.)
                                    </span>
                                </label>

                                {data.mail_auth_enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                                SMTP Username
                                            </label>
                                            <input
                                                type="text"
                                                value={data.mail_username}
                                                onChange={(e) => setData('mail_username', e.target.value)}
                                                className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            />
                                            {errors.mail_username && (
                                                <div className="text-red-400 text-sm mt-1">{errors.mail_username}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                                SMTP Password
                                            </label>
                                            <input
                                                type="password"
                                                value={data.mail_password}
                                                onChange={(e) => setData('mail_password', e.target.value)}
                                                placeholder={settings.has_password ? '••••••••••' : 'Enter password'}
                                                className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            />
                                            <p className="text-sm text-stone-500 mt-1">
                                                {settings.has_password 
                                                    ? 'Leave blank to keep existing password'
                                                    : 'This input will be securely encrypted using WP SALTS as encryption keys before saving'}
                                            </p>
                                            {errors.mail_password && (
                                                <div className="text-red-400 text-sm mt-1">{errors.mail_password}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Test Email */}
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">Send Test Email</h3>
                            
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="Enter email address to send test"
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !testEmail}
                                    className="px-4 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-700 disabled:opacity-50"
                                >
                                    {sendingTest ? 'Sending...' : 'Send Test'}
                                </button>
                            </div>
                            <p className="text-sm text-stone-500 mt-2">
                                Send a test email to verify your SMTP settings are working correctly.
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
        </AuthenticatedLayout>
    );
}
