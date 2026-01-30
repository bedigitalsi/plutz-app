import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

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
    const { t } = useTranslation();
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
            <Head title={t('settings.email_page_title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('settings.email_page_title')}</h2>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Sender Settings */}
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('settings.sender_settings')}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        {t('settings.from_email')}
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
                                        {t('settings.from_name')}
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
                                        {t('settings.force_from')}
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
                                        {t('settings.force_sender_name')}
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
                                        {t('settings.return_path')}
                                    </span>
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('settings.admin_recipient')}
                                </label>
                                <input
                                    type="email"
                                    value={data.mail_admin_recipient}
                                    onChange={(e) => setData('mail_admin_recipient', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                />
                                <p className="text-sm text-stone-500 mt-1">
                                    {t('settings.admin_recipient_help')}
                                </p>
                                {errors.mail_admin_recipient && (
                                    <div className="text-red-400 text-sm mt-1">{errors.mail_admin_recipient}</div>
                                )}
                            </div>
                        </div>

                        {/* SMTP Settings */}
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('settings.smtp_settings')}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        {t('settings.smtp_host')}
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
                                        {t('settings.smtp_port')}
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
                                        {t('settings.smtp_port_help')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('settings.encryption')}
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
                                        <span className="ml-2 text-sm text-stone-400">{t('settings.none')}</span>
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
                                        {t('settings.auto_tls')}
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
                                        {t('settings.authentication')}
                                    </span>
                                </label>

                                {data.mail_auth_enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                                {t('settings.smtp_username')}
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
                                                {t('settings.smtp_password')}
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
                                                    ? t('settings.password_help_existing')
                                                    : t('settings.password_help_new')}
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
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('settings.test_email')}</h3>
                            
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder={t('settings.test_placeholder')}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !testEmail}
                                    className="px-4 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-700 disabled:opacity-50"
                                >
                                    {sendingTest ? t('settings.test_sending') : t('settings.test_button')}
                                </button>
                            </div>
                            <p className="text-sm text-stone-500 mt-2">
                                {t('settings.test_help')}
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                            >
                                {processing ? t('common.loading') : t('settings.save_settings')}
                            </button>
                        </div>
                    </form>
                </div>
        </AuthenticatedLayout>
    );
}
