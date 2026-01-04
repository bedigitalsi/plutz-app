import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface CostType {
    id: number;
    name: string;
    is_active: boolean;
    group_costs_count: number;
}

interface Props {
    costTypes: CostType[];
}

export default function Index({ costTypes }: Props) {
    const handleDelete = (costTypeId: number, usageCount: number) => {
        if (usageCount > 0) {
            alert('Cannot delete cost type that is in use. Please deactivate it instead.');
            return;
        }

        if (confirm('Are you sure you want to delete this cost type?')) {
            router.delete(route('cost-types.destroy', costTypeId));
        }
    };

    const toggleActive = (costType: CostType) => {
        router.patch(route('cost-types.update', costType.id), {
            name: costType.name,
            is_active: !costType.is_active,
        }, {
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Cost Types
                    </h2>
                    <Link
                        href={route('cost-types.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        New Cost Type
                    </Link>
                </div>
            }
        >
            <Head title="Cost Types" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {costTypes.length === 0 ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-500">No cost types found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Usage
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {costTypes.map((costType) => (
                                        <tr key={costType.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {costType.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => toggleActive(costType)}
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        costType.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {costType.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {costType.group_costs_count > 0 ? (
                                                    <span>
                                                        {costType.group_costs_count} group cost(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Not used</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('cost-types.edit', costType.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(
                                                            costType.id,
                                                            costType.group_costs_count
                                                        )}
                                                        className={`${
                                                            costType.group_costs_count > 0
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                        disabled={costType.group_costs_count > 0}
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
        </AuthenticatedLayout>
    );
}
