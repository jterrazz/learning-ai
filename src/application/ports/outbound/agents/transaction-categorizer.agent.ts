import {
    type Transaction,
    type TransactionCategory,
} from '../../../../domain/transaction.entity.js';

export interface TransactionCategorizerAgentPort {
    /**
     * Analyze a list of transactions and returns a mapping from transaction id to detected category.
     */
    run: (transactions: Transaction[]) => Promise<Record<string, TransactionCategory>>;
}
