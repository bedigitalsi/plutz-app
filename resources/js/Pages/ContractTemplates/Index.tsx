import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ContractTemplate {
    id: number;
    name: string;
    markdown: string;
    is_active: boolean;
    updated_at: string;
}

interface Props extends PageProps {
    templates: ContractTemplate[];
}

export default function Index({ auth, templates }: Props) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the template "${name}"?`)) {
            router.delete(route('contract-templates.destroy', id));
        }
    };

    const handleActivate = (id: number) => {
        router.patch(route('contract-templates.activate', id));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Contract Templates" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Contract Templates</h2>
                    <Link href={route('settings.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">Back to Settings</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {templates.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-stone-500 mb-4">No templates found</p>
                                    <Link
                                        href={route('contract-templates.create')}
                                        className="text-plutz-tan hover:text-plutz-tan"
                                    >
                                        Create your first template
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-plutz-tan/10">
                                        <thead className="bg-stone-900/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                                    Last Updated
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-plutz-surface divide-y divide-plutz-tan/10">
                                            {templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-plutz-cream">
                                                            {template.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {template.is_active ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/100/10 text-green-400">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-800 text-plutz-cream">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                        {new Date(template.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <Link
                                                                href={route('contract-templates.edit', template.id)}
                                                                className="text-plutz-tan hover:text-plutz-tan"
                                                            >
                                                                Edit
                                                            </Link>
                                                            {!template.is_active && (
                                                                <button
                                                                    onClick={() => handleActivate(template.id)}
                                                                    className="text-green-400 hover:text-green-400"
                                                                >
                                                                    Set Active
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(template.id, template.name)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
