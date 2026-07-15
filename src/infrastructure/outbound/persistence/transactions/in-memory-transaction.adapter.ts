import {
    type FindManyOptions,
    type TransactionRepositoryPort,
} from '../../../../application/ports/outbound/persistence/transaction-repository.port.js';
import { type Transaction } from '../../../../domain/transaction.entity.js';
import {
    type InMemoryTransactionRecord,
    mapTransactionToDomain,
    mapTransactionToPersistence,
} from './in-memory-transaction.mapper.js';

/**
 * In-memory implementation of TransactionRepositoryPort for testing and development.
 */
export class InMemoryTransactionAdapter implements TransactionRepositoryPort {
    private readonly records: InMemoryTransactionRecord[];

    constructor() {
        this.records = [
            {
                accountIban: 'GB29NWBK60161331926819',
                amount: -50,
                currency: 'GBP',
                date: '2024-06-20',
                description: 'Groceries',
                id: '1cf1e470-1862-4eaf-9f75-c94d4a085abc',
            },
            {
                accountIban: 'GB29NWBK60161331926819',
                amount: 2000,
                currency: 'GBP',
                date: '2024-06-18',
                description: 'Salary',
                id: '2d4e11b2-1f0b-4e93-9d48-abc043b7b5ae',
            },
            {
                accountIban: 'DE89370400440532013000',
                amount: -20,
                currency: 'EUR',
                date: '2024-06-19',
                description: 'Coffee',
                id: '3e63fcd0-19bb-4cfd-bb5c-5a6e4f7bf76a',
            },
        ];
    }

    async findMany(options: FindManyOptions = {}): Promise<Transaction[]> {
        const { accountIban } = options;

        let filtered = this.records;
        if (accountIban) {
            filtered = filtered.filter((record) => record.accountIban === accountIban);
        }

        return filtered.map(mapTransactionToDomain);
    }

    insert(transaction: Transaction): void {
        this.records.push(mapTransactionToPersistence(transaction));
    }
}
