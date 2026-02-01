export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    locale?: string;
    hide_prices?: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        permissions: string[];
    };
    locale: string;
    translations: Record<string, string>;
};
