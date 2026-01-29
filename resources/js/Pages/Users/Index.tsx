import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    is_band_member: boolean;
    roles: Role[];
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
}

export default function Index({ users }: Props) {
    const handleDelete = (userId: number, userName: string) => {
        if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
            router.delete(route('users.destroy', userId));
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Users" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">User Management</h2>
                    <Link href={route('users.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">Add User</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {users.data.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No users found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Band Member</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-stone-900/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-plutz-cream">
                                                {user.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {user.roles.length > 0 ? (
                                                    <span className="inline-flex rounded-full bg-plutz-tan/20 px-2 py-1 text-xs font-semibold text-plutz-tan">
                                                        {user.roles[0].name}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-500">No role</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {user.is_band_member ? (
                                                    <span className="inline-flex rounded-full bg-green-500/100/10 px-2 py-1 text-xs font-semibold text-green-400">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-stone-800 px-2 py-1 text-xs font-semibold text-plutz-cream">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={route('users.edit', user.id)}
                                                    className="mr-3 text-plutz-tan hover:text-plutz-tan"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
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
