import { z } from 'zod/v4';

export enum TransactionCategory {
    COFFEE = 'COFFEE',
    GROCERIES = 'GROCERIES',
    OTHER = 'OTHER',
    SALARY = 'SALARY',
}

const transactionSchema = z.object({
    accountIban: z.string(),
    amount: z.number(),
    category: z.nativeEnum(TransactionCategory).optional(),
    currency: z.string(),
    date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: 'Invalid date',
    }),
    description: z.string(),
    id: z.string().uuid(),
});

export type TransactionProps = z.input<typeof transactionSchema>;

export class Transaction {
    public readonly accountIban: string;
    public readonly amount: number;
    public category?: TransactionCategory;
    public readonly currency: string;
    public readonly date: string;
    public readonly description: string;
    public readonly id: string;

    constructor(data: TransactionProps) {
        const parsed = transactionSchema.safeParse(data);

        if (!parsed.success) {
            throw new Error(`Invalid transaction data: ${parsed.error.message}`);
        }

        const t = parsed.data;
        this.id = t.id;
        this.accountIban = t.accountIban;
        this.amount = t.amount;
        this.currency = t.currency;
        this.date = t.date;
        this.description = t.description;
        this.category = t.category;
    }
}
