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
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Cost Types" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Cost Types</h2>
                    <Link href={route('cost-types.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">New Cost Type</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {costTypes.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No cost types found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Usage
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                    {costTypes.map((costType) => (
                                        <tr key={costType.id} className="hover:bg-stone-900/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-plutz-cream">
                                                {costType.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => toggleActive(costType)}
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        costType.is_active
                                                            ? 'bg-green-500/100/10 text-green-400 hover:bg-green-500/100/20'
                                                            : 'bg-stone-800 text-plutz-cream hover:bg-plutz-tan/20'
                                                    }`}
                                                >
                                                    {costType.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {costType.group_costs_count > 0 ? (
                                                    <span>
                                                        {costType.group_costs_count} group cost(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-500">Not used</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('cost-types.edit', costType.id)}
                                                        className="text-plutz-tan hover:text-plutz-tan"
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
                                                                ? 'text-stone-500 cursor-not-allowed'
                                                                : 'text-red-400 hover:text-red-300'
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
        </AuthenticatedLayout>
    );
}
