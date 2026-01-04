import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface PerformanceType {
    id: number;
    name: string;
    is_active: boolean;
    inquiries_count: number;
    incomes_count: number;
}

interface Props {
    performanceTypes: PerformanceType[];
}

export default function Index({ performanceTypes }: Props) {
    const handleDelete = (performanceTypeId: number, usageCount: number) => {
        if (usageCount > 0) {
            alert('Cannot delete performance type that is in use. Please deactivate it instead.');
            return;
        }

        if (confirm('Are you sure you want to delete this performance type?')) {
            router.delete(route('performance-types.destroy', performanceTypeId));
        }
    };

    const toggleActive = (performanceType: PerformanceType) => {
        router.patch(route('performance-types.update', performanceType.id), {
            name: performanceType.name,
            is_active: !performanceType.is_active,
        }, {
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Performance Types
                    </h2>
                    <Link
                        href={route('performance-types.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        New Performance Type
                    </Link>
                </div>
            }
        >
            <Head title="Performance Types" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {performanceTypes.length === 0 ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-500">No performance types found.</p>
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
                                    {performanceTypes.map((performanceType) => (
                                        <tr key={performanceType.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {performanceType.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => toggleActive(performanceType)}
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        performanceType.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {performanceType.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {performanceType.inquiries_count + performanceType.incomes_count > 0 ? (
                                                    <span>
                                                        {performanceType.inquiries_count} inquiries, {performanceType.incomes_count} incomes
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Not used</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('performance-types.edit', performanceType.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(
                                                            performanceType.id,
                                                            performanceType.inquiries_count + performanceType.incomes_count
                                                        )}
                                                        className={`${
                                                            performanceType.inquiries_count + performanceType.incomes_count > 0
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                        disabled={performanceType.inquiries_count + performanceType.incomes_count > 0}
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
