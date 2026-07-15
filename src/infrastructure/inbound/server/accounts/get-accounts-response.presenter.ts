import { type GetAccountsResult } from '../../../../application/use-cases/accounts/get-accounts.use-case.js';
import { type Account } from '../../../../domain/account.entity.js';
import { type Transaction } from '../../../../domain/transaction.entity.js';

type HttpAccount = {
    balance: number;
    bic: string;
    country: string;
    currency: string;
    iban: string;
    name: string;
    transactions: HttpTransaction[];
};

type HttpAccountResponse = {
    accounts: HttpAccount[];
};

type HttpTransaction = {
    amount: number;
    category?: string;
    currency: string;
    date: string;
    description: string;
    id: string;
};

/**
 * Handles response formatting for GET /accounts endpoint
 * Transforms domain objects to HTTP response format with clean account structure
 */
export class GetAccountsResponsePresenter {
    present(result: GetAccountsResult): HttpAccountResponse {
        const accounts: HttpAccount[] = result.accounts.map((item) =>
            this.mapAccountWithTransactionsToResponse(item.account, item.transactions),
        );

        return {
            accounts,
        };
    }

    private mapAccountWithTransactionsToResponse(
        account: Account,
        transactions: Transaction[],
    ): HttpAccount {
        return {
            balance: account.balance,
            bic: account.bic,
            country: account.country,
            currency: account.currency,
            iban: account.iban,
            name: account.name,
            transactions: transactions.map(this.mapTransactionToResponse),
        };
    }

    private mapTransactionToResponse(transaction: Transaction): HttpTransaction {
        return {
            amount: transaction.amount,
            category: transaction.category,
            currency: transaction.currency,
            date: transaction.date,
            description: transaction.description,
            id: transaction.id,
        };
    }
}
