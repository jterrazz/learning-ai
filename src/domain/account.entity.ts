import { z } from 'zod';

const accountSchema = z.object({
    balance: z.number(),
    bic: z.string(),
    country: z.string(),
    currency: z.string(),
    iban: z.string(),
    name: z.string(),
});

export type AccountProps = z.input<typeof accountSchema>;

export class Account {
    public readonly balance: number;
    public readonly bic: string;
    public readonly country: string;
    public readonly currency: string;
    public readonly iban: string;
    public readonly name: string;

    public constructor(data: AccountProps) {
        const result = accountSchema.safeParse(data);

        if (!result.success) {
            throw new Error(`Invalid account data: ${result.error.message}`);
        }

        const validatedData = result.data;
        this.balance = validatedData.balance;
        this.bic = validatedData.bic;
        this.country = validatedData.country;
        this.currency = validatedData.currency;
        this.iban = validatedData.iban;
        this.name = validatedData.name;
    }
}
