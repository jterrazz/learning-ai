import type { LanguageModelV4 } from '@ai-sdk/provider';
import { createSchemaPrompt, generateStructured } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/telemetry';
import { z } from 'zod';

import { type TransactionCategorizerAgentPort } from '../../../application/ports/outbound/agents/transaction-categorizer.agent.js';
import { type Transaction, TransactionCategory } from '../../../domain/transaction.entity.js';

export class TransactionCategorizerAgentAdapter implements TransactionCategorizerAgentPort {
    static readonly SCHEMA = z.object({
        categories: z.record(z.string(), z.enum(TransactionCategory)),
    });

    static readonly SYSTEM_PROMPT = [
        'You are an expert financial categorization engine.',
        'You receive an array of transactions and must return a JSON mapping of transaction IDs to a suitable category enum value: GROCERIES, SALARY, COFFEE, OTHER. Only output valid JSON conforming to the schema.',
        createSchemaPrompt(TransactionCategorizerAgentAdapter.SCHEMA),
    ].join('\n\n');

    public readonly name = 'TransactionCategorizerAgent';

    constructor(
        private readonly model: LanguageModelV4,
        private readonly logger: LoggerPort,
    ) {}

    static readonly USER_PROMPT = (transactions: Transaction[]) =>
        [
            'Transactions',
            JSON.stringify(
                transactions.map((t) => ({
                    amount: t.amount,
                    currency: t.currency,
                    description: t.description,
                    id: t.id,
                })),
            ),
            'TASK: Categorize each transaction and return a JSON object mapping transaction IDs to category values.',
        ].join('\n\n');

    async categorize(transactions: Transaction[]): Promise<Record<string, TransactionCategory>> {
        if (transactions.length === 0) {
            return {};
        }

        this.logger.info(`Categorizing ${transactions.length} transactions`);

        const result = await generateStructured({
            model: this.model,
            prompt: TransactionCategorizerAgentAdapter.USER_PROMPT(transactions),
            schema: TransactionCategorizerAgentAdapter.SCHEMA,
            system: TransactionCategorizerAgentAdapter.SYSTEM_PROMPT,
        });

        if (!result.success) {
            throw new Error(
                `Categorizer agent failed (${result.error.code}): ${result.error.message}`,
            );
        }

        return result.data.categories;
    }
}
