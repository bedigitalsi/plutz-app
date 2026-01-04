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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Contract Templates</h2>
                    <div className="flex space-x-3">
                        <Link
                            href={route('settings.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Settings
                        </Link>
                        <Link
                            href={route('contract-templates.create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Create Template
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Contract Templates" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {templates.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No templates found</p>
                                    <Link
                                        href={route('contract-templates.create')}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Create your first template
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Updated
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {template.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {template.is_active ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(template.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <Link
                                                                href={route('contract-templates.edit', template.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                            {!template.is_active && (
                                                                <button
                                                                    onClick={() => handleActivate(template.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Set Active
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(template.id, template.name)}
                                                                className="text-red-600 hover:text-red-900"
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
            </div>
        </AuthenticatedLayout>
    );
}
