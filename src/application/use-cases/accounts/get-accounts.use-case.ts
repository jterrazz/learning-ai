import { type Account } from '../../../domain/account.entity.js';
import { type Transaction } from '../../../domain/transaction.entity.js';
import { type TransactionCategorizerAgentPort } from '../../ports/outbound/agents/transaction-categorizer.agent.js';
import { type AccountRepositoryPort } from '../../ports/outbound/persistence/account-repository.port.js';
import { type TransactionRepositoryPort } from '../../ports/outbound/persistence/transaction-repository.port.js';

/**
 * Result returned by GetAccountsUseCase containing the raw domain accounts and
 * additional pagination metadata.
 */
interface AccountWithTransactions {
    account: Account;
    transactions: Transaction[];
}

/**
 * Input parameters for the GetAccounts use case using domain value objects
 */
export interface GetAccountsParams {
    currency?: string;
}

export interface GetAccountsResult {
    accounts: AccountWithTransactions[];
}

export class GetAccountsUseCase {
    constructor(
        private readonly accountRepository: AccountRepositoryPort,
        private readonly transactionRepository: TransactionRepositoryPort,
        private readonly transactionCategorizer: TransactionCategorizerAgentPort,
    ) {}

    async execute(params: GetAccountsParams): Promise<GetAccountsResult> {
        const { currency } = params;

        const accounts = await this.accountRepository.findMany({
            currency,
        });

        const accountsWithTransactions: AccountWithTransactions[] = await Promise.all(
            accounts.map(async (account) => ({
                account,
                transactions: await this.transactionRepository.findMany({
                    accountIban: account.iban,
                }),
            })),
        );

        // Flatten transactions for categorization
        const allTransactions = accountsWithTransactions.flatMap((item) => item.transactions);

        const categorizationMap = await this.transactionCategorizer.run(allTransactions);

        // Assign category back to transactions
        accountsWithTransactions.forEach((item) => {
            item.transactions.forEach((tx) => {
                const category = categorizationMap[tx.id];
                if (category) {
                    tx.category = category;
                }
            });
        });

        return { accounts: accountsWithTransactions };
    }
}
