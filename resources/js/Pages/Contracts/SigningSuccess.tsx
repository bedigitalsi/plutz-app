import { Head } from '@inertiajs/react';

interface Contract {
    id: number;
    client_name: string;
    signer_name: string;
    signer_email: string;
}

interface Props {
    contract: Contract;
}

export default function SigningSuccess({ contract }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <Head title="Contract Signed Successfully" />
            <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Contract Signed Successfully!
                </h1>
                
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700">
                        <strong>Signed by:</strong> {contract.signer_name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                        {contract.signer_email}
                    </p>
                </div>

                <p className="text-gray-600 mb-6">
                    Thank you for signing the contract. A copy with your signature will be sent to your email address shortly.
                </p>

                <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-500">
                        You will receive an email with the signed PDF document within a few minutes.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        You can now safely close this window.
                    </p>
                </div>
            </div>
        </div>
    );
}
