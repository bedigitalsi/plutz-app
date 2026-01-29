import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-plutz-dark pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <img 
                        src="/images/logo-plutz-25.svg" 
                        alt="Plutz Logo" 
                        className="h-20 w-auto" 
                    />
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden rounded-xl bg-plutz-cream px-8 py-6 shadow-warm-lg sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
