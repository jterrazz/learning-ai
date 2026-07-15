import { beforeEach, describe, expect, it } from 'vitest';
import { type DeepMockProxy, mock } from 'vitest-mock-extended';

import { Account } from '../../../../domain/account.entity.js';
import { Transaction, TransactionCategory } from '../../../../domain/transaction.entity.js';
import { type TransactionCategorizerAgentPort } from '../../../ports/outbound/agents/transaction-categorizer.agent.js';
import { type AccountRepositoryPort } from '../../../ports/outbound/persistence/account-repository.port.js';
import { type TransactionRepositoryPort } from '../../../ports/outbound/persistence/transaction-repository.port.js';
import { type GetAccountsParams, GetAccountsUseCase } from '../get-accounts.use-case.js';

const createParams = (overrides: Partial<GetAccountsParams> = {}): GetAccountsParams => ({
    currency: undefined,
    ...overrides,
});

describe('GetAccountsUseCase', () => {
    let repository: DeepMockProxy<AccountRepositoryPort>;
    let useCase: GetAccountsUseCase;
    let transactionsRepository: DeepMockProxy<TransactionRepositoryPort>;
    let categorizerAgent: DeepMockProxy<TransactionCategorizerAgentPort>;

    const sampleAccounts = [
        new Account({
            balance: 1000,
            bic: 'REVOGB21',
            country: 'GB',
            currency: 'GBP',
            iban: 'GB29NWBK60161331926819',
            name: 'Personal',
        }),
        new Account({
            balance: 2000,
            bic: 'DEUTDEFF',
            country: 'DE',
            currency: 'EUR',
            iban: 'DE89370400440532013000',
            name: 'Savings',
        }),
    ];

    beforeEach(() => {
        repository = mock<AccountRepositoryPort>();
        transactionsRepository = mock<TransactionRepositoryPort>();
        categorizerAgent = mock<TransactionCategorizerAgentPort>();
        useCase = new GetAccountsUseCase(repository, transactionsRepository, categorizerAgent);
        repository.findMany.mockResolvedValue(sampleAccounts);
        transactionsRepository.findMany.mockResolvedValue([]);
        categorizerAgent.categorize.mockResolvedValue({});
    });

    it('should return accounts from repository', async () => {
        const result = await useCase.execute(createParams());

        expect(repository.findMany).toHaveBeenCalledWith({ currency: undefined });
        expect(result.accounts).toEqual(
            sampleAccounts.map((account) => ({ account, transactions: [] })),
        );
    });

    it('should forward currency filter to repository', async () => {
        const currency = 'EUR';
        await useCase.execute(createParams({ currency }));

        expect(repository.findMany).toHaveBeenCalledWith({ currency });
    });

    // New test ensure transactions fetched
    it('should fetch transactions for each account', async () => {
        const tx1 = new Transaction({
            accountIban: sampleAccounts[0].iban,
            amount: -50,
            currency: 'GBP',
            date: '2024-06-20',
            description: 'Groceries',
            id: '1cf1e470-1862-4eaf-9f75-c94d4a085abc',
        });
        transactionsRepository.findMany.mockResolvedValue([tx1]);

        const result = await useCase.execute(createParams());

        expect(transactionsRepository.findMany).toHaveBeenCalledWith({
            accountIban: sampleAccounts[0].iban,
        });
        expect(result.accounts[0].transactions).toEqual([tx1]);
    });

    it('should categorize transactions for each account', async () => {
        const tx1 = new Transaction({
            accountIban: sampleAccounts[0].iban,
            amount: -50,
            currency: 'GBP',
            date: '2024-06-20',
            description: 'Groceries',
            id: '1cf1e470-1862-4eaf-9f75-c94d4a085abc',
        });
        transactionsRepository.findMany.mockResolvedValue([tx1]);
        categorizerAgent.categorize.mockResolvedValue({ [tx1.id]: TransactionCategory.GROCERIES });

        const result = await useCase.execute(createParams());

        expect(categorizerAgent.categorize).toHaveBeenCalledTimes(1);
        expect(result.accounts[0].transactions[0].category).toEqual(TransactionCategory.GROCERIES);
    });
});
