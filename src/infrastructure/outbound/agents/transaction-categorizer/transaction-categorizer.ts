import { type LoggerPort } from '@jterrazz/telemetry';
import { generateText, type LanguageModel, Output } from 'ai';
import { z } from 'zod';

import { type TransactionCategorizerAgentPort } from '../../../../application/ports/outbound/agents/transaction-categorizer.agent.js';
import { type Transaction, TransactionCategory } from '../../../../domain/transaction.entity.js';
import { buildPrompt, buildSystemPrompt } from './transaction-categorizer.prompt.js';

export class TransactionCategorizerAgentAdapter implements TransactionCategorizerAgentPort {
    static readonly SCHEMA = z.object({
        categories: z.record(z.string(), z.enum(TransactionCategory)),
    });

    public readonly name = 'TransactionCategorizerAgent';

    constructor(
        private readonly model: LanguageModel,
        private readonly logger: LoggerPort,
    ) {}

    async run(transactions: Transaction[]): Promise<Record<string, TransactionCategory>> {
        if (transactions.length === 0) {
            return {};
        }

        this.logger.info(`Categorizing ${transactions.length} transactions`);

        const result = await generateText({
            model: this.model,
            output: Output.object({ schema: TransactionCategorizerAgentAdapter.SCHEMA }),
            prompt: buildPrompt({
                transactionsJson:
                    TransactionCategorizerAgentAdapter.buildTransactionsJson(transactions),
            }),
            system: buildSystemPrompt(),
        });

        return result.output.categories;
    }

    // Data prep only — map to flat records, JSON.stringify. No prose.
    private static buildTransactionsJson(transactions: Transaction[]): string {
        return JSON.stringify(
            transactions.map((t) => ({
                amount: t.amount,
                currency: t.currency,
                description: t.description,
                id: t.id,
            })),
        );
    }
}
