import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Token {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    created_at: string;
}

interface Props {
    tokens: Token[];
    availableAbilities: string[];
}

export default function ApiKeys({ tokens, availableAbilities }: Props) {
    const { t } = useTranslation();
    const flash = usePage().props.flash as { success?: string; plainToken?: string };
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abilities: [] as string[],
    });

    const toggleAbility = (ability: string) => {
        setData('abilities', data.abilities.includes(ability)
            ? data.abilities.filter(a => a !== ability)
            : [...data.abilities, ability]
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.api-keys.store'), {
            onSuccess: () => reset(),
        });
    };

    const copyToken = () => {
        if (flash.plainToken) {
            navigator.clipboard.writeText(flash.plainToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const revokeToken = (tokenId: number) => {
        if (confirm(t('settings.api_keys_revoke_confirm'))) {
            router.delete(route('settings.api-keys.destroy', tokenId));
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('settings.api_keys_page_title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('settings.api_keys_page_title')}</h2>
                    <Link href={route('settings.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('settings.back_to_settings')}</Link>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto w-full p-6 space-y-6">
                {/* Token display (shown once after creation) */}
                {flash.plainToken && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-green-400 mb-2">{t('settings.api_keys_token_created')}</h3>
                        <p className="text-sm text-green-300 mb-4">{t('settings.api_keys_token_warning')}</p>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 bg-plutz-dark rounded-lg px-4 py-3 text-sm text-plutz-cream font-mono break-all">
                                {flash.plainToken}
                            </code>
                            <button
                                onClick={copyToken}
                                className="shrink-0 inline-flex items-center rounded-lg bg-plutz-tan px-4 py-2 text-xs font-semibold uppercase tracking-widest text-plutz-dark hover:bg-plutz-tan-light"
                            >
                                {copied ? t('settings.api_keys_copied') : t('settings.api_keys_copy')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Create new key */}
                <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('settings.api_keys_create')}</h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">
                                {t('settings.api_keys_name')}
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('settings.api_keys_name_placeholder')}
                                className="w-full max-w-md rounded-lg border-stone-700 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                {t('settings.api_keys_abilities')}
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {availableAbilities.map((ability) => (
                                    <label key={ability} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.abilities.includes(ability)}
                                            onChange={() => toggleAbility(ability)}
                                            className="rounded border-stone-600 bg-plutz-dark text-plutz-tan focus:ring-plutz-tan"
                                        />
                                        <span className="text-sm text-stone-300">{ability}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.abilities && <p className="text-red-400 text-sm mt-1">{errors.abilities}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-lg bg-plutz-tan px-4 py-2 text-xs font-semibold uppercase tracking-widest text-plutz-dark transition duration-150 ease-in-out hover:bg-plutz-tan-light focus:bg-plutz-tan-light focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 active:bg-plutz-tan-light disabled:opacity-50"
                        >
                            {t('settings.api_keys_create')}
                        </button>
                    </form>
                </div>

                {/* Existing keys */}
                <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('settings.api_keys_existing')}</h3>
                    {tokens.length === 0 ? (
                        <p className="text-stone-500">{t('settings.api_keys_no_keys')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-700">
                                        <th className="text-left py-3 px-2 text-stone-400 font-medium">{t('settings.api_keys_name')}</th>
                                        <th className="text-left py-3 px-2 text-stone-400 font-medium">{t('settings.api_keys_abilities')}</th>
                                        <th className="text-left py-3 px-2 text-stone-400 font-medium">{t('settings.api_keys_last_used')}</th>
                                        <th className="text-left py-3 px-2 text-stone-400 font-medium">{t('settings.api_keys_created')}</th>
                                        <th className="text-right py-3 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token) => (
                                        <tr key={token.id} className="border-b border-stone-800">
                                            <td className="py-3 px-2 text-plutz-cream">{token.name}</td>
                                            <td className="py-3 px-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {token.abilities.map((ability) => (
                                                        <span key={ability} className="inline-block rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-300">
                                                            {ability}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-stone-400">
                                                {token.last_used_at
                                                    ? new Date(token.last_used_at).toLocaleDateString()
                                                    : t('settings.api_keys_never_used')}
                                            </td>
                                            <td className="py-3 px-2 text-stone-400">
                                                {new Date(token.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() => revokeToken(token.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                                                >
                                                    {t('settings.api_keys_revoke')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
