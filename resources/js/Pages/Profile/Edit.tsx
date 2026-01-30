import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('profile.title')} />

            <div className="max-w-[1200px] mx-auto w-full p-6">
                <h2 className="text-2xl font-serif text-plutz-cream mb-6">{t('profile.title')}</h2>

                <div className="space-y-6">
                    <div className="bg-plutz-surface p-6 shadow-sm rounded-xl border border-plutz-tan/10">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-plutz-surface p-6 shadow-sm rounded-xl border border-plutz-tan/10">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-plutz-surface p-6 shadow-sm rounded-xl border border-plutz-tan/10">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
