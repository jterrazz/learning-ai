import { type Transaction } from '../../../../domain/transaction.entity.js';

export interface FindManyOptions {
    accountIban?: string;
}

export interface TransactionRepositoryPort {
    /**
     * Find transactions matching the given criteria
     */
    findMany: (options: FindManyOptions) => Promise<Transaction[]>;
}
